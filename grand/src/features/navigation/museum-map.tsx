"use client";
import Link from "@/components/ui/site-link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { artifacts, getArtifact } from "@/features/artifacts/data";
import { localize, localized } from "@/lib/i18n/config";
import type { Artifact } from "@/types";
import "./navigation.css";
type Point = { x: number; y: number; floor: 0 | 1 };
const ENTRANCE: Point = { x: 50, y: 94, floor: 0 };
const CONNECTOR = { x: 54, y: 80 };
const point = (a: Artifact): Point => ({ ...a.coordinates, floor: a.floor });
const sx = (x: number) => 100 + x * 8;
const sy = (y: number) => 110 + y * 5;
function routeSegments(stops: Artifact[], floor: 0 | 1): [Point, Point][] {
  if (!stops.length) return [];
  const points = [ENTRANCE, ...stops.map(point), ENTRANCE];
  const segments: [Point, Point][] = [];
  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1],
      to = points[i];
    if (from.floor === to.floor) {
      if (from.floor === floor) segments.push([from, to]);
    } else {
      if (from.floor === floor) segments.push([from, { ...CONNECTOR, floor }]);
      if (to.floor === floor) segments.push([{ ...CONNECTOR, floor }, to]);
    }
  }
  return segments;
}
export function MuseumMap() {
  const t = useTranslations("navigation");
  const locale = useLocale();
  const query = useSearchParams();
  const rawStops = query.get("stops") || "";
  const route = [...new Set(rawStops.split(",").slice(0, 20))].flatMap((id) => {
    const artifact = getArtifact(id);
    return artifact ? [artifact] : [];
  });
  const selectedFromUrl = getArtifact(query.get("artifact") ?? "");
  const accessible = query.get("accessible") === "1";
  const [floor, setFloor] = useState<0 | 1>(
    selectedFromUrl?.floor ?? route[0]?.floor ?? 0,
  );
  const [selectedId, setSelectedId] = useState(
    selectedFromUrl?.id ?? route[0]?.id ?? "ramses-ii",
  );
  const selected = getArtifact(selectedId);
  const floorArtifacts = artifacts.filter((a) => a.floor === floor);
  function selectFloor(value: 0 | 1) {
    setFloor(value);
    setSelectedId(
      route.find((a) => a.floor === value)?.id ??
        artifacts.find((a) => a.floor === value)?.id ??
        "",
    );
  }
  return (
    <div className="page-shell museum-map-page">
      <header className="page-heading">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1>{t("title")}</h1>
        <p className="muted">{t("intro")}</p>
      </header>
      <div className="map-warning" role="note">
        <span aria-hidden="true">ⓘ</span>
        <p>{t("notice")}</p>
      </div>
      <div className="map-columns">
        <section className="panel map-canvas-panel" aria-label={t("floorPlan")}>
          <div className="map-toolbar">
            <div
              className="map-floor-buttons"
              role="group"
              aria-label={t("chooseFloor")}
            >
              {([0, 1] as const).map((v) => (
                <button
                  type="button"
                  key={v}
                  className={floor === v ? "is-selected" : ""}
                  aria-pressed={floor === v}
                  onClick={() => selectFloor(v)}
                >
                  {v === 0 ? t("groundFloor") : t("upperFloor")}
                </button>
              ))}
            </div>
            <span className="badge">
              {route.length
                ? t("routeCount", { count: route.length })
                : t("exploreMode")}
            </span>
          </div>
          <svg
            className="museum-map-svg"
            viewBox="0 0 1000 700"
            role="group"
            aria-label={t("mapLabel", { floor })}
          >
            <title>{t("mapLabel", { floor })}</title>
            <desc>{t("mapDescription")}</desc>
            <defs>
              <pattern
                id="map-dots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="#d7cdbb" />
              </pattern>
            </defs>
            <rect width="1000" height="700" fill="url(#map-dots)" />
            <path
              d="M150 150 H850 L900 200 V565 L850 615 H150 L100 565 V200Z"
              fill="#f8f5ee"
              stroke="#c2b397"
              strokeWidth="5"
            />
            {floor === 0 ? (
              <>
                <rect
                  x="205"
                  y="220"
                  width="175"
                  height="240"
                  rx="5"
                  className="map-gallery"
                />
                <text x="292" y="205" className="map-room-label">
                  {t("galleryOne")}
                </text>
                <rect
                  x="415"
                  y="220"
                  width="195"
                  height="235"
                  className="map-gallery map-gallery-muted"
                />
                <text x="512" y="310" className="map-room-label">
                  {t("grandHall")}
                </text>
                <rect
                  x="640"
                  y="220"
                  width="200"
                  height="240"
                  rx="5"
                  className="map-gallery map-gallery-muted"
                />
                <text x="740" y="250" className="map-room-label">
                  {t("visitorServices")}
                </text>
                {["restrooms", "cafe", "rest"].map((key, i) => (
                  <g key={key}>
                    <rect
                      x="675"
                      y={275 + i * 53}
                      width="130"
                      height="37"
                      rx="4"
                      fill="#dce2d7"
                    />
                    <text x="740" y={299 + i * 53} className="map-room-label">
                      {t(key)}
                    </text>
                  </g>
                ))}
                <text x="440" y="550" className="map-room-label">
                  {t("atrium")}
                </text>
              </>
            ) : (
              <>
                <rect
                  x="200"
                  y="220"
                  width="140"
                  height="300"
                  rx="5"
                  className="map-gallery map-gallery-muted"
                />
                <text x="270" y="365" className="map-room-label">
                  {t("discoverySpace")}
                </text>
                <rect
                  x="380"
                  y="215"
                  width="215"
                  height="225"
                  rx="5"
                  className="map-gallery"
                />
                <text x="487" y="195" className="map-room-label">
                  {t("galleryTwo")}
                </text>
                <rect
                  x="630"
                  y="215"
                  width="210"
                  height="170"
                  rx="5"
                  className="map-gallery"
                />
                <text x="735" y="195" className="map-room-label">
                  {t("galleryThree")}
                </text>
                <rect
                  x="630"
                  y="410"
                  width="210"
                  height="120"
                  rx="5"
                  className="map-gallery"
                />
                <text x="735" y="558" className="map-room-label">
                  {t("galleryFour")}
                </text>
              </>
            )}
            <g aria-hidden="true">
              {routeSegments(route, floor).map(([from, to], i) => (
                <line
                  key={i}
                  x1={sx(from.x)}
                  y1={sy(from.y)}
                  x2={sx(to.x)}
                  y2={sy(to.y)}
                  stroke="#a76529"
                  strokeWidth="4"
                  strokeDasharray="8 7"
                  strokeLinecap="round"
                />
              ))}
              <rect
                x={sx(CONNECTOR.x) - 18}
                y={sy(CONNECTOR.y) - 18}
                width="36"
                height="36"
                rx="7"
                fill="#2d554c"
              />
              <text
                x={sx(CONNECTOR.x)}
                y={sy(CONNECTOR.y) + 5}
                textAnchor="middle"
                fill="#fff"
                fontSize="17"
              >
                ↕
              </text>
              <text
                x={sx(CONNECTOR.x)}
                y={sy(CONNECTOR.y) + 40}
                className="map-room-label"
              >
                {accessible ? t("lift") : t("connector")}
              </text>
              {floor === 0 && (
                <text
                  x={sx(ENTRANCE.x)}
                  y={sy(ENTRANCE.y) + 30}
                  className="map-room-label"
                >
                  {t("entrance")}
                </text>
              )}
            </g>
            {floorArtifacts.map((a) => {
              const order = route.findIndex((s) => s.id === a.id);
              const active = selectedId === a.id;
              return (
                <g
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  aria-label={localized(a.name, locale)}
                  aria-pressed={active}
                  className="map-artifact-pin"
                  onClick={() => setSelectedId(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(a.id);
                    }
                  }}
                >
                  <circle
                    cx={sx(a.coordinates.x)}
                    cy={sy(a.coordinates.y)}
                    r={active ? 23 : 18}
                    fill={
                      active ? "#243f38" : order >= 0 ? "#a76529" : "#f8f5ee"
                    }
                    stroke="#a76529"
                    strokeWidth="3"
                  />
                  <text
                    x={sx(a.coordinates.x)}
                    y={sy(a.coordinates.y) + 5}
                    textAnchor="middle"
                    fill={active || order >= 0 ? "#fff" : "#a76529"}
                    fontSize="14"
                    pointerEvents="none"
                  >
                    {order >= 0 ? order + 1 : "✦"}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="map-legend">
            <span>◉ {t("artifact")}</span>
            <span>┄ {t("suggestedRoute")}</span>
            <span>↕ {t("connector")}</span>
          </div>
        </section>
        <aside className="panel map-detail-panel" aria-live="polite">
          {selected && (
            <>
              <p className="eyebrow">{t("selectedArtifact")}</p>
              <h2>{localized(selected.name, locale)}</h2>
              <p className="muted">{localized(selected.subtitle, locale)}</p>
              <p>{localized(selected.description, locale)}</p>
              <div className="map-detail-meta">
                <span className="badge">
                  {t("floor", { floor: selected.floor })}
                </span>
                <span className="badge">
                  {t("visit", { count: selected.duration })}
                </span>
              </div>
              <Link
                className="button button-secondary"
                href={localize(locale, `/artifacts/${selected.id}`)}
              >
                {t("details")} ↗
              </Link>
            </>
          )}
          <p className="muted map-route-note">
            {route.length
              ? t(accessible ? "accessibleRoute" : "routeHelp")
              : t("noRoute")}
          </p>
          <Link href={localize(locale, "/tour-planner")}>
            {t("planTour")} →
          </Link>
        </aside>
      </div>
      {rawStops && !route.length && <p role="status">{t("invalidRoute")}</p>}
      <section className="map-list-section" aria-labelledby="map-list-title">
        <h2 id="map-list-title">{t("listTitle")}</h2>
        <p className="muted">{t("listIntro")}</p>
        <ul className="map-artifact-list">
          {floorArtifacts.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={selectedId === a.id ? "is-selected" : ""}
                aria-pressed={selectedId === a.id}
                onClick={() => setSelectedId(a.id)}
              >
                <span>{localized(a.name, locale)}</span>
                <span className="muted">
                  {t("floor", { floor: a.floor })} ↗
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
