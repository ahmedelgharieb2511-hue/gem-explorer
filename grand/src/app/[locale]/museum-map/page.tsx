import { Suspense } from "react";
import { MuseumMap } from "@/features/navigation/museum-map";
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="page-shell" role="status">
          …
        </div>
      }
    >
      <MuseumMap />
    </Suspense>
  );
}
