"use client";
import Image from "next/image";
import { ResponsivePhotograph } from "@/components/shared/responsive-photograph";
import { PhotoCredit } from "@/components/shared/photo-credit";
import Link from "@/components/ui/site-link";
import { useEffect, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Clock3,
  Copy,
  Download,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/api/client";
import { localized, localize } from "@/lib/i18n/config";
import type { Artifact } from "@/types";
import "./artifacts.css";
const eras = [
  "old-kingdom",
  "middle-kingdom",
  "new-kingdom",
  "late-period",
  "greco-roman",
] as const;
const categories = ["statue", "jewelry", "daily-life"] as const;
const useArtifacts = () =>
  useQuery({
    queryKey: ["artifacts"],
    queryFn: ({ signal }) => apiRequest<Artifact[]>("/artifacts", { signal }),
  });
export function normalizeSearch(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .toLocaleLowerCase()
    .trim();
}
export function ArtifactCard({
  artifact,
  priority = false,
}: {
  artifact: Artifact;
  priority?: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("artifacts");
  return (
    <Link
      className="artifact-card artifact-card-link"
      href={localize(locale, `/artifacts/${artifact.id}`)}
      aria-label={t("cardLink", { name: localized(artifact.name, locale) })}
    >
      <div className="artifact-card-image">
        <ResponsivePhotograph
          id={artifact.id}
          src={artifact.image}
          alt={localized(artifact.imageAlt, locale)}
          sizes="(max-width: 600px) 100vw, (max-width: 800px) 50vw, 33vw"
          eager={priority}
        />
        <span className="artifact-card-category">
          {t(`categories.${artifact.category}`)}
        </span>
        <span className="artifact-card-open" aria-hidden="true">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="artifact-card-copy">
        <p className="eyebrow">{t(`eras.${artifact.era}`)}</p>
        <h3>{localized(artifact.name, locale)}</h3>
        <p className="artifact-card-description">
          {localized(artifact.subtitle, locale)}
        </p>
        <div className="artifact-card-footer">
          <span>
            <MapPin size={14} aria-hidden="true" />
            {t(`galleries.${artifact.gallery}`)}
          </span>
          <span>
            <Clock3 size={14} aria-hidden="true" />
            {t("minutes", { count: artifact.duration })}
          </span>
        </div>
      </div>
    </Link>
  );
}
function CollectionSkeleton() {
  const t = useTranslations("artifacts");
  return (
    <div className="artifact-grid" role="status" aria-label={t("loading")}>
      {Array.from({ length: 6 }, (_, i) => (
        <div className="artifact-skeleton" key={i}>
          <div />
          <span />
          <span />
        </div>
      ))}
      <span className="sr-only">{t("loading")}</span>
    </div>
  );
}
export function Catalog() {
  const t = useTranslations("artifacts");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = useArtifacts();
  const term = params.get("q") ?? "";
  const era = params.get("era") ?? "";
  const category = params.get("category") ?? "";
  const rawPage = Number(params.get("page") ?? 1);
  const search = normalizeSearch(term);
  const filtered = (query.data ?? []).filter(
    (a) =>
      (!search ||
        normalizeSearch(
          [
            a.name.en,
            a.name.ar,
            a.description.en,
            a.description.ar,
            a.material.en,
            a.material.ar,
            ...a.tags,
          ].join(" "),
        ).includes(search)) &&
      (!era || a.era === era) &&
      (!category || a.category === category),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const page = Math.max(
    1,
    Math.min(pages, Number.isSafeInteger(rawPage) ? rawPage : 1),
  );
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false,
    });
  }
  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update(
      "q",
      String(new FormData(event.currentTarget).get("q") ?? "").trim(),
    );
  }
  return (
    <div className="page-shell collection-page">
      <header className="collection-heading">
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="page-heading">{t("title")}</h1>
          <p className="collection-intro">{t("intro")}</p>
        </div>
        <span className="collection-edition">{t("edition")}</span>
      </header>
      <form onSubmit={onSearch} className="collection-search" role="search">
        <Search size={21} aria-hidden="true" />
        <label className="sr-only" htmlFor="artifact-search">
          {t("searchLabel")}
        </label>
        <input
          key={term}
          id="artifact-search"
          name="q"
          type="search"
          defaultValue={term}
          placeholder={t("searchPlaceholder")}
          maxLength={120}
        />
        <button className="button" type="submit">
          {t("search")}
        </button>
      </form>
      <div className="collection-toolbar">
        <div className="collection-filter-field">
          <label htmlFor="artifact-era">{t("era")}</label>
          <select
            id="artifact-era"
            value={era}
            onChange={(e) => update("era", e.target.value)}
          >
            <option value="">{t("allEras")}</option>
            {eras.map((value) => (
              <option key={value} value={value}>
                {t(`eras.${value}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="collection-filter-field">
          <label htmlFor="artifact-category">{t("category")}</label>
          <select
            id="artifact-category"
            value={category}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {t(`categories.${value}`)}
              </option>
            ))}
          </select>
        </div>
        {Boolean(term || era || category) && (
          <button
            type="button"
            className="collection-reset"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            <X size={14} />
            {t("reset")}
          </button>
        )}
      </div>
      <div className="collection-result-bar">
        <p role="status" aria-live="polite">
          {query.isPending
            ? t("loading")
            : t("results", { count: filtered.length })}
        </p>
        <span>{t("illustrationNote")}</span>
      </div>
      {query.isPending ? (
        <CollectionSkeleton />
      ) : query.isError ? (
        <section className="panel collection-state" role="alert">
          <h2>{t("errorTitle")}</h2>
          <p>{t("errorDescription")}</p>
          <button className="button" onClick={() => void query.refetch()}>
            {t("retry")}
          </button>
        </section>
      ) : !filtered.length ? (
        <section className="panel collection-state">
          <Search size={32} />
          <h2>{t("emptyTitle")}</h2>
          <p>{t("emptyDescription")}</p>
          <button
            className="button button-secondary"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            {t("reset")}
          </button>
        </section>
      ) : (
        <>
          <div className="artifact-grid">
            {filtered.slice((page - 1) * 6, page * 6).map((a, i) => (
              <ArtifactCard
                key={a.id}
                artifact={a}
                priority={i < 3 && page === 1}
              />
            ))}
          </div>
          {pages > 1 && (
            <nav className="collection-pagination" aria-label={t("pagination")}>
              <button
                className="button button-secondary"
                disabled={page === 1}
                onClick={() => update("page", String(page - 1))}
              >
                {t("previous")}
              </button>
              <span>{t("page", { page, pages })}</span>
              <button
                className="button button-secondary"
                disabled={page === pages}
                onClick={() => update("page", String(page + 1))}
              >
                {t("next")}
              </button>
            </nav>
          )}
        </>
      )}
      <p className="collection-disclaimer">{t("demoNote")}</p>
    </div>
  );
}
function ArtifactQr({ artifact }: { artifact: Artifact }) {
  const locale = useLocale();
  const t = useTranslations("artifacts");
  const [url, setUrl] = useState("");
  const [qr, setQr] = useState("");
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    const permalink = new URL(
      localize(locale, `/artifacts/${artifact.id}`),
      window.location.origin,
    ).href;
    setUrl(permalink);
    setQr("");
    setFailed(false);
    setCopied(false);
    void import("qrcode")
      .then((module) =>
        module.toDataURL(permalink, {
          width: 240,
          margin: 2,
          errorCorrectionLevel: "M",
          color: { dark: "#263c32", light: "#ffffff" },
        }),
      )
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [artifact.id, locale]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setFailed(true);
    }
  }
  return (
    <section
      className="artifact-qr panel"
      aria-labelledby="artifact-qr-heading"
    >
      <div>
        <p className="eyebrow">{t("takeItWithYou")}</p>
        <h2 id="artifact-qr-heading">{t("qrTitle")}</h2>
        <p className="muted">{t("qrDescription")}</p>
      </div>
      <div className="artifact-qr-content">
        {qr ? (
          <Image
            className="artifact-qr-image"
            src={qr}
            alt={t("qrAlt", { name: localized(artifact.name, locale) })}
            width={160}
            height={160}
            unoptimized
          />
        ) : (
          <div className="artifact-qr-placeholder" role="status">
            {failed ? t("qrError") : t("loading")}
          </div>
        )}
        <div className="artifact-qr-actions">
          <label htmlFor="artifact-permalink">{t("permalink")}</label>
          <input
            id="artifact-permalink"
            className="field"
            readOnly
            value={url}
            dir="ltr"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void copy()}
            disabled={!url}
          >
            <Copy size={15} />
            {copied ? t("copied") : t("copyLink")}
          </button>
          {qr && (
            <a
              className="artifact-download"
              href={qr}
              download={`gem-${artifact.id}-${locale}-qr.png`}
            >
              <Download size={15} />
              {t("downloadQr")}
            </a>
          )}
          <span className="sr-only" role="status">
            {copied ? t("copied") : ""}
          </span>
          {failed && url && <small>{t("copyFallback")}</small>}
        </div>
      </div>
    </section>
  );
}
export function ArtifactDetails({ id }: { id: string }) {
  const t = useTranslations("artifacts");
  const locale = useLocale();
  const query = useQuery({
    queryKey: ["artifact", id],
    queryFn: ({ signal }) =>
      apiRequest<Artifact>(`/artifacts/${encodeURIComponent(id)}`, { signal }),
    retry: 1,
  });
  const collection = useArtifacts();
  const artifact = query.data;
  if (query.isPending)
    return (
      <div className="page-shell">
        <CollectionSkeleton />
      </div>
    );
  if (query.isError || !artifact)
    return (
      <div className="page-shell">
        <section className="panel collection-state" role="alert">
          <h1>{t("unavailableTitle")}</h1>
          <p>{t("unavailableDescription")}</p>
          <button className="button" onClick={() => void query.refetch()}>
            {t("retry")}
          </button>
          <Link
            className="button button-secondary"
            href={localize(locale, "/artifacts")}
          >
            {t("back")}
          </Link>
        </section>
      </div>
    );
  const related = (collection.data ?? [])
    .filter((a) => a.id !== id)
    .sort(
      (a, b) =>
        Number(b.category === artifact.category) -
        Number(a.category === artifact.category),
    )
    .slice(0, 3);
  return (
    <article className="page-shell artifact-detail">
      <nav className="artifact-breadcrumb" aria-label={t("breadcrumb")}>
        <Link href={localize(locale, "/artifacts")}>{t("back")}</Link>
        <span aria-hidden="true">/</span>
        <span>{localized(artifact.name, locale)}</span>
      </nav>
      <div className="artifact-detail-grid">
        <figure className="artifact-detail-figure">
          <div className="artifact-detail-image">
            <ResponsivePhotograph
              id={artifact.id}
              src={artifact.image}
              alt={localized(artifact.imageAlt, locale)}
              sizes="(max-width: 800px) 100vw, 50vw"
              eager
            />
          </div>
          <figcaption>
            <PhotoCredit id={artifact.id} locale={locale} />
          </figcaption>
        </figure>
        <div className="artifact-detail-copy">
          <p className="eyebrow">
            {t(`eras.${artifact.era}`)} · {t(`categories.${artifact.category}`)}
          </p>
          <h1 className="page-heading">{localized(artifact.name, locale)}</h1>
          <p className="artifact-detail-subtitle">
            {localized(artifact.subtitle, locale)}
          </p>
          <p className="artifact-detail-description">
            {localized(artifact.description, locale)}
          </p>
          <dl className="artifact-facts">
            <div>
              <dt>{t("date")}</dt>
              <dd>{localized(artifact.date, locale)}</dd>
            </div>
            <div>
              <dt>{t("material")}</dt>
              <dd>{localized(artifact.material, locale)}</dd>
            </div>
            <div>
              <dt>{t("location")}</dt>
              <dd>
                {t(`galleries.${artifact.gallery}`)} ·{" "}
                {t(artifact.floor === 0 ? "groundFloor" : "firstFloor")}
              </dd>
            </div>
            <div>
              <dt>{t("time")}</dt>
              <dd>{t("minutes", { count: artifact.duration })}</dd>
            </div>
          </dl>
          <div className="artifact-detail-buttons">
            <Link
              className="button"
              href={localize(locale, `/museum-map?artifact=${artifact.id}`)}
            >
              <MapPin size={17} />
              {t("findOnMap")}
            </Link>
            <Link
              className="button button-secondary"
              href={localize(locale, `/audio-guide?artifact=${artifact.id}`)}
            >
              {locale === "ar" ? "الدليل الصوتي" : "Audio guide"}
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </div>
      <section className="artifact-story">
        <div>
          <p className="eyebrow">{t("lookCloser")}</p>
          <h2>{t("storyTitle")}</h2>
        </div>
        <p>{localized(artifact.story, locale)}</p>
      </section>
      <ArtifactQr artifact={artifact} />
      {related.length > 0 && (
        <section className="artifact-related">
          <div className="artifact-related-heading">
            <div>
              <p className="eyebrow">{t("continueExploring")}</p>
              <h2>{t("relatedTitle")}</h2>
            </div>
            <Link href={localize(locale, "/artifacts")}>{t("viewAll")} ↗</Link>
          </div>
          <div className="artifact-grid">
            {related.map((a) => (
              <ArtifactCard artifact={a} key={a.id} />
            ))}
          </div>
        </section>
      )}
      <p className="collection-disclaimer">{t("demoNote")}</p>
    </article>
  );
}
