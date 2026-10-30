"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Headphones, LockKeyhole } from "lucide-react";
import { artifacts, getArtifact } from "@/features/artifacts/data";
import { apiRequest } from "@/lib/api/client";
import { localized } from "@/lib/i18n/config";
import type { AudioTrack, Entitlement } from "@/types";
import "./audio-guide.css";
export function AudioGuide({ artifactId }: { artifactId?: string }) {
  const t = useTranslations("audio"),
    locale = useLocale(),
    id = useId();
  const [selected, setSelected] = useState(
      getArtifact(artifactId ?? "")?.id ?? artifacts[0].id,
    ),
    [entitlement, setEntitlement] = useState<Entitlement | null>(null),
    [track, setTrack] = useState<AudioTrack | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [mediaError, setMediaError] = useState(""),
    [retry, setRetry] = useState(0),
    [speechAvailable, setSpeechAvailable] = useState(false),
    [speaking, setSpeaking] = useState(false),
    [speechError, setSpeechError] = useState("");
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const artifact = getArtifact(selected);
  const name = artifact ? localized(artifact.name, locale) : "";
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setMediaError("");
    setEntitlement(null);
    setTrack(null);
    async function load() {
      try {
        const access = await apiRequest<Entitlement>("/entitlements", {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setEntitlement(access);
        if (access.vip) {
          const audio = await apiRequest<AudioTrack>(
            `/audio/${selected}?locale=${locale}`,
            { signal: controller.signal },
          );
          if (!controller.signal.aborted) setTrack(audio);
        }
      } catch {
        if (!controller.signal.aborted) setError(t("loadError"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [selected, locale, retry, t]);
  useEffect(() => {
    setSpeechAvailable(
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    );
    setSpeaking(false);
    setSpeechError("");
    return () => {
      if (utterance.current) {
        window.speechSynthesis.cancel();
        utterance.current = null;
      }
    };
  }, [selected, locale]);
  function toggleSample() {
    if (!speechAvailable) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      utterance.current = null;
      setSpeaking(false);
      return;
    }
    const sample = new SpeechSynthesisUtterance(
      t("sampleText", { artifact: name }),
    );
    sample.lang = locale === "ar" ? "ar-EG" : "en-GB";
    sample.rate = 0.9;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith(locale));
    if (voice) sample.voice = voice;
    sample.onend = () => {
      if (utterance.current === sample) {
        utterance.current = null;
        setSpeaking(false);
      }
    };
    sample.onerror = (event) => {
      if (utterance.current === sample) {
        utterance.current = null;
        setSpeaking(false);
        if (event.error !== "interrupted" && event.error !== "canceled")
          setSpeechError(t("speechError"));
      }
    };
    utterance.current = sample;
    setSpeechError("");
    setSpeaking(true);
    window.speechSynthesis.speak(sample);
  }
  return (
    <section className="audio-guide" aria-labelledby={`${id}-title`}>
      <div className="audio-guide-grid">
        <div className="audio-guide-intro">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 id={`${id}-title`}>{t("title")}</h1>
          <p className="muted">{t("description")}</p>
          <label htmlFor={`${id}-artifact`}>{t("artifactLabel")}</label>
          <select
            id={`${id}-artifact`}
            className="field"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {artifacts.map((a) => (
              <option key={a.id} value={a.id}>
                {localized(a.name, locale)}
              </option>
            ))}
          </select>
          <div className="audio-wave" aria-hidden="true">
            {[
              24, 40, 62, 38, 78, 100, 64, 40, 86, 56, 28, 66, 90, 44, 70, 36,
              20,
            ].map((height, i) => (
              <span key={i} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="panel audio-access">
          {loading ? (
            <p role="status">{t("checkingAccess")}</p>
          ) : error ? (
            <div role="alert">
              <p>{error}</p>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setRetry((v) => v + 1)}
              >
                {t("retry")}
              </button>
            </div>
          ) : entitlement?.vip && track ? (
            <>
              <span className="badge">{t("vipBadge")}</span>
              <h3>{track.title}</h3>
              <audio
                key={track.url}
                controls
                preload="none"
                src={track.url}
                aria-label={track.title}
                onError={() => setMediaError(t("playbackError"))}
              >
                {t("audioFallback")}
              </audio>
              {mediaError && <p role="alert">{mediaError}</p>}
              <details className="audio-transcript">
                <summary>{t("transcript")}</summary>
                <p>{track.transcript}</p>
              </details>
            </>
          ) : (
            <>
              <div className="audio-lock">
                <LockKeyhole size={30} aria-hidden="true" />
              </div>
              <span className="badge">{t("vipBadge")}</span>
              <h3>{t("lockedTitle")}</h3>
              <p className="muted">{t("lockedDescription")}</p>
              {entitlement?.source === "demo" && (
                <p className="audio-demo-note">{t("demoAccess")}</p>
              )}
            </>
          )}
        </div>
      </div>
      <div className="audio-sample panel">
        <div>
          <p className="eyebrow">{t("sampleEyebrow")}</p>
          <h3>{t("sampleTitle")}</h3>
          <p className="muted">{t("sampleDescription")}</p>
        </div>
        <div>
          <button
            className="button button-secondary"
            type="button"
            onClick={toggleSample}
            disabled={!speechAvailable}
            aria-pressed={speaking}
          >
            <Headphones size={17} />
            {t(speaking ? "stopSample" : "playSample")}
          </button>
          <p className="muted audio-sample-help">
            {t(speechAvailable ? "browserVoice" : "speechUnavailable")}
          </p>
        </div>
        {speechError && <p role="alert">{speechError}</p>}
      </div>
    </section>
  );
}
