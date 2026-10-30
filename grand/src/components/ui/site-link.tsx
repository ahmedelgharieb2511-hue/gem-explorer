import NextLink from "next/link";
import type { ComponentProps } from "react";
/** Load destination assets on navigation, rather than preloading offscreen routes. */
export default function SiteLink(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
