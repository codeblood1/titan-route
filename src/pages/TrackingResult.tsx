import { useEffect, useState, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router";
import { packageService } from "@/lib/supabase";
import type { Package, PackageHistory } from "@/lib/supabase";
import MediaLightbox from "@/components/MediaLightbox";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/hooks/useLanguage";
import {
  ArrowLeft, Package, MapPin, Phone, Weight, Clock,
  CheckCircle2, Printer, Truck, ClipboardCheck, Box, AlertTriangle,
  Home, Image as ImageIcon, Video, Play, Loader2, ZoomIn,
  Shield, Globe, Calendar, CreditCard, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LiveMap = lazy(() => import("@/components/LiveMap"));

const TEAL = {
  50: "#f0fdfa",
  100: "#ccfbf1",
  500: "#14b8a6",
  600: "#0d9488",
  700: "#0f766e",
};

export default function TrackingResult() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [history, setHistory] = useState<PackageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Dynamic status config that uses translations
  const STATUS_CONFIG: Record<string, { color: string; badgeBg: string; badgeText: string; icon: React.ReactNode }> = {
    order_confirmed: {
      color: TEAL[600],
      badgeBg: "bg-teal-50",
      badgeText: "text-teal-700",
      icon: <ClipboardCheck className="h-4 w-4" />,
    },
    picked_by_courier: {
      color: "#3b82f6",
      badgeBg: "bg-blue-50",
      badgeText: "text-blue-700",
      icon: <Box className="h-4 w-4" />,
    },
    on_the_way: {
      color: "#6366f1",
      badgeBg: "bg-indigo-50",
      badgeText: "text-indigo-700",
      icon: <Truck className="h-4 w-4" />,
    },
    held_by_customs: {
      color: "#f59e0b",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-700",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    delivered: {
      color: "#10b981",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-700",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
  };

  const STATUS_ORDER = ["order_confirmed", "picked_by_courier", "on_the_way", "held_by_customs", "delivered"];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await packageService.getByTrackingCode(code || "");
        if (!cancelled) {
          if (data) {
            setPkg(data);
            const h = await packageService.getHistory(data.id);
            if (!cancelled) setHistory(h);
          } else {
            setError(t("trackingNotFound"));
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || t("loadingTracking"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [code, t]);

  const copyTracking = () => {
    if (pkg?.trackingCode) {
      navigator.clipboard.writeText(pkg.trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Barcode SVG generator
  function Barcode({ value }: { value: string }) {
    const bars = value.split("").map((char, i) => {
      const code = char.charCodeAt(0);
      const width1 = ((code * 7) % 3) + 1;
      const width2 = ((code * 13) % 2) + 1;
      const gap = ((code * 3) % 2) + 1;
      return (
        <g key={i}>
          <rect x={i * 12} y="0" width={width1} height="50" fill="#1e293b" />
          <rect x={i * 12 + width1 + gap} y="0" width={width2} height="50" fill="#1e293b" />
        </g>
      );
    });

    return (
      <div className="text-center py-4">
        <svg viewBox="0 0 120 50" className="w-full max-w-[240px] h-auto mx-auto" preserveAspectRatio="none">
          {bars}
        </svg>
        <p className="text-xs font-mono text-slate-500 mt-2 tracking-widest">{value}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">{t("loadingTracking")}</p>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">{t("trackingNotFound")}</h2>
            <p className="text-sm text-slate-500 mb-4">{error || t("notFoundDesc")}</p>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => navigate("/")}>{t("trackAnother")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.order_confirmed;
  const currentStep = STATUS_ORDER.indexOf(pkg.status);

  // Translated status labels
  const statusLabels: Record<string, string> = {
    order_confirmed: t("orderConfirmed"),
    picked_by_courier: t("pickedByCourier"),
    on_the_way: t("onTheWay"),
    held_by_customs: t("customHold"),
    delivered: t("delivered"),
  };

  const statusLabel = statusLabels[pkg.status] || t("orderConfirmed");

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-500 hover:text-teal-700 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">{t("back")}</span>
          </button>
          <span className="text-sm font-semibold text-slate-900">{t("trackingDetails")}</span>
          <div className="flex items-center gap-1">
            <LanguageSelector currentLang={lang} onChange={setLang} />
            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-teal-700 transition-colors p-2 rounded-lg hover:bg-slate-100">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">{t("print")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5" dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* ===== RECEIPT HEADER ===== */}
        <Card className="border-0 shadow-sm overflow-hidden">
          {/* Brand Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">TitanRoute</h1>
                  <p className="text-xs text-slate-400">{t("globalLogistics")}</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{t("receiptGenerated")}</p>
                <p className="text-xs text-slate-600 font-medium">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <Badge variant="outline" className="mt-1.5 text-[10px] border-teal-200 text-teal-700 bg-teal-50">
                  {t("officialReceipt")}
                </Badge>
              </div>
            </div>
            <div className="mt-3 sm:hidden">
              <Badge variant="outline" className="text-[10px] border-teal-200 text-teal-700 bg-teal-50">
                {t("officialReceipt")}
              </Badge>
            </div>
          </div>

          {/* Tracking Number Bar */}
          <div className="mx-6 mb-5">
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-teal-100 text-[10px] uppercase tracking-wider font-medium">{t("trackingNumber")}</p>
                  <p className="text-white font-bold text-lg font-mono tracking-wider">{pkg.trackingCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyTracking}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  title={t("copyTracking")}
                >
                  {copied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4 text-white" />}
                </button>
                <div className="hidden sm:flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 backdrop-blur-sm">
                  <Shield className="h-3.5 w-3.5 text-white" />
                  <span className="text-white text-xs font-medium">{t("verified")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sender & Receiver */}
          <div className="px-6 pb-6 space-y-4">
            {/* Sender */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Home className="h-3.5 w-3.5 text-teal-700" />
                </div>
                <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">{t("sender")}</span>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900 text-sm">{pkg.senderName}</p>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">{pkg.senderAddress || pkg.address}</span>
                </div>
                {pkg.senderPhone && (
                  <div className="flex items-center gap-2 text-slate-500">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs">{pkg.senderPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Receiver */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-blue-700" />
                </div>
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{t("receiver")}</span>
              </div>
              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900 text-sm">{pkg.recipientName}</p>
                <div className="flex items-center gap-2 text-slate-500">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">{pkg.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs">{pkg.address}</span>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div className="border-t border-slate-100 pt-4">
              <Barcode value={pkg.trackingCode} />
            </div>

            {/* Shipment Details Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{t("shipmentDetails")}</p>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-slate-500">{t("orderId")}</span>
                  <span className="text-sm font-medium text-slate-900 font-mono">{pkg.trackingCode.slice(-4)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-slate-500">{t("bookingMode")}</span>
                  <Badge className="bg-rose-50 text-rose-700 border-0 text-[10px]">
                    <Calendar className="h-3 w-3 mr-1" />
                    {t("toDay")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-slate-500">{t("shipmentCost")}</span>
                  <span className="text-sm font-semibold text-slate-900">${(pkg.shippingCost || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-slate-500">{t("clearanceFee")}</span>
                  <span className="text-sm font-medium text-slate-900">${(pkg.clearanceFee || 0).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <span className="text-xs font-semibold text-slate-700">{t("totalAmount")}</span>
                  <span className="text-base font-bold text-teal-700">${((pkg.shippingCost || 0) + (pkg.clearanceFee || 0)).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-slate-500">{t("status")}</span>
                  <Badge className={`${config.badgeBg} ${config.badgeText} border-0 text-xs font-medium`}>
                    {statusLabel}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== PROGRESS BAR ===== */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 rounded-full" />
              <div
                className="absolute top-4 left-0 h-0.5 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max((currentStep / (STATUS_ORDER.length - 1)) * 100, 5)}%`,
                  background: `linear-gradient(to right, ${TEAL[500]}, ${config.color})`,
                }}
              />
              <div className="relative flex justify-between">
                {STATUS_ORDER.map((statusKey, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const sConfig = STATUS_CONFIG[statusKey];
                  return (
                    <div key={statusKey} className="flex flex-col items-center gap-1.5" style={{ width: "20%" }}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-300"
                        style={{
                          backgroundColor: isCompleted ? sConfig.color : "#e2e8f0",
                          boxShadow: isCurrent ? `0 0 0 4px ${sConfig.color}30` : "none",
                          transform: isCurrent ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                      </div>
                      <span className={`text-[9px] font-medium text-center leading-tight ${isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                        {statusLabels[statusKey] || statusKey}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== SHIPMENT INFO BAR ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Weight, label: t("weight"), value: `${pkg.weight} ${t("kg")}` },
            { icon: Globe, label: t("mode"), value: t("seaFreight") },
            { icon: Calendar, label: t("pickup"), value: new Date(pkg.createdAt).toLocaleDateString() },
            { icon: CreditCard, label: t("total"), value: `$${((pkg.shippingCost || 0) + (pkg.clearanceFee || 0)).toFixed(2)}` },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 bg-teal-50 rounded-md flex items-center justify-center">
                  <item.icon className="h-3 w-3 text-teal-600" />
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* ===== LIVE MAP ===== */}
        {(pkg.senderLat || pkg.receiverLat) && (
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-teal-700" />
                </div>
                <span className="font-semibold">{t("liveRouteTracking")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-64">
                <Suspense fallback={
                  <div className="h-full flex items-center justify-center bg-slate-50">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  </div>
                }>
                  <LiveMap
                    status={pkg.status}
                    senderLat={pkg.senderLat}
                    senderLng={pkg.senderLng}
                    receiverLat={pkg.receiverLat}
                    receiverLng={pkg.receiverLng}
                  />
                </Suspense>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ===== SHIPMENT HISTORY ===== */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5 text-teal-700" />
                </div>
                <span className="font-semibold">{t("shipmentHistory")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-0">
                {history.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">{t("noHistory")}</p>
                ) : (
                  history.map((h, i) => {
                    const hConfig = STATUS_CONFIG[h.status] || STATUS_CONFIG.order_confirmed;
                    const hLabel = statusLabels[h.status] || t("orderConfirmed");
                    const isLast = i === history.length - 1;
                    return (
                      <div key={h.id} className="flex gap-3 relative">
                        {!isLast && <div className="absolute left-3.5 top-8 bottom-0 w-px bg-slate-200" />}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: hConfig.color }}>
                          {hConfig.icon}
                        </div>
                        <div className="flex-1 pb-5">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-slate-800">{hLabel}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{new Date(h.changedAt).toLocaleString()}</span>
                          {h.reason && <p className="text-xs text-slate-500 mt-1">{h.reason}</p>}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* ===== MEDIA GALLERY ===== */}
          {pkg.mediaUrls && pkg.mediaUrls.length > 0 ? (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-3.5 w-3.5 text-teal-700" />
                  </div>
                  <div>
                    <span className="font-semibold">{t("media")}</span>
                    <span className="ml-2 text-[10px] text-slate-400 font-normal">
                      {pkg.mediaUrls.length} {pkg.mediaUrls.length === 1 ? t("fileCount") : t("filesCount")}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {pkg.mediaUrls.map((url, i) => {
                    const isVid = url.match(/\.(mp4|webm|mov)$/) || url.match(/^data:video/);
                    return (
                      <button
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group cursor-pointer text-left hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      >
                        {isVid ? (
                          <>
                            <video src={url} className="w-full h-full object-cover" preload="metadata" />
                            <div className="absolute inset-0 bg-black/30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Play className="h-4 w-4 text-white ml-0.5" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <ZoomIn className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="font-semibold text-slate-500">{t("noMediaFiles")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-slate-400 text-center py-6">{t("noMedia")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Print Receipt Button */}
        <div className="flex justify-center pb-8">
          <Button
            variant="outline"
            className="border-teal-200 text-teal-700 hover:bg-teal-50 px-8"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4 mr-2" />
            {t("printReceipt")}
          </Button>
        </div>
      </div>

      {/* Media Lightbox */}
      {lightboxIndex !== null && pkg?.mediaUrls && (
        <MediaLightbox
          urls={pkg.mediaUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
