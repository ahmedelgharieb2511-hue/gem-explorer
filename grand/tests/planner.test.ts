import { describe, expect, it } from "vitest";
import { buildDemoTour } from "@/features/tours/planner";
describe("tour budget and ordering", () => {
  for (const duration of [15, 30, 60, 90, 120])
    for (const accessible of [true, false])
      for (const interest of ["statue", "jewelry", "daily-life"]) {
        it(`fits ${duration} minutes, ${interest}, accessible=${accessible}`, () => {
          const input = { duration, accessible, interests: [interest] };
          const plan = buildDemoTour(input);
          expect(plan.duration).toBeLessThanOrEqual(duration);
          expect(plan.stops.length).toBeGreaterThan(0);
          expect(new Set(plan.stops.map((s) => s.id)).size).toBe(
            plan.stops.length,
          );
          expect(plan.duration).toBe(
            plan.walkingMinutes +
              plan.stops.reduce((n, s) => n + s.duration, 0),
          );
          expect(plan.accessible).toBe(accessible);
          expect(buildDemoTour(input)).toEqual(plan);
        });
      }
  it("handles a zero or invalid budget without inventing stops", () => {
    for (const duration of [0, -10, NaN])
      expect(
        buildDemoTour({ duration, accessible: false, interests: [] }).stops,
      ).toEqual([]);
  });
  it("honors interests when selecting the first stop", () => {
    expect(
      buildDemoTour({ duration: 30, accessible: false, interests: ["jewelry"] })
        .stops[0].category,
    ).toBe("jewelry");
  });
});
