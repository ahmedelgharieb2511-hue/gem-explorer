import { readFile, writeFile, mkdir, access } from "node:fs/promises";
const records = JSON.parse(
  await readFile(
    new URL("../src/features/artifacts/photo-credits.json", import.meta.url),
    "utf8",
  ),
);
await mkdir(new URL("../public/images/photos/", import.meta.url), {
  recursive: true,
});
let failures = 0;
for (const record of records) {
  const target = new URL(`../public${record.path}`, import.meta.url);
  try {
    await access(target);
    console.log(`Present: ${record.id}`);
    continue;
  } catch {
    /* Fetch missing assets only. */
  }
  try {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const response = await fetch(record.url, {
      headers: {
        "User-Agent":
          "GEMExplorer-Hackathon/0.1 (educational museum prototype)",
      },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes[0] !== 255 || bytes[1] !== 216 || bytes.length > 12 * 1024 * 1024)
      throw new Error("Expected a JPEG under 12 MiB");
    await writeFile(target, bytes);
    console.log(`Saved: ${record.id} (${Math.round(bytes.length / 1024)} KiB)`);
  } catch (error) {
    failures++;
    console.error(`${record.id}: ${error.message}`);
  }
}
if (failures) process.exitCode = 1;
