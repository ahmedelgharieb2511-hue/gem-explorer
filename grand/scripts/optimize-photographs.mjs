import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
const records = JSON.parse(
  await readFile(
    new URL("../src/features/artifacts/photo-credits.json", import.meta.url),
    "utf8",
  ),
);
const manifest = {};
for (const record of records) {
  const original = new URL(`../public${record.path}`, import.meta.url);
  const metadata = await sharp(await readFile(original)).metadata();
  const candidates = [];
  for (const width of [480, 768, 1200]) {
    const output = new URL(
      `../public/images/photos/${record.id}-${width}.webp`,
      import.meta.url,
    );
    const result = await sharp(await readFile(original))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer({ resolveWithObject: true });
    await writeFile(output, result.data);
    if (!candidates.some((item) => item.width === result.info.width))
      candidates.push({
        src: `/images/photos/${record.id}-${width}.webp`,
        width: result.info.width,
        bytes: result.data.length,
      });
  }
  const base = await sharp(await readFile(original))
    .rotate()
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
  await writeFile(
    new URL(`../public/images/photos/${record.id}.webp`, import.meta.url),
    base,
  );
  manifest[record.id] = {
    width: metadata.width,
    height: metadata.height,
    candidates,
  };
  console.log(
    `${record.id}: ${candidates.map((item) => `${item.width}px/${Math.round(item.bytes / 1024)}KiB`).join(", ")}`,
  );
}
await writeFile(
  new URL("../src/features/artifacts/photo-variants.json", import.meta.url),
  JSON.stringify(manifest, null, 2) + "\n",
);
