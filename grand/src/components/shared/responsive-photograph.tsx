import variants from "@/features/artifacts/photo-variants.json";
type PhotoId = keyof typeof variants;
type Props = {
  id: string;
  alt: string;
  sizes: string;
  eager?: boolean;
  lowPriority?: boolean;
  src?: string;
  className?: string;
};
/** Precompressed local variants avoid first-request image processing for LCP. */
export function ResponsivePhotograph({
  id,
  alt,
  sizes,
  eager = false,
  lowPriority = false,
  src,
  className = "",
}: Props) {
  const image = variants[id as PhotoId];
  if (!image)
    return src ? (
      <img
        className={`responsive-photo ${className}`}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
      />
    ) : null;
  return (
    <img
      className={`responsive-photo ${className}`}
      src={image.candidates[0].src}
      srcSet={image.candidates
        .map((item) => `${item.src} ${item.width}w`)
        .join(", ")}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : lowPriority ? "low" : "auto"}
      decoding="async"
    />
  );
}
