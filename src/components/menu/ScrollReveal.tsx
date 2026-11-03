import { useEffect, useRef, useState, type ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  delayMs?: number;
};

/**
 * Reveals content when it enters the viewport.
 * Respects reduced-motion preferences and falls back safely when
 * IntersectionObserver is unavailable.
 */
export function ScrollReveal({
  children,
  delayMs = 0,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          currentObserver.unobserve(element);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={[
        "transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
