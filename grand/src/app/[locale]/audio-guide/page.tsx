import { AudioGuide } from "@/features/audio-guide";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ artifact?: string }>;
}) {
  const query = await searchParams;
  return (
    <div className="page-shell">
      <AudioGuide artifactId={query.artifact} />
    </div>
  );
}
