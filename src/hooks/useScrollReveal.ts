import { useEffect, useRef, useState } from "react";

type UseScrollRevealOptions = {
  once?: boolean;
  rootMargin?: string;
};

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: UseScrollRevealOptions,
) {
  const once = options?.once ?? true;
  const rootMargin = options?.rootMargin ?? "0px 0px -10% 0px";
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.disconnect();
          }

          return;
        }

        if (!once) {
          setIsVisible(false);
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [once, rootMargin]);

  return { ref, isVisible };
}