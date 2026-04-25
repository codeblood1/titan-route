import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Shield, Clock, Globe, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { DailyTip } from "@/components/FishFact";
import { FloatingIcons } from "@/components/SwimmingFish";

export default function Track() {
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      navigate(`/track/${trackingCode.trim().toUpperCase()}`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle floating icons background */}
      <FloatingIcons count={4} />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">TitanRoute</h1>
              <p className="text-xs text-slate-500">Global Logistics Solutions</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">Home</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">About</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">Services</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex border-slate-200 text-slate-700 hover:bg-slate-50"
              onClick={() => navigate("/admin")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
            <Button
              size="sm"
              className="bg-blue-700 hover:bg-blue-800 text-white"
              onClick={() => navigate("/admin")}
            >
              Get Quote
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-blue-300 text-sm font-medium mb-6">
                <Globe className="h-4 w-4" />
                Global Freight Network
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Fastest & Reliable{" "}
                <span className="text-blue-400">Courier Service</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 max-w-lg">
                We offer a full range of global, ocean-freight services including FCL, LCL, and consolidation. Your packages arrive on time, every time.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-blue-500 hover:bg-blue-400 text-white px-8"
                  onClick={() => {
                    document.getElementById("track-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Track Shipment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8"
                  onClick={() => navigate("/admin")}
                >
                  Contact Us
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="relative z-10 flex items-center justify-center w-full h-full">
                  <div className="text-9xl">🌍</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Track Section */}
      <section id="track-section" className="relative z-10 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Track Your Shipment</h3>
              <p className="text-slate-600 mb-8 max-w-md">
                Here is the fastest way to check the status of your shipment. No need to call Customer Service — our online results give you real-time, detailed progress as your shipment moves through the TitanRoute network.
              </p>
              <Card className="shadow-lg border-0">
                <CardContent className="pt-6 pb-6">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Tracking Number</label>
                      <div className="relative">
                        <Input
                          placeholder="e.g., ABC123DEF4"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          className="h-12 text-base pr-12 border-slate-300 focus:border-blue-500"
                          disabled={isSearching}
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-12 bg-blue-700 hover:bg-blue-800 text-white text-base font-semibold"
                      disabled={isSearching || !trackingCode.trim()}
                    >
                      {isSearching ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-bounce">🔍</span>
                          Searching...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search className="h-5 w-5" />
                          Track Package
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">50K+</div>
                  <div className="text-xs text-slate-500">Deliveries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">99%</div>
                  <div className="text-xs text-slate-500">On Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">24/7</div>
                  <div className="text-xs text-slate-500">Support</div>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Map illustration */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-blue-700" />
                    <span className="font-semibold text-slate-800">Live Tracking</span>
                  </div>
                  <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow" />
                          <span className="text-xs text-slate-500 mt-1">Origin</span>
                        </div>
                        <div className="w-16 h-0.5 bg-blue-400 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg">🚚</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow" />
                          <span className="text-xs text-slate-500 mt-1">Dest</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-2 bg-slate-100 rounded w-full" />
                    <div className="h-2 bg-slate-100 rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">Why Choose TitanRoute</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-slate-100 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Multi-Modal Transport</h4>
                <p className="text-sm text-slate-600">Road, sea, and air freight options tailored to your delivery timeline and budget.</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🗺️</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Live Map Tracking</h4>
                <p className="text-sm text-slate-600">Follow your package's journey in real-time with our interactive route maps.</p>
              </CardContent>
            </Card>
            <Card className="border-slate-100 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6 pb-6 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Carrier Leaderboard</h4>
                <p className="text-sm text-slate-600">Compete for the fastest delivery times with our carrier performance rankings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">TitanRoute</span>
              <span className="text-sm">Global Logistics Solutions</span>
            </div>
            <DailyTip />
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            © 2025 TitanRoute. All rights reserved. Your shipments arrive safely, on time.
          </div>
        </div>
      </footer>
    </div>
  );
}
