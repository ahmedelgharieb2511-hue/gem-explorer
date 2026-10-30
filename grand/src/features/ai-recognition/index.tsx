"use client";
import Image from "next/image";
import Link from "@/components/ui/site-link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Camera, Upload, ScanLine } from "lucide-react";
import { artifacts, getArtifact } from "@/features/artifacts/data";
import { apiRequest } from "@/lib/api/client";
import { localize, localized } from "@/lib/i18n/config";
import type { RecognitionResult } from "@/types";
import "./recognition.css";
const formats = ["image/jpeg", "image/png", "image/webp"];
export function ScanExperience() {
  const t = useTranslations("recognition"),
    locale = useLocale(),
    router = useRouter(),
    id = useId();
  const upload = useRef<HTMLInputElement>(null),
    camera = useRef<HTMLInputElement>(null),
    request = useRef<AbortController | null>(null);
  const [mode, setMode] = useState<"image" | "qr">("image"),
    [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<RecognitionResult | null>(null),
    [sampleId, setSampleId] = useState(artifacts[0].id),
    [qr, setQr] = useState("");
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => () => request.current?.abort(), []);
  function choose(next: File | undefined) {
    request.current?.abort();
    setBusy(false);
    setError("");
    setResult(null);
    if (!next) return;
    if (!formats.includes(next.type)) {
      setFile(null);
      setError(t("invalidType"));
      return;
    }
    if (!next.size || next.size > 8 * 1024 * 1024) {
      setFile(null);
      setError(t("invalidSize"));
      return;
    }
    setFile(next);
  }
  async function recognize() {
    if (!file || busy) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    const body = new FormData();
    body.append("image", file);
    try {
      const data = await apiRequest<RecognitionResult>("/recognize", {
        method: "POST",
        body,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) setResult(data);
    } catch {
      if (!controller.signal.aborted) setError(t("requestError"));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  function sample() {
    request.current?.abort();
    setBusy(false);
    setError("");
    setResult({
      artifactId: sampleId,
      confidence: 0,
      source: "demo",
      similarIds: artifacts
        .filter((a) => a.id !== sampleId)
        .slice(0, 3)
        .map((a) => a.id),
    });
  }
  function openCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const value = qr.trim();
    let artifactId = value;
    try {
      if (value.includes("/") || value.includes(":")) {
        const url = new URL(value, window.location.origin);
        const segments = url.pathname.split("/").filter(Boolean);
        const index = segments.indexOf("artifacts");
        artifactId =
          index >= 0 && segments.length === index + 2
            ? decodeURIComponent(segments[index + 1])
            : "";
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(artifactId) || !getArtifact(artifactId)) {
        setError(t("invalidQr"));
        return;
      }
      router.push(
        localize(locale, `/artifacts/${encodeURIComponent(artifactId)}`),
      );
    } catch {
      setError(t("invalidQr"));
    }
  }
  const match = result ? getArtifact(result.artifactId) : undefined;
  const similar = result
    ? [...new Set(result.similarIds)]
        .filter((v) => v !== result.artifactId)
        .flatMap((v) => {
          const a = getArtifact(v);
          return a ? [a] : [];
        })
    : [];
  return (
    <section className="scan-experience" aria-label={t("title")}>
      <div className="scan-switch" aria-label={t("modeLabel")}>
        {(["image", "qr"] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={mode === v ? "is-active" : ""}
            aria-pressed={mode === v}
            onClick={() => {
              request.current?.abort();
              setBusy(false);
              setMode(v);
              setError("");
            }}
          >
            {t(v === "image" ? "imageMode" : "qrMode")}
          </button>
        ))}
      </div>
      {mode === "image" ? (
        <div className="scan-grid">
          <div className="panel scan-upload-panel">
            <div className="scan-viewfinder">
              {preview ? (
                <Image
                  src={preview}
                  alt={t("previewAlt")}
                  width={600}
                  height={450}
                  unoptimized
                  className="scan-preview"
                />
              ) : (
                <div className="scan-placeholder">
                  <ScanLine size={64} strokeWidth={1} aria-hidden="true" />
                  <h2>{t("uploadHeading")}</h2>
                  <p className="muted">{t("uploadHint")}</p>
                </div>
              )}
            </div>
            <input
              ref={upload}
              hidden
              type="file"
              accept={formats.join(",")}
              aria-label={t("uploadButton")}
              onChange={(e) => {
                choose(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <input
              ref={camera}
              hidden
              type="file"
              accept={formats.join(",")}
              capture="environment"
              aria-label={t("cameraButton")}
              onChange={(e) => {
                choose(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <div className="scan-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => upload.current?.click()}
              >
                <Upload size={17} />
                {t("uploadButton")}
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => camera.current?.click()}
              >
                <Camera size={17} />
                {t("cameraButton")}
              </button>
            </div>
            {file && (
              <p className="muted scan-file-name" dir="auto">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
            <button
              className="button scan-analyze"
              type="button"
              disabled={!file || busy}
              onClick={() => void recognize()}
            >
              {t(busy ? "analyzing" : "analyzeButton")}
            </button>
            <p className="muted scan-privacy">{t("privacy")}</p>
          </div>
          <aside className="scan-aside">
            <div className="panel scan-tips">
              <p className="eyebrow">{t("tipsEyebrow")}</p>
              <h2>{t("tipsHeading")}</h2>
              <ol>
                {["tipOne", "tipTwo", "tipThree"].map((k) => (
                  <li key={k}>{t(k)}</li>
                ))}
              </ol>
              <p className="muted">{t("museumNotice")}</p>
            </div>
            <div className="panel scan-sample">
              <span className="badge">{t("sampleBadge")}</span>
              <h3>{t("sampleHeading")}</h3>
              <p className="muted">{t("sampleDescription")}</p>
              <label htmlFor={`${id}-sample`}>{t("sampleLabel")}</label>
              <select
                className="field"
                id={`${id}-sample`}
                value={sampleId}
                onChange={(e) => setSampleId(e.target.value)}
              >
                {artifacts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {localized(a.name, locale)}
                  </option>
                ))}
              </select>
              <button
                className="button button-secondary"
                type="button"
                onClick={sample}
              >
                {t("sampleButton")}
              </button>
            </div>
          </aside>
        </div>
      ) : (
        <form className="panel scan-qr" onSubmit={openCode}>
          <p className="eyebrow">{t("qrEyebrow")}</p>
          <h2>{t("qrHeading")}</h2>
          <p className="muted">{t("qrDescription")}</p>
          <label htmlFor={`${id}-qr`}>{t("qrLabel")}</label>
          <input
            className="field"
            id={`${id}-qr`}
            dir="ltr"
            value={qr}
            onChange={(e) => setQr(e.target.value)}
            placeholder="ramses-ii"
            required
            autoComplete="off"
          />
          <button className="button" type="submit">
            {t("qrButton")}
          </button>
          <p className="muted">{t("qrCameraNote")}</p>
        </form>
      )}
      <div className="scan-status" aria-live="polite">
        {busy && <p role="status">{t("analyzing")}</p>}
        {error && (
          <p className="scan-error" role="alert">
            {error}
          </p>
        )}
      </div>
      {mode === "image" && result && (
        <section className="panel scan-result" aria-labelledby={`${id}-result`}>
          {result.source === "demo" && (
            <div className="scan-demo-notice" role="note">
              <strong>{t("demoTitle")}</strong>
              <p>{t("demoDescription")}</p>
            </div>
          )}
          <p className="eyebrow">
            {t(result.source === "demo" ? "sampleBadge" : "resultEyebrow")}
          </p>
          <h2 id={`${id}-result`}>
            {match ? localized(match.name, locale) : t("unknownArtifact")}
          </h2>
          {result.source === "backend" && (
            <>
              <p className="badge">
                {t("confidence", {
                  value: Math.round(result.confidence * 100),
                })}
              </p>
              <p className="muted">{t("confidenceNote")}</p>
            </>
          )}
          {match && (
            <Link
              className="button"
              href={localize(locale, `/artifacts/${match.id}`)}
            >
              {t("viewArtifact")}
            </Link>
          )}
          {similar.length > 0 && (
            <div className="scan-similar">
              <h3>{t("similarHeading")}</h3>
              <div>
                {similar.map((a) => (
                  <Link
                    key={a.id}
                    href={localize(locale, `/artifacts/${a.id}`)}
                  >
                    {localized(a.name, locale)} ↗
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
