"use client";

import dynamic from "next/dynamic";

const ScrollGallery = dynamic(() => import("@/components/ui/scroll-gallery"), {
  ssr: false,
});

export default function ExpertiseStack() {
  return <ScrollGallery />;
}
