"use client";

import { motion, useReducedMotion } from "motion/react";

import { useNavigationProgress } from "@/components/shared/navigation-progress-provider";

export function NavigationProgress() {
  const { isNavigating } = useNavigationProgress();
  const shouldReduceMotion = useReducedMotion();

  if (!isNavigating) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden"
    >
      <motion.div
        className="h-full bg-accent"
        initial={
          shouldReduceMotion
            ? { width: "100%", opacity: 1 }
            : { width: "0%", opacity: 0 }
        }
        animate={
          shouldReduceMotion
            ? { width: "100%", opacity: 1 }
            : { width: "92%", opacity: 1 }
        }
        transition={{
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1],
          delay: shouldReduceMotion ? 0 : 0.1,
        }}
      />
    </div>
  );
}
