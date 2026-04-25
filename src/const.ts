export const LOGIN_PATH = "/login";

export const CARRIER_AVATARS = [
  { id: "express", name: "Express Prime", emoji: "🚚", color: "#2563EB" },
  { id: "voyager", name: "Sea Voyager", emoji: "🚢", color: "#0D9488" },
  { id: "sky", name: "Sky Freight", emoji: "✈️", color: "#7C3AED" },
  { id: "trail", name: "Trail Blazer", emoji: "🚛", color: "#DC2626" },
  { id: "swift", name: "Swift Route", emoji: "🏍️", color: "#EA580C" },
  { id: "global", name: "Global Link", emoji: "🌐", color: "#0891B2" },
  { id: "rapid", name: "Rapid Rail", emoji: "🚆", color: "#4F46E5" },
  { id: "direct", name: "Direct Drop", emoji: "📦", color: "#059669" },
  { id: "cargo", name: "Cargo King", emoji: "🏗️", color: "#CA8A04" },
  { id: "flash", name: "Flash Fleet", emoji: "⚡", color: "#9333EA" },
];

export const LOGISTICS_TIPS = [
  "Pro Tip: Always double-check your shipping address to avoid delivery delays.",
  "Did you know? The world's longest freight train measured over 7.3 kilometers in length!",
  "Logistics Fact: The Port of Shanghai is the busiest container port in the world.",
  "Shipping Insight: Air freight is typically 15-20x more expensive than sea freight.",
  "Industry Note: Over 90% of global trade is carried by the international shipping industry.",
  "Tracking Tip: Most carriers update tracking every 2-4 hours at major checkpoints.",
  "Fun Fact: The longest delivery route in the world covers over 1,800 km in Australia.",
  "Did you know? The first modern shipping container was invented by Malcolm McLean in 1956.",
  "Logistics Insight: Just-in-time delivery can reduce inventory costs by up to 30%.",
  "Pro Tip: Package your items with at least 2 inches of cushioning on all sides.",
  "Industry Fact: The global logistics market is valued at over $10 trillion annually.",
  "Did you know? The Panama Canal saves ships a 15,000 km journey around South America.",
  "Shipping Tip: Clear customs documentation can reduce border delays by up to 70%.",
  "Logistics Fact: The largest cargo ship can carry over 24,000 TEU containers.",
  "Did you know? Drones are now being tested for last-mile delivery in major cities.",
  "Pro Tip: Insure high-value shipments for their full replacement value.",
  "Industry Note: Real-time GPS tracking has reduced package theft by over 40%.",
  "Fun Fact: The first airmail delivery happened in 1911 in India.",
  "Logistics Insight: Cross-docking can reduce distribution center storage needs by 50%.",
  "Did you know? Autonomous trucks are expected to handle 80% of long-haul freight by 2035.",
];

export const STATUS_STEPS = [
  { status: "sent", label: "Sent", icon: "📤" },
  { status: "held_by_customs", label: "Customs", icon: "🏛️" },
  { status: "received", label: "Received", icon: "📦" },
  { status: "delivered", label: "Delivered", icon: "✅" },
];

export const STATUS_COLORS: Record<string, string> = {
  sent: "bg-blue-600",
  received: "bg-amber-500",
  delivered: "bg-emerald-600",
  canceled: "bg-red-600",
  held_by_customs: "bg-orange-500",
};

export const STATUS_LABELS: Record<string, string> = {
  sent: "Sent",
  received: "Received",
  delivered: "Delivered",
  canceled: "Canceled",
  held_by_customs: "Held by Customs",
};
