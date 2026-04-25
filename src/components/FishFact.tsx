import { useMemo } from "react";
import { LOGISTICS_TIPS } from "@/const";

export function DailyTip() {
  const tip = useMemo(() => {
    const today = new Date().toDateString();
    const seed = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = seed % LOGISTICS_TIPS.length;
    return LOGISTICS_TIPS[index];
  }, []);

  return (
    <div className="max-w-4xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur rounded-full shadow-sm border border-slate-200">
        <span className="text-lg">💡</span>
        <span className="text-sm text-slate-700 font-medium">{tip}</span>
      </div>
    </div>
  );
}
