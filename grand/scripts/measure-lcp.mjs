import { chromium } from "@playwright/test";
const target = process.argv[2] || "http://127.0.0.1:3000/en";
const browser = await chromium.launch({ headless: true });
const measurements = [];
try {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    if (process.argv.includes("--throttled")) {
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 150,
        downloadThroughput: 1_600_000 / 8,
        uploadThroughput: 750_000 / 8,
      });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    }
    await page.addInitScript(() => {
      window.__gemLcp = null;
      new PerformanceObserver((list) => {
        const e = list.getEntries().at(-1);
        window.__gemLcp = {
          milliseconds: Math.round(e.startTime),
          element: e.element?.tagName,
          url: e.url,
        };
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    await page.goto(target, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const result = await page.evaluate(() => ({
      ...window.__gemLcp,
      imageBytes: performance
        .getEntriesByType("resource")
        .filter((entry) => entry.initiatorType === "img")
        .reduce((sum, entry) => sum + entry.transferSize, 0),
    }));
    measurements.push(result);
    console.log(JSON.stringify({ run, ...result }));
    await context.close();
  }
  const values = measurements
    .map((value) => value.milliseconds)
    .sort((a, b) => a - b);
  console.log(
    JSON.stringify({
      target,
      viewport: "1440x1000",
      throttled: process.argv.includes("--throttled"),
      medianMilliseconds: values[1],
    }),
  );
} finally {
  await browser.close();
}
