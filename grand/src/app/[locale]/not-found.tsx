import Link from "@/components/ui/site-link";
export default function NotFound() {
  return (
    <div className="page-shell empty-state">
      <p className="eyebrow">404 · GEM EXPLORER</p>
      <h1>حكاية لم نصل إليها بعد</h1>
      <p>This page could not be found.</p>
      <Link className="button" href="/ar/artifacts">
        استكشف المجموعة · Explore
      </Link>
    </div>
  );
}
