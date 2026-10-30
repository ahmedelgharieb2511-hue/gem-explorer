import { ArtifactDetails } from "@/features/artifacts";
import { getArtifact } from "@/features/artifacts/data";
import { localized } from "@/lib/i18n/config";
import type { Metadata } from "next";
type Props = { params: Promise<{ locale: string; id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const artifact = getArtifact(id);
  return { title: artifact ? localized(artifact.name, locale) : "Artifact" };
}
export default async function Page({ params }: Props) {
  const { id } = await params;
  return <ArtifactDetails id={id} />;
}
