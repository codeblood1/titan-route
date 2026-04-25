import { useEffect, useRef, useState } from "react";

interface Vehicle {
  emoji: string;
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  scale: number;
  opacity: number;
  lane: number;
}

export default function LogisticsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Lane configuration: y positions (percent), directions, speeds
    const lanes = [
      { y: 8,  speed: 0.4,  dir: 1,  emojiSet: ["✈️", "🛩️"] },       // Top: planes fly right
      { y: 20, speed: 0.25, dir: -1, emojiSet: ["🚁", "🛸"] },        // Helicopters fly left
      { y: 65, speed: 0.35, dir: 1,  emojiSet: ["🚚", "🚛", "🚐"] }, // Bottom: trucks drive right
      { y: 78, speed: 0.3,  dir: -1, emojiSet: ["🚢", "⛴️", "🛥️"] }, // Ships sail left
      { y: 88, speed: 0.2,  dir: 1,  emojiSet: ["📦", "📮", "🗳️"] }, // Packages drift right
    ];

    const vehicles: Vehicle[] = [];
    const elements: HTMLDivElement[] = [];

    // Create vehicles for each lane
    lanes.forEach((lane, laneIndex) => {
      const count = laneIndex === 0 ? 3 : laneIndex === 4 ? 4 : 2; // More packages, fewer planes
      for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        const emoji = lane.emojiSet[Math.floor(Math.random() * lane.emojiSet.length)];
        const startX = lane.dir === 1
          ? -10 - (Math.random() * 30)
          : 110 + (Math.random() * 30);

        el.textContent = emoji;
        el.style.position = "absolute";
        el.style.left = `${startX}%`;
        el.style.top = `${lane.y}%`;
        el.style.fontSize = `${1.2 + Math.random() * 1.2}rem`;
        el.style.opacity = `${0.06 + Math.random() * 0.06}`;
        el.style.pointerEvents = "none";
        el.style.transition = "none";
        el.style.filter = "grayscale(0.3)";
        el.style.zIndex = "0";
        el.style.userSelect = "none";

        // Add shadow/depth for some
        if (Math.random() > 0.5) {
          el.style.textShadow = "0 2px 8px rgba(0,0,0,0.08)";
        }

        container.appendChild(el);

        vehicles.push({
          emoji,
          x: startX,
          y: lane.y,
          speed: lane.speed * (0.8 + Math.random() * 0.4),
          direction: lane.dir as 1 | -1,
          scale: 0.8 + Math.random() * 0.4,
          opacity: 0.04 + Math.random() * 0.05,
          lane: laneIndex,
        });
        elements.push(el);
      }
    });

    // Add floating dots (route nodes)
    const nodeCount = 12;
    const nodes: { x: number; y: number; el: HTMLDivElement }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.width = "4px";
      el.style.height = "4px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
      el.style.left = `${10 + Math.random() * 80}%`;
      el.style.top = `${10 + Math.random() * 80}%`;
      el.style.pointerEvents = "none";
      el.style.animation = `pulse ${3 + Math.random() * 4}s ease-in-out infinite`;
      container.appendChild(el);
      nodes.push({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), el });
    }

    // Add connecting lines between some nodes
    const lines: HTMLDivElement[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      if (Math.random() > 0.6) continue;
      const n1 = nodes[i];
      const n2 = nodes[i + 1];
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.height = "1px";
      el.style.backgroundColor = "rgba(59, 130, 246, 0.08)";
      el.style.pointerEvents = "none";
      el.style.transformOrigin = "left center";
      container.appendChild(el);
      lines.push(el);

      // Position line between nodes
      const rect1 = n1.el.getBoundingClientRect();
      const rect2 = n2.el.getBoundingClientRect();
      const dx = rect2.left - rect1.left;
      const dy = rect2.top - rect1.top;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      el.style.left = `${n1.x}%`;
      el.style.top = `${n1.y}%`;
      el.style.width = `${length}px`;
      el.style.transform = `rotate(${angle}deg)`;
    }

    // Animation loop
    let animId: number;
    const animate = () => {
      for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        v.x += v.speed * v.direction;

        // Wrap around
        if (v.direction === 1 && v.x > 115) v.x = -15;
        if (v.direction === -1 && v.x < -15) v.x = 115;

        const el = elements[i];
        el.style.left = `${v.x}%`;

        // Slight vertical bobbing for water/air vehicles
        if (v.lane === 0 || v.lane === 3) {
          const bob = Math.sin(Date.now() / 1000 + i) * 0.5;
          el.style.top = `${v.y + bob}%`;
        }
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      elements.forEach((el) => el.remove());
      nodes.forEach((n) => n.el.remove());
      lines.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
      style={{ opacity: 1 }}
    />
  );
}
