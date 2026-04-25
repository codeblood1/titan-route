import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    image: "/hero-truck.jpg",
    label: "Ground Freight",
    subtitle: "Nationwide trucking network",
  },
  {
    image: "/hero-plane.jpg",
    label: "Air Cargo",
    subtitle: "Express delivery worldwide",
  },
  {
    image: "/hero-ship.jpg",
    label: "Ocean Freight",
    subtitle: "Global container shipping",
  },
  {
    image: "/hero-warehouse.jpg",
    label: "Warehousing",
    subtitle: "Smart fulfillment centers",
  },
  {
    image: "/hero-delivery.jpg",
    label: "Last Mile",
    subtitle: "Door-to-door delivery",
  },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-900">
      {/* Image layers with crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.label}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-slate-900/30" />

      {/* Bottom gradient for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent" />

      {/* Corner label */}
      <div className="absolute top-8 right-8 z-10">
        <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
          <p className="text-xs text-white/60 uppercase tracking-wider">{slide.subtitle}</p>
          <p className="text-sm font-semibold text-white">{slide.label}</p>
        </div>
      </div>

      {/* Bottom progress indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="group relative h-1 rounded-full overflow-hidden transition-all duration-500"
            style={{ width: i === current ? 48 : 16 }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full" />
            {i === current && (
              <motion.div
                className="absolute inset-0 bg-blue-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 6, ease: "linear" }}
                style={{ transformOrigin: "left" }}
                key={`progress-${current}`}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
