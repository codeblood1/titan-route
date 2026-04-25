import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  Truck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  Globe,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, send to your backend or email service
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", company: "", phone: "", subject: "", message: "" });
    }, 3000);
  };

  const contactInfo = [
    { icon: MapPin, title: "Headquarters", lines: ["1200 Harbor Blvd, Suite 500", "Miami, FL 33132, USA"] },
    { icon: Phone, title: "Phone", lines: ["+1 (800) 555-TRTN", "+1 (305) 555-0100"] },
    { icon: Mail, title: "Email", lines: ["support@titanroute.com", "sales@titanroute.com"] },
    { icon: Clock, title: "Hours", lines: ["Mon - Fri: 8:00 AM - 8:00 PM EST", "Sat - Sun: 10:00 AM - 4:00 PM EST"] },
  ];

  const offices = [
    { city: "New York", address: "450 Lexington Ave, Floor 12", emoji: "🏙️" },
    { city: "London", address: "22 Bishopsgate, EC2N 4BQ", emoji: "🇬🇧" },
    { city: "Singapore", address: "1 Raffles Place, Tower 2", emoji: "🇸🇬" },
    { city: "Dubai", address: "DIFC, Gate Village Building 5", emoji: "🇦🇪" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
              <MessageSquare className="h-4 w-4" />
              Contact Us
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              We are Here to <br />
              <span className="text-blue-400">Help You Ship</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-xl mb-8">
              Questions about a shipment? Need a custom quote? Want to partner with us? Our team is ready to assist you 24/7.
            </p>
            <div className="flex gap-4">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white px-6" onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}>
                Send a Message
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6" onClick={() => navigate("/services")}>
                View Services
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, i) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="pt-6 pb-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <info.icon className="h-6 w-6 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{info.title}</h3>
                    {info.lines.map((line) => (
                      <p key={line} className="text-sm text-slate-600">{line}</p>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Offices */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
              <p className="text-slate-500 mb-8">Fill out the form below and we will get back to you within 24 hours.</p>

              <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6 pb-6">
                  {submitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                      <p className="text-slate-500">Thank you for reaching out. Our team will respond shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-1 block">Full Name *</label>
                          <Input
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-1 block">Email *</label>
                          <Input
                            type="email"
                            placeholder="john@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-1 block">Company</label>
                          <Input
                            placeholder="Your Company"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label>
                          <Input
                            placeholder="+1 555-000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Subject *</label>
                        <Input
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Message *</label>
                        <textarea
                          className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Tell us about your shipping needs..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 h-11">
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Offices */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Global Offices</h2>
              <p className="text-slate-500 mb-8">Find us in major logistics hubs worldwide.</p>
              <div className="space-y-4">
                {offices.map((office, i) => (
                  <motion.div
                    key={office.city}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
                  >
                    <span className="text-2xl">{office.emoji}</span>
                    <div>
                      <h3 className="font-bold text-slate-900">{office.city}</h3>
                      <p className="text-sm text-slate-600">{office.address}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-blue-700 to-blue-800 rounded-xl text-white">
                <div className="flex items-center gap-3 mb-3">
                  <Headphones className="h-6 w-6" />
                  <h3 className="text-lg font-bold">24/7 Support Hotline</h3>
                </div>
                <p className="text-blue-100 text-sm mb-3">
                  Urgent shipment issue? Our support team is always available.
                </p>
                <p className="text-2xl font-bold">+1 (800) 555-TRTN</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="py-10 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Our Global Network</h2>
            <p className="text-slate-500">47 fulfillment centers across 6 continents</p>
          </motion.div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-80 flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }} />
            <div className="relative z-10 text-center">
              <Globe className="h-16 w-16 text-blue-200 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">Interactive map coming soon</p>
              <p className="text-slate-300 text-sm">47 centers • 120+ countries • 6 continents</p>
            </div>
            {/* Simulated location dots */}
            {[
              { x: "20%", y: "35%", label: "New York" },
              { x: "48%", y: "30%", label: "London" },
              { x: "75%", y: "40%", label: "Singapore" },
              { x: "55%", y: "55%", label: "Dubai" },
              { x: "85%", y: "65%", label: "Sydney" },
              { x: "25%", y: "55%", label: "São Paulo" },
            ].map((loc) => (
              <div
                key={loc.label}
                className="absolute flex flex-col items-center"
                style={{ left: loc.x, top: loc.y }}
              >
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse shadow-lg shadow-blue-500/50" />
                <span className="text-xs text-slate-600 mt-1 font-medium bg-white/80 px-1.5 py-0.5 rounded">{loc.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
