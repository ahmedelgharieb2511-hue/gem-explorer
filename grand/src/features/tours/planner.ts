import { artifacts } from "@/features/artifacts/data";
import type { Artifact, TourPlan, TourPreferences } from "@/types";
type Position = { x: number; y: number; floor: 0 | 1 };
const ENTRANCE: Position = { x: 50, y: 94, floor: 0 };
const LIFT = { x: 54, y: 80 };
const point = (artifact: Artifact): Position => ({
  ...artifact.coordinates,
  floor: artifact.floor,
});
/** Schematic travel estimate. Cross-floor transfers use a central connector. */
export function walkingMinutes(
  from: Position,
  to: Position,
  accessible: boolean,
): number {
  const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);
  if (from.floor === to.floor)
    return Math.max(1, Math.ceil(distance(from, to) / 24));
  return (
    Math.max(1, Math.ceil((distance(from, LIFT) + distance(LIFT, to)) / 24)) +
    (accessible ? 5 : 3)
  );
}
export function buildDemoTour(preferences: TourPreferences): TourPlan {
  const budget = Number.isFinite(preferences.duration)
    ? Math.max(0, Math.floor(preferences.duration))
    : 0;
  const interests = new Set(preferences.interests);
  const remaining = [...artifacts];
  const stops: Artifact[] = [];
  let current = ENTRANCE;
  let used = 0;
  let walking = 0;
  while (remaining.length) {
    const feasible = remaining
      .map((artifact) => {
        const visit = Math.max(1, Math.ceil(artifact.duration));
        const walk = walkingMinutes(
          current,
          point(artifact),
          preferences.accessible,
        );
        const exit = walkingMinutes(
          point(artifact),
          ENTRANCE,
          preferences.accessible,
        );
        return {
          artifact,
          visit,
          walk,
          exit,
          score:
            (interests.has(artifact.category) ? 16 : 0) +
            (artifact.featured ? 2 : 0) -
            walk,
        };
      })
      .filter(
        (candidate) =>
          used + candidate.walk + candidate.visit + candidate.exit <= budget,
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.walk - b.walk ||
          a.artifact.id.localeCompare(b.artifact.id),
      );
    const next = feasible[0];
    if (!next) break;
    stops.push(next.artifact);
    used += next.visit + next.walk;
    walking += next.walk;
    current = point(next.artifact);
    remaining.splice(
      remaining.findIndex((artifact) => artifact.id === next.artifact.id),
      1,
    );
  }
  const returnMinutes = stops.length
    ? walkingMinutes(current, ENTRANCE, preferences.accessible)
    : 0;
  return {
    id: `demo-${budget}-${preferences.accessible ? "lift" : "standard"}-${stops.map((stop) => stop.id).join(".") || "empty"}`,
    stops,
    duration: used + returnMinutes,
    walkingMinutes: walking + returnMinutes,
    accessible: preferences.accessible,
    source: "demo",
  };
}
