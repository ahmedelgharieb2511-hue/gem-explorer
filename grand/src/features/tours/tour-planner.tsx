"use client";
import Link from "@/components/ui/site-link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api/client";
import { localize, localized } from "@/lib/i18n/config";
import type { TourPlan, TourPreferences } from "@/types";
import "./tours.css";
const DURATIONS = [30, 60, 90, 120];
const INTERESTS = ["statue", "jewelry", "daily-life"] as const;
const STORAGE = "gem-tour-preferences-v1";
export function TourPlanner() {
  const t = useTranslations("tours");
  const locale = useLocale();
  const [preferences, setPreferences] = useState<TourPreferences>({
    duration: 60,
    interests: ["statue", "jewelry"],
    accessible: false,
  });
  const [plan, setPlan] = useState<TourPlan | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [restored, setRestored] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(
        localStorage.getItem(STORAGE) ?? "null",
      );
      if (
        saved &&
        typeof saved === "object" &&
        "duration" in saved &&
        "interests" in saved &&
        "accessible" in saved &&
        typeof saved.duration === "number" &&
        DURATIONS.includes(saved.duration) &&
        typeof saved.accessible === "boolean" &&
        Array.isArray(saved.interests) &&
        saved.interests.length > 0 &&
        saved.interests.length <= 3 &&
        saved.interests.every((value) =>
          INTERESTS.some((allowed) => allowed === value),
        )
      ) {
        setPreferences({
          duration: saved.duration,
          accessible: saved.accessible,
          interests: saved.interests,
        });
        setRestored(true);
      }
    } catch {
      /* Optional storage. */
    }
    return () => request.current?.abort();
  }, []);
  function change(patch: Partial<TourPreferences>) {
    setPreferences((p) => ({ ...p, ...patch }));
    setPlan(null);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setRestored(false);
    if (!preferences.interests.length) {
      setError(t("validation"));
      return;
    }
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setPlan(null);
    try {
      const result = await apiRequest<TourPlan>("/tours", {
        method: "POST",
        body: JSON.stringify(preferences),
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setPlan(result);
      try {
        localStorage.setItem(STORAGE, JSON.stringify(preferences));
        setSaveFailed(false);
      } catch {
        setSaveFailed(true);
      }
    } catch {
      if (!controller.signal.aborted) setError(t("error"));
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  }
  const mapQuery = plan
    ? `?stops=${encodeURIComponent(plan.stops.map((s) => s.id).join(","))}&accessible=${plan.accessible ? "1" : "0"}`
    : "";
  return (
    <div className="page-shell tour-page">
      <header className="page-heading">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className="muted">{t("intro")}</p>
      </header>
      <div className="tour-columns">
        <form className="panel tour-form" onSubmit={submit} aria-busy={pending}>
          <fieldset disabled={pending} className="tour-fieldset">
            <legend>{t("duration")}</legend>
            <div className="tour-duration-options">
              {DURATIONS.map((duration) => (
                <label
                  key={duration}
                  className={`tour-duration ${preferences.duration === duration ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="duration"
                    checked={preferences.duration === duration}
                    onChange={() => change({ duration })}
                  />
                  <span>{t("minutes", { count: duration })}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={pending} className="tour-fieldset">
            <legend>{t("interests")}</legend>
            <div className="tour-interests">
              {INTERESTS.map((interest) => (
                <label className="tour-interest" key={interest}>
                  <input
                    type="checkbox"
                    checked={preferences.interests.includes(interest)}
                    onChange={() =>
                      change({
                        interests: preferences.interests.includes(interest)
                          ? preferences.interests.filter((i) => i !== interest)
                          : [...preferences.interests, interest],
                      })
                    }
                  />
                  <span>{t(interest)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="tour-accessible">
            <input
              type="checkbox"
              disabled={pending}
              checked={preferences.accessible}
              onChange={(e) => change({ accessible: e.target.checked })}
              aria-describedby="tour-accessible-hint"
            />
            <span>{t("accessible")}</span>
          </label>
          <p id="tour-accessible-hint" className="muted tour-hint">
            {t("accessibleHint")}
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {restored && (
            <p className="muted" role="status">
              {t("saved")}
            </p>
          )}
          <button className="button" type="submit" disabled={pending}>
            {pending ? t("submitting") : t("submit")}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        <section
          className="panel tour-result"
          aria-live="polite"
          aria-busy={pending}
          aria-label={t("result")}
        >
          {pending ? (
            <div className="tour-result-placeholder">
              <span className="tour-orbit">✦</span>
              <h2>{t("submitting")}</h2>
            </div>
          ) : plan ? (
            <>
              <p className="eyebrow">
                {t("budget", { count: preferences.duration })}
              </p>
              <h2>{t("result")}</h2>
              <p className="muted">{t("resultHint")}</p>
              <div className="tour-stats">
                <span className="badge">
                  {t("total", { count: plan.duration })}
                </span>
                <span className="badge">
                  {t("walking", { count: plan.walkingMinutes })}
                </span>
                <span className="badge">
                  {t("stops", { count: plan.stops.length })}
                </span>
              </div>
              {plan.stops.length ? (
                <>
                  <ol className="tour-stop-list">
                    {plan.stops.map((stop, index) => (
                      <li key={stop.id}>
                        <span className="tour-stop-number">{index + 1}</span>
                        <div>
                          <Link
                            href={localize(locale, `/artifacts/${stop.id}`)}
                          >
                            {localized(stop.name, locale)}
                          </Link>
                          <p className="muted">
                            {t("floor", { floor: stop.floor })} ·{" "}
                            {t("visit", { count: stop.duration })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="muted">
                    {t("remaining", {
                      count: Math.max(0, preferences.duration - plan.duration),
                    })}
                  </p>
                  <Link
                    className="button button-secondary"
                    href={`${localize(locale, "/museum-map")}${mapQuery}`}
                  >
                    {t("map")} ↗
                  </Link>
                </>
              ) : (
                <p>{t("empty")}</p>
              )}
              {saveFailed && (
                <p className="muted" role="status">
                  {t("saveFailed")}
                </p>
              )}
            </>
          ) : (
            <div className="tour-result-placeholder">
              <span className="tour-orbit">✦</span>
              <h2>{t("readyTitle")}</h2>
              <p className="muted">{t("readyText")}</p>
            </div>
          )}
        </section>
      </div>
      <p className="tour-notice muted">{t("notice")}</p>
    </div>
  );
}
