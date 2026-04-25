import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, useInView } from "framer-motion";
import {
  Truck,
  Globe,
  Shield,
  Clock,
  Users,
  Award,
  TrendingUp,
  Heart,
  ArrowRight,
  CheckCircle2,
  Package,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-blue-700">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function About() {
  const navigate = useNavigate();

  const values = [
    { icon: Shield, title: "Integrity", desc: "We handle every package with honesty, transparency, and accountability." },
    { icon: Clock, title: "Speed", desc: "Time-critical deliveries are our specialty. We move fast so you don't have to wait." },
    { icon: Heart, title: "Care", desc: "Every shipment matters. We treat your cargo as if it were our own." },
    { icon: TrendingUp, title: "Innovation", desc: "We invest in cutting-edge tracking, AI routing, and sustainable logistics." },
  ];

  const milestones = [
    { year: "2018", title: "Founded", desc: "TitanRoute started with a single warehouse in Miami." },
    { year: "2020", title: "Global Expansion", desc: "Opened operations in 12 countries across 4 continents." },
    { year: "2022", title: "Tech Innovation", desc: "Launched real-time GPS tracking and AI-powered route optimization." },
    { year: "2024", title: "Industry Leader", desc: "Processing 50,000+ shipments monthly with 99% on-time delivery." },
    { year: "2025", title: "The Future", desc: "Expanding drone delivery pilots and carbon-neutral shipping lanes." },
  ];

  const team = [
    { name: "Marcus Chen", role: "CEO & Founder", emoji: "👨‍💼" },
    { name: "Sarah Okafor", role: "COO", emoji: "👩‍💼" },
    { name: "David Kim", role: "CTO", emoji: "👨‍💻" },
    { name: "Elena Rossi", role: "Head of Logistics", emoji: "👩‍✈️" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
              <Award className="h-4 w-4" />
              About TitanRoute
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Delivering Excellence <br />
              <span className="text-blue-400">Across the Globe</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mb-8">
              Since 2018, TitanRoute has been transforming how businesses and individuals move goods worldwide. From a single warehouse to a global network, our mission remains the same: deliver faster, safer, and smarter.
            </p>
            <div className="flex gap-4">
              <Button
                className="bg-blue-600 hover:bg-blue-500 text-white px-6"
                onClick={() => navigate("/contact")}
              >
                Get in Touch
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6"
                onClick={() => navigate("/services")}
              >
                Our Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { target: 50, suffix: "K+", label: "Deliveries Completed" },
              { target: 120, suffix: "+", label: "Countries Served" },
              { target: 99, suffix: "%", label: "On-Time Rate" },
              { target: 24, suffix: "/7", label: "Customer Support" },
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
                <p className="text-sm text-slate-500 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                TitanRoute was born from a simple frustration: shipping should not be this complicated. In 2018, our founder Marcus Chen watched a critical medical shipment get lost in bureaucratic limbo for three weeks. That moment sparked a mission.
              </p>
              <p className="text-slate-600 mb-4 leading-relaxed">
                What started as a single-warehouse operation in Miami has grown into a global logistics powerhouse. We now operate 47 fulfillment centers across 6 continents, processing over 50,000 shipments every month.
              </p>
              <p className="text-slate-600 leading-relaxed">
                But growth never changed our core belief: every package carries someone's trust. Whether it is a birthday gift crossing an ocean or life-saving medical supplies racing against time, we deliver with the urgency it deserves.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
                <div className="text-5xl mb-4">🌍</div>
                <blockquote className="text-lg italic leading-relaxed">
                  "We don't just move boxes. We move businesses forward, families closer, and communities stronger."
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">👨‍💼</div>
                  <div>
                    <p className="font-semibold">Marcus Chen</p>
                    <p className="text-sm text-blue-200">Founder & CEO</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">The principles that guide every decision we make and every package we handle.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="pt-6 pb-6 text-center">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <val.icon className="h-7 w-7 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{val.title}</h3>
                    <p className="text-sm text-slate-600">{val.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Journey</h2>
            <p className="text-slate-500">From a single warehouse to a global logistics network.</p>
          </motion.div>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-6 pb-10 relative"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-sm">
                    {m.year}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-blue-200 absolute top-12 left-6" />
                  )}
                </div>
                <div className="pb-2 pt-1">
                  <h3 className="text-lg font-bold text-slate-900">{m.title}</h3>
                  <p className="text-slate-600">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Leadership Team</h2>
            <p className="text-slate-500">The people driving TitanRoute forward.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-0 shadow-sm text-center overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-24 bg-gradient-to-br from-blue-700 to-blue-900" />
                  <CardContent className="pt-0 pb-6 -mt-10">
                    <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-4xl mx-auto mb-3 border-4 border-white">
                      {member.emoji}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Ready to Ship with Us?
            </h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">
              Join thousands of businesses that trust TitanRoute for their logistics needs. Get a quote in minutes.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                className="bg-blue-700 hover:bg-blue-800 px-8"
                onClick={() => navigate("/contact")}
              >
                Get a Quote
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="border-slate-300 px-8"
                onClick={() => navigate("/services")}
              >
                Explore Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
