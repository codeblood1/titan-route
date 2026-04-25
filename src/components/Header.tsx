import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Truck, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${scrolled ? "bg-blue-700" : "bg-white/20 backdrop-blur"}`}>
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className={`text-lg font-bold leading-tight transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
                TitanRoute
              </h1>
              {!scrolled && (
                <p className="text-[10px] text-white/70 leading-none">Global Logistics</p>
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? scrolled
                      ? "text-blue-700 bg-blue-50"
                      : "text-white bg-white/20"
                    : scrolled
                      ? "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`hidden sm:flex text-sm ${scrolled ? "text-slate-600 hover:text-blue-700" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              onClick={() => navigate("/admin")}
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Admin
            </Button>
            <Button
              size="sm"
              className={`text-sm ${scrolled ? "bg-blue-700 hover:bg-blue-800 text-white" : "bg-white/20 hover:bg-white/30 text-white backdrop-blur"}`}
              onClick={() => navigate("/contact")}
            >
              Get Quote
            </Button>
            <button
              className="md:hidden p-2 rounded-lg"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className={`h-5 w-5 ${scrolled ? "text-slate-700" : "text-white"}`} />
              ) : (
                <Menu className={`h-5 w-5 ${scrolled ? "text-slate-700" : "text-white"}`} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-72 bg-white shadow-xl flex flex-col pt-20 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium mb-1 ${
                  isActive(item.path)
                    ? "text-blue-700 bg-blue-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <hr className="my-3 border-slate-100" />
            <Button
              variant="ghost"
              size="sm"
              className="justify-start text-slate-600"
              onClick={() => { setMobileOpen(false); navigate("/admin"); }}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
