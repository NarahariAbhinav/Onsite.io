import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "slide-up" | "fade-left" | "fade-right" | "scale-up";
  delay?: number; // optional stagger delay in ms
}

export function ScrollReveal({
  children,
  className,
  variant = "slide-up",
  delay = 0,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasNativeSupport, setHasNativeSupport] = useState(false);

  useEffect(() => {
    // Check if browser has native CSS animation-timeline view() support
    const supportsViewTimeline =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("animation-timeline", "view()");

    if (supportsViewTimeline) {
      setHasNativeSupport(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScrollProgress(1);
      return;
    }

    const calculateProgress = () => {
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      // Start transition when the top enters viewport bottom (rect.top = viewportHeight)
      // Fully complete transition when element reaches halfway up the viewport (rect.top <= viewportHeight * 0.48)
      const startTrigger = viewportHeight;
      const completeTrigger = viewportHeight * 0.48;

      if (rect.top >= startTrigger) {
        setScrollProgress(0);
      } else if (rect.top <= completeTrigger) {
        setScrollProgress(1);
      } else {
        // Linear smooth progression between 0.0 and 1.0 as the user scrolls
        const currentProgress = (startTrigger - rect.top) / (startTrigger - completeTrigger);
        setScrollProgress(Math.min(Math.max(currentProgress, 0), 1));
      }
    };

    window.addEventListener("scroll", calculateProgress, { passive: true });
    calculateProgress();

    return () => {
      window.removeEventListener("scroll", calculateProgress);
    };
  }, []);

  const variantClasses = {
    "slide-up": "scroll-driven-card",
    "fade-left": "scroll-driven-card-left",
    "fade-right": "scroll-driven-card-right",
    "scale-up": "scroll-driven-card",
  };

  // When native CSS view timeline is not available, apply JS interpolated transform smoothly
  const dynamicStyle = !hasNativeSupport
    ? {
        opacity: Math.max(0.05, scrollProgress),
        transform:
          variant === "fade-left"
            ? `translateX(${(1 - scrollProgress) * -48}px)`
            : variant === "fade-right"
              ? `translateX(${(1 - scrollProgress) * 48}px)`
              : variant === "scale-up"
                ? `translateY(${(1 - scrollProgress) * 56}px) scale(${0.95 + scrollProgress * 0.05})`
                : `translateY(${(1 - scrollProgress) * 56}px) scale(${0.97 + scrollProgress * 0.03})`,
        transition: "opacity 0.15s ease-out, transform 0.15s ease-out",
        transitionDelay: `${delay}ms`,
        willChange: "transform, opacity",
      }
    : {
        transitionDelay: `${delay}ms`,
      };

  return (
    <div
      ref={ref}
      style={dynamicStyle}
      className={cn(variantClasses[variant], className)}
    >
      {children}
    </div>
  );
}
