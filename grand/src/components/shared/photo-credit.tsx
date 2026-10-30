import credits from "@/features/artifacts/photo-credits.json";
export function PhotoCredit({ id, locale }: { id: string; locale: string }) {
  const photo = credits.find((item) => item.id === id);
  if (!photo) return null;
  return (
    <span className="photo-credit">
      <span>{locale === "ar" ? photo.collectionAr : photo.collection}</span>
      <br />
      <a href={photo.source} target="_blank" rel="noreferrer">
        {photo.author}
      </a>
      {" · "}
      <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
        {photo.license}
      </a>
    </span>
  );
}
