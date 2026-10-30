import { Suspense } from "react";
import { Catalog } from "@/features/artifacts";
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="page-shell" role="status">
          …
        </div>
      }
    >
      <Catalog />
    </Suspense>
  );
}
