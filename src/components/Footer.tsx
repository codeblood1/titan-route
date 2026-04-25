import { Link } from "react-router";
import { Truck, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { DailyTip } from "@/components/FishFact";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">TitanRoute</span>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Global logistics solutions built for speed, reliability, and transparency. Shipping made simple.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Services</h4>
            <ul className="space-y-2">
              {["Ground Freight", "Air Freight", "Ocean Freight", "Warehousing", "Last Mile Delivery"].map((item) => (
                <li key={item}>
                  <Link to="/services" className="text-sm hover:text-blue-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              {["About Us", "Careers", "Blog", "Press", "Partners"].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-sm hover:text-blue-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                1200 Harbor Blvd, Miami, FL 33132
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                +1 (800) 555-TRTN
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                support@titanroute.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © 2025 TitanRoute. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
            <Link to="/" className="hover:text-blue-400 transition-colors">Cookie Policy</Link>
          </div>
          <div className="hidden lg:block">
            <DailyTip />
          </div>
        </div>
      </div>
    </footer>
  );
}
