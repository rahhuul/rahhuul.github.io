import { Navigation } from "@/components/layout/Navigation";
import { ChapterProgress } from "@/components/layout/ChapterProgress";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

import { Chapter01Hook } from "@/components/chapters/Chapter01Hook";
import { Chapter02Origin } from "@/components/chapters/Chapter02Origin";
import { Chapter03Craft } from "@/components/chapters/Chapter03Craft";
import { Chapter04Work } from "@/components/chapters/Chapter04Work";
import { Chapter05Proof } from "@/components/chapters/Chapter05Proof";
import { ChapterNotebook } from "@/components/chapters/ChapterNotebook";
import { Chapter06Invitation } from "@/components/chapters/Chapter06Invitation";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Navigation />
      <ChapterProgress />
      <SkipLink />

      <main id="main-content">
        <Chapter01Hook />
        <Chapter02Origin />
        <Chapter03Craft />
        <Chapter04Work />
        <Chapter05Proof />
        <ChapterNotebook />
        <Chapter06Invitation />
      </main>

      <Footer />
      <ScrollToTop />
    </>
  );
}
