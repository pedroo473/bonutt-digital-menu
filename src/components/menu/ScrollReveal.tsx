import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}

export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      setReady(true);
      return;
    }

    const observer = new IntersectionObserver(
  (entries) => {
    const entry = entries[0];

    if (!entry) return;

    if (entry.isIntersecting) {
      setVisible(true);
      observer.unobserve(entry.target);
    }
  },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      },
    );

    observer.observe(element);
    setReady(true);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        "scroll-reveal",
        ready ? "scroll-reveal--ready" : "",
        visible ? "scroll-reveal--visible" : "",
        className,
      ].join(" ")}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}