declare module "splitting" {
  interface SplittingOptions {
    target?: string | Element | Element[] | NodeList;
    by?: "chars" | "words" | "lines" | "items" | "rows" | "grid" | "cells";
    key?: string | null;
    matching?: string;
  }

  interface SplittingResult {
    el: Element;
    chars?: Element[];
    words?: Element[];
    lines?: Element[][];
    items?: Element[];
    rows?: Element[][];
    cells?: Element[][];
    [key: string]: unknown;
  }

  function Splitting(options?: SplittingOptions): SplittingResult[];
  export default Splitting;
}
