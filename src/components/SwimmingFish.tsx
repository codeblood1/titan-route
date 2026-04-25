import { useEffect, useRef } from "react";

interface FloatingIconsProps {
  count?: number;
}

export function FloatingIcons({ count = 5 }: FloatingIconsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const icons = ["📦", "🚚", "✈️", "🚢", "📋", "🌍", "🏭", "📍"];
    const iconElements: HTMLDivElement[] = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.textContent = icons[Math.floor(Math.random() * icons.length)];
      el.style.position = "absolute";
      el.style.fontSize = `${18 + Math.random() * 24}px`;
      el.style.opacity = "0.08";
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 100}%`;
      el.style.transition = "transform 0.1s linear";
      el.style.pointerEvents = "none";
      container.appendChild(el);
      iconElements.push(el);
    }

    const speeds = iconElements.map(() => ({
      x: (Math.random() - 0.5) * 1.5,
      y: (Math.random() - 0.5) * 0.8,
    }));

    let animationId: number;

    const animate = () => {
      iconElements.forEach((el, i) => {
        let newLeft = parseFloat(el.style.left) + speeds[i].x * 0.08;
        let newTop = parseFloat(el.style.top) + speeds[i].y * 0.08;

        if (newLeft < -5) newLeft = 105;
        if (newLeft > 105) newLeft = -5;
        if (newTop < -5) newTop = 105;
        if (newTop > 105) newTop = -5;

        el.style.left = `${newLeft}%`;
        el.style.top = `${newTop}%`;

        const scaleX = speeds[i].x > 0 ? 1 : -1;
        el.style.transform = `scaleX(${scaleX})`;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      iconElements.forEach((el) => el.remove());
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  );
}
