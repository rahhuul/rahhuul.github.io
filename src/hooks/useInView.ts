"use client";

import { useEffect, useRef, useState, RefObject } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * useInView  Intersection Observer hook.
 * Returns [ref, isInView]  attach ref to the element you want to observe.
 *
 * @param threshold  0–1, fraction of element visible before triggering (default 0.2)
 * @param rootMargin CSS margin around the root (default '0px')
 * @param triggerOnce If true, stops observing after first trigger (default true)
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.2, rootMargin = "0px", triggerOnce = true } = options;

  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(el);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isInView];
}

/**
 * useMultipleInView  observe multiple elements, returns array of booleans.
 */
export function useMultipleInView(
  count: number,
  options: UseInViewOptions = {}
): [Array<RefObject<HTMLDivElement | null>>, boolean[]] {
  const { threshold = 0.2, rootMargin = "0px", triggerOnce = true } = options;

  const refs = Array.from({ length: count }, () =>
    useRef<HTMLDivElement>(null)
  );
  const [inViewStates, setInViewStates] = useState<boolean[]>(
    Array(count).fill(false)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const observers = refs.map((ref, i) => {
      const el = ref.current;
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInViewStates((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
            if (triggerOnce) observer.unobserve(el);
          } else if (!triggerOnce) {
            setInViewStates((prev) => {
              const next = [...prev];
              next[i] = false;
              return next;
            });
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((obs) => obs?.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, rootMargin, triggerOnce]);

  return [refs, inViewStates];
}
