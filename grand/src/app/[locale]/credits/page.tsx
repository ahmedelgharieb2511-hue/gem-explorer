import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import credits from "@/features/artifacts/photo-credits.json";
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getMessages(locale).common;
  return (
    <div className="page-shell">
      <header className="page-heading">
        <p className="eyebrow">GEM EXPLORER</p>
        <h1>{t.creditsTitle}</h1>
        <p className="muted">{t.creditsDescription}</p>
      </header>
      <div className="credits-grid">
        {credits.map((photo) => (
          <article className="panel credit-card" key={photo.id}>
            <h2>{locale === "ar" ? photo.titleAr : photo.title}</h2>
            <p>{locale === "ar" ? photo.collectionAr : photo.collection}</p>
            <p>
              <a href={photo.source} target="_blank" rel="noreferrer">
                {photo.author}
              </a>
              {" · "}
              <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                {photo.license}
              </a>
            </p>
          </article>
        ))}
      </div>
      <p className="muted" style={{ marginTop: 28 }}>
        {locale === "ar"
          ? "حُجمت الصور وضُغطت إلى WebP دون تعديل محتواها. قد تُعرض بقص بصري داخل الإطارات. الخطان Cairo وManrope مُستضافان محليًا بترخيص SIL Open Font License."
          : "Photos are resized and WebP-encoded without retouching. Some frames crop their display. Cairo and Manrope fonts are self-hosted under the SIL Open Font License."}
      </p>
    </div>
  );
}
