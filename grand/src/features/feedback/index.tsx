"use client";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  Accessibility,
  ArrowUpRight,
  Check,
  Frown,
  Heart,
  Landmark,
  LoaderCircle,
  Meh,
  MessageSquare,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import type { FeedbackInput, FeedbackReceipt } from "@/types";
import "./feedback.css";

const moods = [
  { value: 1, key: "poor", icon: Frown },
  { value: 2, key: "fair", icon: Meh },
  { value: 3, key: "good", icon: Smile },
  { value: 4, key: "great", icon: Smile },
  { value: 5, key: "amazing", icon: Heart },
] as const;
const topics = [
  { value: "experience", icon: Landmark },
  { value: "accessibility", icon: Accessibility },
  { value: "services", icon: MessageSquare },
] as const;

export function FeedbackForm() {
  const t = useTranslations("feedback");
  const id = useId();
  const [rating, setRating] = useState(0);
  const [category, setCategory] =
    useState<FeedbackInput["category"]>("experience");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [receipt, setReceipt] = useState<FeedbackReceipt | null>(null);
  const [promptNotice, setPromptNotice] = useState("");
  const request = useRef<AbortController | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  const confirmation = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const focusErrorSummary = useRef(false);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (focusErrorSummary.current && Object.keys(errors).length) {
      summary.current?.focus();
      focusErrorSummary.current = false;
    }
  }, [errors]);
  useEffect(() => {
    if (receipt) confirmation.current?.focus();
  }, [receipt]);

  const messageValid =
    message.trim().length >= 10 && message.trim().length <= 2000;
  const steps = [
    { label: t("progressRating"), complete: rating > 0 },
    { label: t("progressThoughts"), complete: messageValid },
    { label: t("progressConsent"), complete: consent },
  ];
  const completed = steps.filter((step) => step.complete).length;
  function clearError(field: string) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }
  function chooseRating(value: number) {
    setRating(value);
    clearError("rating");
  }
  function addPrompt(key: string) {
    const prompt = t(key);
    if (message.includes(prompt)) {
      setPromptNotice(t("promptAlreadyAdded"));
      textarea.current?.focus();
      return;
    }
    const next = message.trim() ? message.trimEnd() + "\n" + prompt : prompt;
    if (next.length > 2000) {
      setPromptNotice(t("promptLimit"));
      return;
    }
    setMessage(next);
    setPromptNotice(t("promptAdded"));
    if (next.trim().length >= 10) clearError("message");
    textarea.current?.focus();
    requestAnimationFrame(() =>
      textarea.current?.setSelectionRange(next.length, next.length),
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const next: Record<string, string> = {};
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      next.rating = t("ratingError");
    if (!messageValid) next.message = t("messageError");
    if (
      email.trim() &&
      (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        email.trim().length > 254)
    )
      next.email = t("emailError");
    if (!consent) next.consent = t("consentError");
    focusErrorSummary.current = Object.keys(next).length > 0;
    setErrors(next);
    setRequestError("");
    if (Object.keys(next).length) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    const payload: FeedbackInput = {
      rating,
      category,
      message: message.trim(),
      consent,
      ...(email.trim() ? { email: email.trim() } : {}),
    };
    try {
      const data = await apiRequest<FeedbackReceipt>("/feedback", {
        method: "POST",
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setReceipt(data);
    } catch {
      if (!controller.signal.aborted) setRequestError(t("requestError"));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  function reset() {
    setReceipt(null);
    setRating(0);
    setCategory("experience");
    setMessage("");
    setEmail("");
    setConsent(false);
    setErrors({});
    setRequestError("");
    setPromptNotice("");
  }

  if (receipt)
    return (
      <div className="feedback-success-scene">
        <div
          className="feedback-confirmation"
          ref={confirmation}
          tabIndex={-1}
          role="status"
        >
          <div className="feedback-success-decoration" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <span
                key={index}
                style={{ "--spark-index": index } as React.CSSProperties}
              />
            ))}
          </div>
          <div className="feedback-check" aria-hidden="true">
            <Check size={34} strokeWidth={1.8} />
          </div>
          <p className="eyebrow">
            {t(receipt.persisted ? "receivedEyebrow" : "demoEyebrow")}
          </p>
          <h1>{t(receipt.persisted ? "receivedTitle" : "demoTitle")}</h1>
          <p className="muted">
            {t(receipt.persisted ? "receivedDescription" : "demoDescription")}
          </p>
          <div className="feedback-receipt-mood">
            <Heart size={18} aria-hidden="true" />
            <span>{t("ratingSelected", { value: rating })}</span>
          </div>
          <p className="feedback-reference">
            {t("reference")}: <span dir="ltr">{receipt.id}</span>
          </p>
          <button
            type="button"
            className="button feedback-restart"
            onClick={reset}
          >
            {t("another")}
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
    );

  return (
    <div className="feedback-experience" data-rating={rating || undefined}>
      <header className="feedback-page-heading">
        <p className="eyebrow">
          <Sparkles size={16} aria-hidden="true" />
          {t("eyebrow")}
        </p>
        <h1>{t("heading")}</h1>
        <p>{t("pageIntro")}</p>
      </header>
      <div className="feedback-layout">
        <aside className="feedback-story">
          <div className="feedback-desert-art" aria-hidden="true">
            <span className="feedback-sun" />
            <svg viewBox="0 0 420 270" fill="none">
              <path
                d="M0 207 Q100 135 235 214 T420 192 V270 H0Z"
                fill="#d5a864"
              />
              <path
                d="M0 248 Q115 177 260 231 T420 218 V270 H0Z"
                fill="#edca88"
              />
              <path d="M112 207 191 78l81 136-81-35Z" fill="#bd7945" />
              <path d="m191 78 81 136-81-35Z" fill="#996039" />
              <path d="m54 224 44-73 47 77-47-21Z" fill="#e0b16b" />
              <path d="m98 151 47 77-47-21Z" fill="#c08b50" />
              <path d="M0 263q105-50 225-4t195-9v20H0Z" fill="#f8e2af" />
              <path
                d="M308 100h44m-22-22v44M55 72h18m-9-9v18"
                stroke="#9d6338"
                strokeWidth="1.5"
              />
            </svg>
            <div className="feedback-art-caption">
              <span>GEM</span>
              <span>{t("artCaption")}</span>
            </div>
          </div>
          <div className="feedback-story-copy">
            <span className="feedback-story-badge">
              <Heart size={14} aria-hidden="true" />
              {t("storyBadge")}
            </span>
            <h2>{t("storyTitle")}</h2>
            <p>{t("storyDescription")}</p>
          </div>
          <div className="feedback-progress-card">
            <div className="feedback-progress-heading">
              <strong>{t("progressTitle")}</strong>
              <span>
                {t("progressCount", { count: completed, total: steps.length })}
              </span>
            </div>
            <div
              className="feedback-progress"
              role="progressbar"
              aria-label={t("progressTitle")}
              aria-valuemin={0}
              aria-valuemax={steps.length}
              aria-valuenow={completed}
            >
              <span style={{ width: (completed / steps.length) * 100 + "%" }} />
            </div>
            <ul>
              {steps.map((step, index) => (
                <li key={index} className={step.complete ? "is-complete" : ""}>
                  <span className="feedback-progress-dot" aria-hidden="true">
                    {step.complete ? <Check size={12} /> : index + 1}
                  </span>
                  {step.label}
                </li>
              ))}
            </ul>
          </div>
          <p className="feedback-side-note">
            <ShieldCheck size={17} aria-hidden="true" />
            <span>{t("sideNote")}</span>
          </p>
        </aside>
        <form
          className="feedback-form"
          noValidate
          onSubmit={submit}
          aria-busy={busy}
        >
          <div className="feedback-form-header">
            <span className="feedback-form-symbol" aria-hidden="true">
              <MessageSquare size={21} />
            </span>
            <div>
              <h2>{t("formTitle")}</h2>
              <p className="muted">{t("description")}</p>
            </div>
          </div>
          {!!Object.keys(errors).length && (
            <div
              className="feedback-error-summary"
              ref={summary}
              tabIndex={-1}
              role="alert"
            >
              <strong>{t("validationTitle")}</strong>
              <ul>
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    <a href={"#" + id + "-" + field}>{error}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <fieldset className="feedback-fields" disabled={busy}>
            <legend className="sr-only">{t("formLabel")}</legend>
            <fieldset
              className="feedback-rating"
              id={id + "-rating"}
              role="radiogroup"
              tabIndex={-1}
              aria-invalid={!!errors.rating}
              aria-describedby={
                errors.rating ? id + "-rating-error" : undefined
              }
            >
              <legend>
                <span className="feedback-step" aria-hidden="true">
                  01
                </span>
                {t("ratingLabel")} <span className="feedback-required">*</span>
              </legend>
              <div className="feedback-moods">
                {moods.map((mood) => (
                  <label
                    key={mood.value}
                    className={
                      "feedback-mood" +
                      (mood.value === rating ? " is-selected" : "")
                    }
                    data-mood={mood.value}
                  >
                    <input
                      type="radio"
                      name={id + "-rating"}
                      value={mood.value}
                      checked={rating === mood.value}
                      onChange={() => chooseRating(mood.value)}
                      aria-label={t("ratingOption", { value: mood.value })}
                      required
                    />
                    <span className="feedback-mood-icon" aria-hidden="true">
                      <mood.icon size={29} strokeWidth={1.65} />
                    </span>
                    <span className="feedback-mood-label">
                      {t("moods." + mood.key)}
                    </span>
                    <span className="feedback-mood-value" aria-hidden="true">
                      {mood.value} <Star size={11} fill="currentColor" />
                    </span>
                    {mood.value === rating && (
                      <span className="feedback-mood-check" aria-hidden="true">
                        <Check size={11} />
                      </span>
                    )}
                  </label>
                ))}
              </div>
              <div className="feedback-rating-caption" role="status">
                {rating > 0 ? (
                  <>
                    <span className="feedback-mini-stars" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={14}
                          fill={value <= rating ? "currentColor" : "none"}
                        />
                      ))}
                    </span>
                    <span>{t("ratingSelected", { value: rating })}</span>
                  </>
                ) : (
                  <span>{t("ratingHint")}</span>
                )}
              </div>
              {errors.rating && (
                <p className="feedback-field-error" id={id + "-rating-error"}>
                  {errors.rating}
                </p>
              )}
            </fieldset>
            <fieldset className="feedback-topics">
              <legend>{t("categoryLabel")}</legend>
              <div>
                {topics.map((topic) => (
                  <label
                    key={topic.value}
                    className={
                      "feedback-topic" +
                      (category === topic.value ? " is-selected" : "")
                    }
                    data-topic={topic.value}
                  >
                    <input
                      type="radio"
                      name={id + "-category"}
                      checked={category === topic.value}
                      value={topic.value}
                      onChange={() => setCategory(topic.value)}
                    />
                    <topic.icon size={17} aria-hidden="true" />
                    <span>{t(topic.value)}</span>
                    {category === topic.value && (
                      <Check size={13} aria-hidden="true" />
                    )}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="feedback-control">
              <label htmlFor={id + "-message"}>
                <span className="feedback-step" aria-hidden="true">
                  02
                </span>
                {t("messageLabel")} <span className="feedback-required">*</span>
              </label>
              <p className="feedback-prompt-label">{t("promptLabel")}</p>
              <div className="feedback-prompts">
                {["promptHighlight", "promptWayfinding", "promptServices"].map(
                  (key) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => addPrompt(key)}
                      aria-label={t("usePrompt", { prompt: t(key + "Label") })}
                    >
                      <Sparkles size={13} aria-hidden="true" />
                      {t(key + "Label")}
                    </button>
                  ),
                )}
              </div>
              <textarea
                ref={textarea}
                className="field"
                id={id + "-message"}
                rows={5}
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  if (event.target.value.trim().length >= 10)
                    clearError("message");
                }}
                maxLength={2000}
                minLength={10}
                required
                aria-invalid={!!errors.message}
                aria-describedby={
                  id +
                  "-message-help" +
                  (errors.message ? " " + id + "-message-error" : "")
                }
                placeholder={t("messagePlaceholder")}
              />
              <div className="feedback-character-track" aria-hidden="true">
                <span
                  style={{
                    width: Math.min(100, (message.length / 2000) * 100) + "%",
                  }}
                />
              </div>
              <p
                className="muted feedback-field-help"
                id={id + "-message-help"}
              >
                <span>{t("messageHelp")}</span>
                <span>{message.length}/2000</span>
              </p>
              <span className="sr-only" role="status">
                {promptNotice}
              </span>
              {errors.message && (
                <p className="feedback-field-error" id={id + "-message-error"}>
                  {errors.message}
                </p>
              )}
            </div>
            <div className="feedback-control feedback-email">
              <label htmlFor={id + "-email"}>{t("emailLabel")}</label>
              <input
                className="field"
                id={id + "-email"}
                type="email"
                dir="ltr"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (
                    !event.target.value.trim() ||
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value.trim())
                  )
                    clearError("email");
                }}
                maxLength={254}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={
                  errors.email ? id + "-email-error" : undefined
                }
              />
              {errors.email && (
                <p className="feedback-field-error" id={id + "-email-error"}>
                  {errors.email}
                </p>
              )}
            </div>
            <div className="feedback-consent">
              <label htmlFor={id + "-consent"}>
                <input
                  id={id + "-consent"}
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked);
                    if (event.target.checked) clearError("consent");
                  }}
                  required
                  aria-invalid={!!errors.consent}
                  aria-describedby={
                    errors.consent ? id + "-consent-error" : undefined
                  }
                />
                <span>{t("consentLabel")} *</span>
              </label>
              {errors.consent && (
                <p className="feedback-field-error" id={id + "-consent-error"}>
                  {errors.consent}
                </p>
              )}
            </div>
            <button
              className="button feedback-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? (
                <LoaderCircle
                  size={19}
                  className="feedback-spinner"
                  aria-hidden="true"
                />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
              {t(busy ? "sending" : "submit")}
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <p className="muted feedback-privacy">
              <ShieldCheck size={15} aria-hidden="true" />
              <span>{t("privacy")}</span>
            </p>
          </fieldset>
          <div aria-live="polite">
            {busy && <p role="status">{t("sending")}</p>}
            {requestError && (
              <p className="feedback-request-error" role="alert">
                {requestError}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
