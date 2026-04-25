import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Truck,
  Ship,
  Plane,
  Warehouse,
  MapPin,
  Shield,
  Clock,
  Package,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Globe,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Services() {
  const navigate = useNavigate();

  const mainServices = [
    {
      icon: Truck,
      title: "Ground Freight",
      desc: "Full truckload (FTL) and less-than-truckload (LTL) services across North America. Real-time tracking, guaranteed delivery windows, and white-glove handling options.",
      features: ["Same-day pickup", "Real-time GPS tracking", "Temperature-controlled trucks", "Last-mile delivery"],
      color: "from-blue-600 to-blue-700",
      bgIcon: "🚚",
    },
    {
      icon: Plane,
      title: "Air Freight",
      desc: "Express and standard air cargo to 120+ countries. Priority handling for urgent shipments with door-to-door service and customs clearance included.",
      features: ["Next-flight-out options", "Dangerous goods certified", "Charter services", "AWB tracking"],
      color: "from-sky-600 to-sky-700",
      bgIcon: "✈️",
    },
    {
      icon: Ship,
      title: "Ocean Freight",
      desc: "FCL and LCL container shipping with the world's top carriers. Flexible sailing schedules, competitive rates, and end-to-end supply chain visibility.",
      features: ["FCL & LCL options", "Consolidation services", "Port-to-port or door-to-door", "Customs brokerage"],
      color: "from-teal-600 to-teal-700",
      bgIcon: "🚢",
    },
    {
      icon: Warehouse,
      title: "Warehousing",
      desc: "47 fulfillment centers worldwide offering storage, pick-and-pack, kitting, and inventory management with WMS integration and same-day dispatch.",
      features: ["Climate-controlled storage", "Real-time inventory sync", "Same-day fulfillment", "Returns processing"],
      color: "from-amber-600 to-amber-700",
      bgIcon: "🏭",
    },
  ];

  const addOns = [
    { icon: Shield, title: "Cargo Insurance", desc: "Full-value coverage for high-risk or high-value shipments with claims processed within 48 hours." },
    { icon: MapPin, title: "Live Tracking", desc: "GPS-enabled tracking with SMS and email alerts at every checkpoint. Share tracking links with recipients." },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Business intelligence tools showing shipping costs, carrier performance, and delivery trends." },
    { icon: Headphones, title: "Dedicated Support", desc: "24/7 phone, chat, and email support with a dedicated account manager for enterprise clients." },
    { icon: Globe, title: "Customs Clearance", desc: "In-house customs brokers handle documentation, duties, and compliance in 80+ countries." },
    { icon: Package, title: "White Glove Delivery", desc: "Inside delivery, unpacking, debris removal, and assembly services for fragile or oversized items." },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "per shipment + carrier rates",
      desc: "Perfect for individuals and small businesses shipping occasionally.",
      features: ["Up to 20 shipments/month", "Standard tracking", "Email support", "5 carrier options", "Basic reporting"],
      cta: "Start Shipping",
      popular: false,
    },
    {
      name: "Business",
      price: "$99",
      period: "/month",
      desc: "Designed for growing businesses with regular shipping needs.",
      features: ["Unlimited shipments", "Real-time GPS tracking", "Priority support", "All 10 carriers", "Advanced analytics", "API access", "Custom branding"],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact sales",
      desc: "Tailored solutions for large-scale operations and supply chains.",
      features: ["Everything in Business", "Dedicated account manager", "Custom integrations", "SLA guarantees", "Volume discounts", "Multi-user accounts", "White-label options"],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
              <Package className="h-4 w-4" />
              Our Services
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Shipping Solutions <br />
              <span className="text-blue-400">Built for Every Need</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mb-8">
              From a single envelope to a full container load, we have the right service at the right price. Ground, air, ocean, and warehouse — all under one roof.
            </p>
            <div className="flex gap-4">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6" onClick={() => navigate("/contact")}>
                Get a Quote
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6" onClick={() => document.getElementById("services-grid")?.scrollIntoView({ behavior: "smooth" })}>
                Explore Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section id="services-grid" className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core Services</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Multi-modal logistics solutions tailored to your timeline, budget, and cargo type.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {mainServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full">
                  <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        {service.bgIcon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                        <p className="text-sm text-slate-600 mb-4">{service.desc}</p>
                        <ul className="space-y-1">
                          {service.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                              <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Value-Add Services</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Enhance your shipping experience with premium add-ons designed for peace of mind.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((addon, i) => (
              <motion.div
                key={addon.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="pt-6 pb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <addon.icon className="h-6 w-6 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{addon.title}</h3>
                    <p className="text-sm text-slate-600">{addon.desc}</p>
                  </CardContent>
                </Card>
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Four simple steps from booking to delivery.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Book", desc: "Enter shipment details and get instant quotes from multiple carriers.", icon: "📝" },
              { step: "02", title: "Pickup", desc: "We collect your package from your door or you drop it at a hub.", icon: "📦" },
              { step: "03", title: "Track", desc: "Follow your shipment in real-time with GPS tracking and alerts.", icon: "📍" },
              { step: "04", title: "Deliver", desc: "Your package arrives safely. Proof of delivery with signature and photo.", icon: "✅" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg transition-shadow h-full">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className="text-3xl font-black text-blue-100 mb-2">{item.step}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="h-6 w-6 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Transparent pricing with no hidden fees. Pay for what you ship.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className={`border-0 h-full ${plan.popular ? "bg-blue-700 text-white ring-4 ring-blue-500/30" : "bg-slate-800 text-white"}`}>
                  <CardContent className="pt-6 pb-6">
                    {plan.popular && (
                      <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-4">
                        Most Popular
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={`text-sm ${plan.popular ? "text-blue-200" : "text-slate-400"}`}> {plan.period}</span>
                    </div>
                    <p className={`text-sm mb-6 ${plan.popular ? "text-blue-100" : "text-slate-400"}`}>{plan.desc}</p>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.popular ? "text-blue-300" : "text-blue-400"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.popular ? "bg-white text-blue-700 hover:bg-blue-50" : "bg-blue-600 hover:bg-blue-500 text-white"}`}
                      onClick={() => navigate("/contact")}
                    >
                      {plan.cta}
                    </Button>
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
              Not Sure Which Service Fits?
            </h2>
            <p className="text-slate-500 mb-8 max-w-xl mx-auto">
              Our logistics experts will analyze your needs and recommend the most cost-effective solution. Free consultation, no commitment.
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-blue-700 hover:bg-blue-800 px-8" onClick={() => navigate("/contact")}>
                Talk to an Expert
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-slate-300 px-8" onClick={() => navigate("/")}>
                Track a Shipment
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
