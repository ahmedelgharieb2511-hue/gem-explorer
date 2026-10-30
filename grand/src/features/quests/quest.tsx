"use client";
import Link from "@/components/ui/site-link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { getArtifact } from "@/features/artifacts/data";
import { localize, localized } from "@/lib/i18n/config";
import "./quests.css";
const STORAGE = "gem-discovery-quest-v1";
const QUESTIONS = [
  {
    key: "writing",
    options: ["ramses-ii", "seated-scribe", "broad-collar"],
    correct: 1,
  },
  {
    key: "afterlife",
    options: ["shabti", "lotus-chalice", "alabaster-vessel"],
    correct: 0,
  },
  {
    key: "craft",
    options: ["isis-statuette", "seated-scribe", "broad-collar"],
    correct: 2,
  },
] as const;
export function Quest() {
  const t = useTranslations("quests");
  const locale = useLocale();
  const [answers, setAnswers] = useState<number[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [restored, setRestored] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem(STORAGE) ?? "null",
      );
      if (
        Array.isArray(parsed) &&
        parsed.length <= 3 &&
        parsed.every((v) => Number.isInteger(v) && v >= 0 && v < 3)
      ) {
        setAnswers(parsed);
        setRestored(parsed.length > 0);
      }
    } catch {
      /* Optional storage. */
    }
  }, []);
  useEffect(() => {
    if (answers.length > 0) heading.current?.focus();
  }, [answers.length]);
  const complete = answers.length === QUESTIONS.length;
  const question = QUESTIONS[answers.length];
  const score = answers.reduce(
    (total, answer, i) => total + (answer === QUESTIONS[i].correct ? 1 : 0),
    0,
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (choice === null || complete) return;
    const next = [...answers, choice];
    setAnswers(next);
    setChoice(null);
    setRestored(false);
    try {
      localStorage.setItem(STORAGE, JSON.stringify(next));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }
  function restart() {
    setAnswers([]);
    setChoice(null);
    setRestored(false);
    try {
      localStorage.removeItem(STORAGE);
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }
  return (
    <div className="page-shell quest-page">
      <header className="page-heading">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className="muted">{t("intro")}</p>
      </header>
      <div className="quest-columns">
        <aside className="quest-story panel">
          <span className="quest-symbol" aria-hidden="true">
            𓂀
          </span>
          <p className="eyebrow">{t("mission")}</p>
          <h2>{t("missionTitle")}</h2>
          <p>{t("missionText")}</p>
          <div
            className="quest-progress"
            role="progressbar"
            aria-label={t("progress")}
            aria-valuemin={0}
            aria-valuemax={3}
            aria-valuenow={answers.length}
          >
            <span style={{ width: `${(answers.length / 3) * 100}%` }} />
          </div>
          <p className="muted">
            {t("completed", { count: answers.length, total: 3 })}
          </p>
          <p className="quest-local-note muted">{t("localNotice")}</p>
        </aside>
        <section className="panel quest-card" aria-label={t("quiz")}>
          {complete ? (
            <div>
              <span className="quest-medal">✦</span>
              <p className="eyebrow">{t("finished")}</p>
              <h2 tabIndex={-1} ref={heading}>
                {t("score", { score, total: 3 })}
              </h2>
              <p className="muted">
                {t(score === 3 ? "perfect" : "keepExploring")}
              </p>
              <ul className="quest-review">
                {QUESTIONS.map((item, i) => {
                  const a = getArtifact(item.options[item.correct]);
                  return (
                    <li key={item.key}>
                      <span aria-hidden="true">
                        {answers[i] === item.correct ? "✓" : "○"}
                      </span>
                      <div>
                        <strong>
                          {t(
                            answers[i] === item.correct ? "correct" : "answer",
                          )}
                        </strong>
                        <p>{t(`${item.key}Explanation`)}</p>
                        {a && (
                          <Link href={localize(locale, `/artifacts/${a.id}`)}>
                            {localized(a.name, locale)} ↗
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="quest-actions">
                <button type="button" className="button" onClick={restart}>
                  {t("retry")}
                </button>
                <Link
                  className="button button-secondary"
                  href={localize(locale, "/artifacts")}
                >
                  {t("browse")}
                </Link>
              </div>
            </div>
          ) : (
            question && (
              <form onSubmit={submit}>
                <p className="eyebrow">
                  {t("questionNumber", {
                    current: answers.length + 1,
                    total: 3,
                  })}
                </p>
                <h2 tabIndex={-1} ref={heading} id="quest-question">
                  {t(`${question.key}Question`)}
                </h2>
                <fieldset
                  className="quest-options"
                  aria-labelledby="quest-question"
                >
                  <legend className="sr-only">{t("choose")}</legend>
                  {question.options.map((id, i) => {
                    const a = getArtifact(id);
                    return (
                      <label
                        key={id}
                        className={`quest-option ${choice === i ? "is-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`question-${answers.length}`}
                          checked={choice === i}
                          onChange={() => setChoice(i)}
                        />
                        <span
                          className="quest-option-letter"
                          aria-hidden="true"
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{a ? localized(a.name, locale) : id}</span>
                      </label>
                    );
                  })}
                </fieldset>
                <button
                  type="submit"
                  className="button"
                  disabled={choice === null}
                >
                  {t(answers.length === 2 ? "finish" : "next")} →
                </button>
              </form>
            )
          )}
          {restored && (
            <p role="status" className="muted">
              {t("restored")}
            </p>
          )}
          {saveFailed && (
            <p role="status" className="muted">
              {t("saveFailed")}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
