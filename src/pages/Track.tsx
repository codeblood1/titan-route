import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, useInView } from "framer-motion";
import {
  Search,
  Truck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Star,
  Clock,
  Globe,
  Zap,
  Mail,
  ChevronRight,
  Plane,
  Ship,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlideshow from "@/components/HeroSlideshow";
import { useLanguage } from "@/hooks/useLanguage";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-white">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

function MarqueeLogos() {
  const logos = [
    { name: "Amazon", icon: "📦" },
    { name: "FedEx", icon: "🚚" },
    { name: "DHL", icon: "✈️" },
    { name: "UPS", icon: "📮" },
    { name: "Maersk", icon: "🚢" },
    { name: "CMA CGM", icon: "⚓" },
    { name: "COSCO", icon: "🌊" },
    { name: "MSC", icon: "🛳️" },
  ];

  return (
    <div className="relative overflow-hidden py-8">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
      <motion.div
        className="flex gap-12 items-center"
        animate={{ x: [0, -800] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...logos, ...logos, ...logos].map((logo, i) => (
          <div key={i} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors shrink-0">
            <span className="text-2xl">{logo.icon}</span>
            <span className="text-lg font-semibold">{logo.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function Track() {
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      navigate(`/track/${trackingCode.trim().toUpperCase()}`);
    }, 800);
  };

  const testimonials = [
    {
      name: "Jennifer Walsh",
      role: "Supply Chain Director, TechFlow Inc.",
      text: "TitanRoute reduced our shipping costs by 30% while improving delivery times. Their analytics dashboard gives us visibility we never had before.",
      stars: 5,
    },
    {
      name: "Robert Kim",
      role: "Owner, Kim's Electronics",
      text: "As a small business, I need reliability without the enterprise price tag. TitanRoute delivers exactly that. My customers love the real-time tracking.",
      stars: 5,
    },
    {
      name: "Amara Osei",
      role: "Logistics Manager, Global Pharma",
      text: "Temperature-controlled shipping for pharmaceuticals is critical. TitanRoute's cold chain solution has maintained 100% compliance for 18 months straight.",
      stars: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <Header />

      {/* Hero Section */}
      <section className="relative text-white pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <HeroSlideshow />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm font-medium mb-6">
                <Zap className="h-4 w-4" />
                {t("heroTagline")}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.15]">
                {t("shipFaster")} <br />
                {t("trackSmarter")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  {t("deliverBetter")}
                </span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-lg leading-relaxed">
                {t("heroDesc")}
              </p>

              {/* Tracking Form */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder={t("enterTracking")}
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    className="h-12 pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-blue-400"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  type="submit"
                  className="h-12 bg-blue-600 hover:bg-blue-500 text-white px-6 font-semibold"
                  disabled={isSearching || !trackingCode.trim()}
                >
                  {isSearching ? t("tracking") : t("track")}
                </Button>
              </form>

              <div className="flex items-center gap-6 mt-6 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  {t("noAccountNeeded")}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  {t("realTimeUpdates")}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
                  {/* Simulated tracking card */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-400">{t("trackingNumber")}</p>
                      <p className="text-lg font-mono font-bold">ABC123DEF4</p>
                    </div>
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                      {t("delivered")}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/30 flex items-center justify-center text-lg">🚚</div>
                      <div className="flex-1">
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full w-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                      <div>
                        <div className="w-6 h-6 rounded-full bg-blue-600 mx-auto mb-1 flex items-center justify-center text-[10px]">📤</div>
                        {t("pickedByCourier")}
                      </div>
                      <div>
                        <div className="w-6 h-6 rounded-full bg-blue-600 mx-auto mb-1 flex items-center justify-center text-[10px]">📦</div>
                        {t("onTheWay")}
                      </div>
                      <div>
                        <div className="w-6 h-6 rounded-full bg-green-600 mx-auto mb-1 flex items-center justify-center text-[10px]">✅</div>
                        {t("delivered")}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">120+ {t("countries")}</p>
                    <p className="text-xs text-slate-500">{t("globalLogistics")}</p>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                  className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">99% {t("onTimeRate")}</p>
                    <p className="text-xs text-slate-500">{t("delivered")}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-blue-700 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { target: 50, suffix: "K+", label: t("deliveries") },
              { target: 120, suffix: "+", label: t("countries") },
              { target: 99, suffix: "%", label: t("onTimeRate") },
              { target: 47, suffix: "", label: t("warehouses") },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                <p className="text-sm text-blue-200 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("howItWorks")}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{t("howItWorksDesc")}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: t("bookOnline"), desc: t("bookOnlineDesc"), icon: "📝", color: "bg-blue-50 text-blue-700" },
              { step: "02", title: t("wePickUp"), desc: t("wePickUpDesc"), icon: "📦", color: "bg-sky-50 text-sky-700" },
              { step: "03", title: t("trackLive"), desc: t("trackLiveDesc"), icon: "📍", color: "bg-indigo-50 text-indigo-700" },
              { step: "04", title: t("stepDelivered"), desc: t("stepDeliveredDesc"), icon: "✅", color: "bg-emerald-50 text-emerald-700" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative"
              >
                <Card className="border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full group">
                  <CardContent className="pt-6 pb-6 text-center">
                    <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="text-4xl font-black text-slate-100 mb-2">{item.step}</div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </CardContent>
                </Card>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-1/3 -right-3 z-10 w-6 h-6 items-center justify-center">
                    <ChevronRight className="h-6 w-6 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("multiModalShipping")}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{t("multiModalDesc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: t("groundFreight"), desc: t("groundFreightDesc"), color: "from-blue-600 to-blue-700", emoji: "🚚" },
              { icon: Plane, title: t("airFreight"), desc: t("airFreightDesc"), color: "from-sky-600 to-sky-700", emoji: "✈️" },
              { icon: Ship, title: t("oceanFreight"), desc: t("oceanFreightDesc"), color: "from-teal-600 to-teal-700", emoji: "🚢" },
              { icon: Warehouse, title: t("warehousing"), desc: t("warehousingDesc"), color: "from-amber-600 to-amber-700", emoji: "🏭" },
            ].map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
                  <div className={`h-1.5 bg-gradient-to-r ${service.color}`} />
                  <CardContent className="pt-6 pb-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                      {service.emoji}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{service.desc}</p>
                    <button
                      onClick={() => navigate("/services")}
                      className="text-sm font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 group/link"
                    >
                      {t("learnMore")}
                      <ArrowUpRight className="h-4 w-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t("trustedByBusinesses")}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{t("trustedByDesc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.stars }).map((_, s) => (
                        <Star key={s} className="h-5 w-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center font-bold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos Marquee */}
      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-slate-500 font-medium mb-4 uppercase tracking-wider">
            {t("heroTagline")}
          </p>
          <MarqueeLogos />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("readyToTransform")}</h2>
              <p className="text-slate-300 mb-8 text-lg">
                {t("ctaDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="h-12 bg-blue-600 hover:bg-blue-500 text-white px-8 text-base font-semibold"
                  onClick={() => navigate("/contact")}
                >
                  {t("getFreeQuote")}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-white/30 text-white hover:bg-white/10 px-8 text-base"
                  onClick={() => navigate("/services")}
                >
                  {t("exploreServices")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Mail className="h-10 w-10 text-blue-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("stayInLoop")}</h2>
            <p className="text-slate-500 mb-6">{t("newsletterDesc")}</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
              <Input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="h-11"
                required
              />
              <Button type="submit" className="h-11 bg-blue-700 hover:bg-blue-800 px-6">
                {t("subscribe")}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
