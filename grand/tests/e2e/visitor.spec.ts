import { test, expect } from "@playwright/test";
test("visitor explores, filters, opens a QR story and switches language", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every object",
  );
  await page
    .getByRole("link", { name: "Explore the collection", exact: true })
    .first()
    .click();
  await page
    .getByRole("searchbox", { name: "Search the collection" })
    .fill("gold");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page).toHaveURL(/q=gold/);
  await page
    .getByRole("link", { name: "Explore The golden mask", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "The golden mask",
  );
  await expect(
    page.getByAltText("QR code linking to the The golden mask story"),
  ).toBeVisible();
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page).toHaveURL(/\/ar\/artifacts\/golden-mask/);
});
test("tour planner creates a bounded itinerary and a keyboard usable map", async ({
  page,
}) => {
  await page.goto("/en/tour-planner");
  await page.getByLabel("30 minutes", { exact: true }).check();
  await page.getByLabel("Prefer a step-free route").check();
  await page.getByRole("button", { name: /Create my tour/ }).click();
  await expect(
    page.getByText("A journey chosen for you", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /Follow this route on the map/ })
    .click();
  await expect(page).toHaveURL(/stops=/);
  const pin = page
    .getByRole("button", { name: "Ramesses II", exact: true })
    .first();
  if (await pin.isVisible()) {
    await pin.focus();
    await page.keyboard.press("Enter");
  }
  await expect(
    page.getByText("Schematic demo", { exact: false }),
  ).toBeVisible();
});
test("QR ID, illustrative AI, VIP gate and feedback demo remain honest", async ({
  page,
}) => {
  await page.goto("/en/scan");
  await page.getByRole("button", { name: "Show illustrative example" }).click();
  await expect(
    page.getByText("Example only — no AI analysis was run"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Open an artifact code", exact: true })
    .click();
  await page.getByLabel("Artifact link or ID").fill("ramses-ii");
  await page
    .getByRole("button", { name: "Open artifact", exact: true })
    .click();
  await expect(page).toHaveURL(/artifacts\/ramses-ii/);
  await page.goto("/en/audio-guide");
  await expect(page.getByText("A richer story awaits")).toBeVisible();
  await expect(page.locator("audio")).toHaveCount(0);
  await page.goto("/en/feedback");
  await page
    .getByRole("button", { name: "Send feedback", exact: true })
    .click();
  await expect(page.getByRole("alert").first()).toContainText("Please check");
  await page
    .getByRole("radio", { name: "5 out of 5 stars", exact: true })
    .check();
  await page
    .getByLabel("Your thoughts")
    .fill("A thoughtful and engaging visit experience.");
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Send feedback", exact: true })
    .click();
  await expect(
    page.getByText("This demo did not save", { exact: false }),
  ).toBeVisible();
});
test("quest can be completed and replayed", async ({ page }) => {
  await page.goto("/en/quests");
  for (const name of [
    "The seated scribe",
    "The shabti figure",
    "The broad collar",
  ]) {
    await page.getByRole("radio", { name, exact: false }).check();
    await page
      .getByRole("button", { name: /Next clue|Reveal my discoveries/ })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "3 out of 3 discoveries" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try the quest again" }).click();
  await expect(page.getByText("Clue 1 of 3")).toBeVisible();
});
test("search empty state and API error recover without losing query", async ({
  page,
}) => {
  await page.goto("/en/artifacts?q=zzzzzz");
  await expect(
    page.getByRole("heading", { name: "A new discovery is a search away" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .first()
    .click();
  await expect(page.locator(".artifact-card-link")).toHaveCount(6);
  await page.route("**/api/artifacts", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: '{"code":"UNAVAILABLE"}',
    }),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "The collection could not load" }),
  ).toBeVisible();
  await page.unroute("**/api/artifacts");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator(".artifact-card-link")).toHaveCount(6);
});
test("mobile layouts stay within viewport and navigation is reachable", async ({
  page,
}) => {
  for (const locale of ["ar", "en"])
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}`);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${locale} home at ${width}px`,
      ).toBe(true);
    }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/en");
  await page
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  await expect(
    page.getByRole("navigation", { name: "Open navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation", exact: true }),
  ).toBeFocused();
});
test("every feature stays readable at 320px in both directions", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 320, height: 900 });
  for (const locale of ["ar", "en"])
    for (const route of [
      "artifacts",
      "artifacts/golden-mask",
      "tour-planner",
      "museum-map",
      "scan",
      "audio-guide",
      "quests",
      "feedback",
      "services",
    ]) {
      await page.goto(`/${locale}/${route}`);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${locale}/${route} at 320px`,
      ).toBe(true);
    }
});
test("server-approved VIP shows native controls and readable transcript", async ({
  page,
}) => {
  await page.route("**/api/entitlements", (route) =>
    route.fulfill({ json: { vip: true, source: "backend" } }),
  );
  await page.route("**/api/audio/**", (route) =>
    route.fulfill({
      json: {
        title: "A verified narration",
        url: "https://example.org/narration.mp3",
        transcript: "A complete accessible narration transcript.",
      },
    }),
  );
  await page.goto("/en/audio-guide");
  await expect(page.locator("audio[controls]")).toBeVisible();
  await page.getByText("Read the transcript", { exact: true }).click();
  await expect(
    page.getByText("A complete accessible narration transcript."),
  ).toBeVisible();
});
test("landing typography and photos load without unused route CSS preloads", async ({
  page,
}) => {
  test.setTimeout(30_000);
  const warnings: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("preloaded using link preload"))
      warnings.push(message.text());
  });
  await page.goto("/en");
  const hero = page.locator(".hero-arch img");
  await expect(hero).toHaveAttribute("fetchpriority", "high");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(hero).toHaveJSProperty("complete", true);
  expect(
    await hero.evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  expect(
    await hero.evaluate((image) => (image as HTMLImageElement).currentSrc),
  ).toContain(".webp");
  expect(
    await page
      .locator(".hero-description")
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
  ).toBeGreaterThanOrEqual(16);
  await page.evaluate(() => document.fonts.ready);
  // Chromium reports an unused preload only after a short idle interval.
  await page.waitForTimeout(6500);
  const orphaned = await page.evaluate(() =>
    [
      ...document.querySelectorAll<HTMLLinkElement>(
        'link[rel="preload"][as="style"]',
      ),
    ]
      .filter(
        (preload) =>
          ![
            ...document.querySelectorAll<HTMLLinkElement>(
              'link[rel="stylesheet"]',
            ),
          ].some((sheet) => sheet.href === preload.href),
      )
      .map((link) => link.href),
  );
  expect(orphaned).toEqual([]);
  expect(warnings).toEqual([]);
});
test("one theme button persists across reload, pages and language changes", async ({
  page,
}) => {
  await page.goto("/en/feedback");
  await page
    .getByRole("button", { name: "Switch to dark mode", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(() => localStorage.getItem("gem-color-theme")),
  ).toBe("dark");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Switch to light mode", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page).toHaveURL(/\/ar\/feedback/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "التبديل للوضع الفاتح", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/en/artifacts");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
test("feedback prompts preserve text, avoid duplicates and submit the chosen topic", async ({
  page,
}) => {
  await page.goto("/en/feedback");
  await page
    .getByRole("button", { name: "Send feedback", exact: true })
    .click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  const initialRating = page.getByRole("radio", {
    name: "4 out of 5 stars",
    exact: true,
  });
  await initialRating.check();
  await expect(initialRating).toBeFocused();
  const message = page.getByLabel("Your thoughts", { exact: false });
  await message.fill("My existing thoughts stay in the message.");
  const prompt = page.getByRole("button", {
    name: "Use prompt: A favorite moment",
    exact: true,
  });
  await prompt.click();
  await expect(message).toBeFocused();
  const first = await message.inputValue();
  expect(first).toContain("My existing thoughts stay in the message.");
  expect(first).toContain("The highlight of my visit was…");
  await prompt.click();
  await expect(message).toHaveValue(first);
  await message.fill("A".repeat(1995));
  await prompt.click();
  await expect(message).toHaveValue("A".repeat(1995));
  await message.fill(
    "A thoughtful visit with clear and welcoming visitor services.",
  );
  await page
    .getByRole("radio", { name: "4 out of 5 stars", exact: true })
    .check();
  await page
    .getByRole("radio", { name: "Visitor services", exact: true })
    .check();
  await page.getByRole("checkbox").check();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "3",
  );
  const submission = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/feedback") && request.method() === "POST",
  );
  await page
    .getByRole("button", { name: "Send feedback", exact: true })
    .click();
  expect((await submission).postDataJSON()).toMatchObject({
    rating: 4,
    category: "services",
    consent: true,
  });
  await expect(
    page.getByText("This demo did not save", { exact: false }),
  ).toBeVisible();
});
test("dark feedback remains usable at 320px with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.setViewportSize({ width: 320, height: 900 });
  for (const locale of ["ar", "en"]) {
    await page.goto("/" + locale + "/feedback");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("radio", {
        name: locale === "ar" ? "5 من ٥ نجوم" : "5 out of 5 stars",
        exact: true,
      })
      .check();
    await expect(page.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
    const toggle = page.getByRole("button", {
      name: locale === "ar" ? "التبديل للوضع الفاتح" : "Switch to light mode",
      exact: true,
    });
    await expect(toggle).toBeVisible();
    expect(
      await page
        .locator(".feedback-mood.is-selected")
        .evaluate((element) => element.getAnimations().length),
    ).toBe(0);
  }
});
