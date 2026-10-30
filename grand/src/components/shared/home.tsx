import Link from "@/components/ui/site-link";
import { ResponsivePhotograph } from "@/components/shared/responsive-photograph";
import {
  ArrowDown,
  ArrowUpRight,
  Map,
  ScanLine,
  Route,
  Sparkles,
} from "lucide-react";
import { getMessages } from "@/lib/i18n/messages";
import { localize } from "@/lib/i18n/config";
import { artifacts } from "@/features/artifacts/data";
import { ArtifactCard } from "@/features/artifacts";
import type { Locale } from "@/types";
export function Home({ locale }: { locale: Locale }) {
  const t = getMessages(locale).home;
  const tools = [
    {
      id: "01",
      icon: Route,
      title: t.tourTitle,
      text: t.tourText,
      path: "/tour-planner",
    },
    {
      id: "02",
      icon: ScanLine,
      title: t.scanTitle,
      text: t.scanText,
      path: "/scan",
    },
    {
      id: "03",
      icon: Map,
      title: t.mapTitle,
      text: t.mapText,
      path: "/museum-map",
    },
  ];
  return (
    <>
      <section className="hero">
        <div className="hero-background" aria-hidden="true">
          <ResponsivePhotograph
            id="abu-simbel"
            alt=""
            sizes="480px"
            lowPriority
          />
        </div>
        <div className="hero-text">
          <p className="eyebrow">
            <span className="tiny-star">✦</span>
            {t.eyebrow}
          </p>
          <h1>
            {t.titleFirst}
            <br />
            {t.titleSecond}
            <br />
            <em>{t.titleThird}</em>
          </h1>
          <p className="hero-description">{t.description}</p>
          <div className="hero-buttons">
            <Link className="button" href={localize(locale, "/artifacts")}>
              {t.explore}
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            <Link
              className="text-link"
              href={localize(locale, "/tour-planner")}
            >
              {t.plan}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <a href="#collection" className="scroll-hint">
            <ArrowDown size={14} aria-hidden="true" />
            {t.discover}
          </a>
        </div>
        <div className="hero-art">
          <span className="hero-coordinate">GIZA, EGYPT · 29.99° N</span>
          <div className="hero-arch">
            <ResponsivePhotograph
              id="golden-mask"
              alt={t.heroImageAlt}
              eager
              sizes="(max-width: 600px) calc(100vw - 48px), (max-width: 800px) 520px, 40vw"
            />
            <span className="hero-orbit" aria-hidden="true" />
          </div>
          <div className="hero-art-caption">
            <span>{t.heroCaption}</span>
            <h2>{t.heroName}</h2>
            <p>{t.heroDate}</p>
          </div>
        </div>
      </section>
      <div className="discovery-strip">
        {[
          { value: t.statOne, label: t.statOneLabel },
          { value: t.statTwo, label: t.statTwoLabel },
          { value: t.statThree, label: t.statThreeLabel },
        ].map((stat) => (
          <div key={stat.label}>
            <span className="tiny-star" aria-hidden="true">
              ✦
            </span>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
      <section className="home-section" id="collection">
        <div className="section-top">
          <div>
            <p className="eyebrow">{t.featuredEyebrow}</p>
            <h2>{t.featuredTitle}</h2>
            <p className="muted">{t.featuredDescription}</p>
          </div>
          <Link className="text-link" href={localize(locale, "/artifacts")}>
            {t.viewAll}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="artifact-grid">
          {artifacts
            .filter((artifact) => artifact.featured)
            .slice(0, 3)
            .map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} />
            ))}
        </div>
      </section>
      <section className="journey-section">
        <div className="home-section">
          <div className="section-top">
            <div>
              <p className="eyebrow">{t.journeyEyebrow}</p>
              <h2>{t.journeyTitle}</h2>
            </div>
            <p className="muted section-description">{t.journeyDescription}</p>
          </div>
          <div className="journey-grid">
            {tools.map((tool) => (
              <Link
                key={tool.id}
                href={localize(locale, tool.path)}
                className="journey-card"
              >
                <div className="journey-card-top">
                  <tool.icon size={29} strokeWidth={1.3} aria-hidden="true" />
                  <span>{tool.id}</span>
                </div>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
                <span className="journey-link">
                  {t.start}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="visit-banner">
        <div className="visit-photograph">
          <ResponsivePhotograph
            id="abu-simbel"
            alt={t.visitImageAlt}
            sizes="(max-width: 800px) 100vw, 50vw"
          />
          <span>{t.visitLocation}</span>
        </div>
        <div className="visit-copy">
          <p className="eyebrow">{t.visitEyebrow}</p>
          <h2>{t.visitTitle}</h2>
          <p>{t.visitText}</p>
          <div className="hero-buttons">
            <Link
              className="button button-light"
              href={localize(locale, "/services")}
            >
              {t.services}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link className="text-link" href={localize(locale, "/quests")}>
              <Sparkles size={16} aria-hidden="true" />
              {t.quest}
            </Link>
          </div>
          <p className="visit-note">{t.note}</p>
        </div>
      </section>
    </>
  );
}
