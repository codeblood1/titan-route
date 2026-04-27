import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { packageService } from "@/lib/supabase";
import type { Package, PackageHistory } from "@/lib/supabase";
import LiveMap from "@/components/LiveMap";
import {
  ArrowLeft, Package, MapPin, Phone, User, Weight, Clock,
  CheckCircle2, Printer, Truck, ClipboardCheck, Box, AlertTriangle,
  Home, Image as ImageIcon, Video, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  order_confirmed: { label: "Order Confirmed", color: "bg-blue-600", icon: <ClipboardCheck className="h-5 w-5" /> },
  picked_by_courier: { label: "Picked by Courier", color: "bg-blue-500", icon: <Box className="h-5 w-5" /> },
  on_the_way: { label: "On the Way", color: "bg-slate-500", icon: <Truck className="h-5 w-5" /> },
  held_by_customs: { label: "Custom Hold", color: "bg-amber-500", icon: <AlertTriangle className="h-5 w-5" /> },
  delivered: { label: "Delivered", color: "bg-emerald-600", icon: <CheckCircle2 className="h-5 w-5" /> },
};

const STATUS_ORDER = ["order_confirmed", "picked_by_courier", "on_the_way", "held_by_customs", "delivered"];

export default function TrackingResult() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // Redirect to search page if no tracking code provided
  if (!code || code.trim() === "") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Tracking Code</h2>
            <p className="text-slate-500 mb-4">Enter a tracking code to view shipment details.</p>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => navigate("/")}>Go to Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [pkg, setPkg] = useState<Package | null>(null);
  const [history, setHistory] = useState<PackageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            setError("Tracking code not found. Please check and try again.");
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load tracking data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading tracking details...</p>
        </div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Tracking Not Found</h2>
            <p className="text-sm text-slate-500 mb-2">{error || "The tracking code you entered could not be found."}</p>
            <p className="text-xs text-slate-400 mb-4">Open browser DevTools (F12) → Console to see detailed query logs.</p>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => navigate("/")}>Track Another</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const config = STATUS_CONFIG[pkg.status] || STATUS_CONFIG.order_confirmed;
  const currentStep = STATUS_ORDER.indexOf(pkg.status);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-slate-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold text-sm">Back to Track</span>
          </button>
          <h1 className="text-lg font-bold text-slate-900">TitanRoute Tracking</h1>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-700 transition-colors">
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Tracking Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm mb-1">Tracking Number</p>
              <h2 className="text-2xl md:text-3xl font-bold font-mono tracking-wider">{pkg.trackingCode}</h2>
            </div>
            <Badge className={`${config.color} text-white px-4 py-1.5 text-sm font-semibold`}>
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="border-slate-200 shadow-sm overflow-visible">
          <CardContent className="p-6">
            <div className="relative">
              {/* Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-slate-200 rounded-full" />
              <div
                className="absolute top-5 left-0 h-1 rounded-full transition-all duration-500"
                style={{
                  width: `${(currentStep / (STATUS_ORDER.length - 1)) * 100}%`,
                  backgroundColor: pkg.status === "held_by_customs" ? "#f59e0b" : pkg.status === "delivered" ? "#059669" : "#2563eb",
                }}
              />
              {/* Steps */}
              <div className="relative flex justify-between">
                {STATUS_ORDER.map((statusKey, i) => {
                  const isCompleted = i <= currentStep;
                  const isCurrent = i === currentStep;
                  const sConfig = STATUS_CONFIG[statusKey];
                  return (
                    <div key={statusKey} className="flex flex-col items-center gap-2" style={{ width: "20%" }}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-all ${
                          isCurrent
                            ? sConfig.color + " ring-4 ring-offset-2 ring-blue-200 scale-110"
                            : isCompleted
                            ? sConfig.color
                            : "bg-slate-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold">{i + 1}</span>
                        )}
                      </div>
                      <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                        {sConfig.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Sender, Receiver, Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sender & Receiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Sender
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-semibold text-slate-900">{pkg.senderName}</p>
                  <p className="text-sm text-slate-500 mt-1">{pkg.address}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-2">
                    <Phone className="h-3.5 w-3.5" />
                    {pkg.phone}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Receiver
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="font-semibold text-slate-900">{pkg.recipientName}</p>
                  <p className="text-sm text-slate-500 mt-1">{pkg.address}</p>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-2">
                    <Phone className="h-3.5 w-3.5" />
                    {pkg.phone}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Shipment Details Bar */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Weight</p>
                    <p className="text-sm font-semibold text-slate-900">{pkg.weight} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Booking Mode</p>
                    <p className="text-sm font-semibold text-slate-900">Sea Freight</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Pickup Date</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(pkg.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Expected Delivery</p>
                    <p className="text-sm font-semibold text-slate-900">{new Date(Date.now() + 86400000 * 3).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            {(pkg.senderLat || pkg.receiverLat) && (
              <Card className="border-slate-200 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-700" />
                    Live Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-72">
                    <LiveMap
                      status={pkg.status}
                      senderLat={pkg.senderLat}
                      senderLng={pkg.senderLng}
                      receiverLat={pkg.receiverLat}
                      receiverLng={pkg.receiverLng}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipment History */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-700" />
                  Shipment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {history.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No history entries yet.</p>
                  ) : (
                    history.map((h, i) => {
                      const hConfig = STATUS_CONFIG[h.status] || STATUS_CONFIG.order_confirmed;
                      const isLast = i === history.length - 1;
                      return (
                        <div key={h.id} className="flex gap-4 relative">
                          {!isLast && <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-200" />}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hConfig.color} text-white`}>
                            {hConfig.icon}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${hConfig.color} text-white text-xs`}>
                                {hConfig.label}
                              </Badge>
                              <span className="text-xs text-slate-400">
                                {new Date(h.changedAt).toLocaleString()}
                              </span>
                            </div>
                            {h.reason && <p className="text-sm text-slate-600 mt-1">{h.reason}</p>}
                            <p className="text-xs text-slate-400 mt-1">By {h.changedBy}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Media Gallery */}
            {pkg.mediaUrls && pkg.mediaUrls.length > 0 && (
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-700" />
                    Package Photos & Videos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {pkg.mediaUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group cursor-pointer">
                        {url.match(/\.(mp4|webm|mov)$/) || url.match(/^data:video/) ? (
                          <div className="relative w-full h-full">
                            <video src={url} className="w-full h-full object-cover" preload="metadata" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img src={url} alt={`Package media ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Receipt / Costs */}
          <div className="space-y-6">
            {/* Receipt Card */}
            <Card className="border-slate-200 print:shadow-none">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-slate-900">TitanRoute</CardTitle>
                    <p className="text-xs text-slate-500">Shipping Receipt</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Barcode */}
                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <div className="h-12 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXR0ZXJuIGlkPSJiYXIiIHdpZHRoPSI0IiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHJlY3Qgd2lkdGg9IjEiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwIi8+PHJlY3QgeD0iMiIgd2lkdGg9IjIiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwIi8+PC9wYXR0ZXJuPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYmFyKSIvPjwvc3ZnPg==')] bg-repeat-x" />
                  <p className="text-xs font-mono text-slate-600 mt-1">{pkg.trackingCode}</p>
                </div>

                {/* Sender / Receiver mini */}
                <div className="space-y-3">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">From</p>
                    <p className="text-sm font-semibold text-slate-900">{pkg.senderName}</p>
                    <p className="text-xs text-slate-500">{pkg.address}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">To</p>
                    <p className="text-sm font-semibold text-slate-900">{pkg.recipientName}</p>
                    <p className="text-xs text-slate-500">{pkg.address}</p>
                  </div>
                </div>

                {/* Costs Table */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-2">Parcel Details & Costs</p>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-medium text-slate-500">Item</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-slate-500">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-700">Shipping ({pkg.weight} kg)</td>
                          <td className="px-3 py-2 text-right font-medium text-slate-900">${(pkg.weight * 12).toFixed(2)}</td>
                        </tr>
                        <tr className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-700">Clearance Fee</td>
                          <td className="px-3 py-2 text-right font-medium text-slate-900">${(pkg.weight * 3).toFixed(2)}</td>
                        </tr>
                        <tr className="border-t border-slate-100 bg-slate-50">
                          <td className="px-3 py-2 font-semibold text-slate-900">Total</td>
                          <td className="px-3 py-2 text-right font-bold text-blue-700">${(pkg.weight * 15).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Print Button */}
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
              </CardContent>
            </Card>

            {/* Description */}
            {(pkg.description || pkg.notes) && (
              <Card className="border-slate-200">
                <CardContent className="p-4 space-y-3">
                  {pkg.description && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Description</p>
                      <p className="text-sm text-slate-900">{pkg.description}</p>
                    </div>
                  )}
                  {pkg.notes && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-900">{pkg.notes}</p>
                    </div>
                  )}
                  {pkg.customStatusReason && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs text-amber-700 font-medium mb-1">Hold Reason</p>
                      <p className="text-sm text-amber-800">{pkg.customStatusReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
