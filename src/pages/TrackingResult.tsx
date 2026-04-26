import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { packageService } from "@/lib/supabase";
import type { Package, PackageHistory } from "@/lib/supabase";
import LiveMap from "@/components/LiveMap";
import {
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  Weight,
  Clock,
  AlertCircle,
  Printer,
  CheckCircle2,
  Truck,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyTip } from "@/components/FishFact";
import { FloatingIcons } from "@/components/SwimmingFish";
import {
  CARRIER_AVATARS,
  STATUS_STEPS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/const";


export default function TrackingResult() {
  const { trackingCode } = useParams<{ trackingCode: string }>();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [history, setHistory] = useState<PackageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playedSound, setPlayedSound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!trackingCode) return;
      setIsLoading(true);
      const data = await packageService.getByTrackingCode(trackingCode);
      setPkg(data);
      if (data) {
        const h = await packageService.getHistory(data.id);
        setHistory(h);
      }
      setIsLoading(false);
    }
    load();
  }, [trackingCode]);

  useEffect(() => {
    if (pkg?.status === "delivered" && !playedSound) {
      setPlayedSound(true);
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      } catch {
        // Audio not supported
      }
    }
  }, [pkg?.status, playedSound]);

  const carrier = CARRIER_AVATARS.find((f) => f.id === pkg?.fishAvatar) || CARRIER_AVATARS[0];

  const getStepIndex = (status: string) => {
    if (status === "canceled") return -1;
    if (status === "held_by_customs") return 1;
    return STATUS_STEPS.findIndex((s) => s.status === status);
  };

  const currentStep = pkg ? getStepIndex(pkg.status) : -1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🔍</div>
          <p className="text-slate-600 text-lg font-medium">Searching for your package...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <FloatingIcons count={4} />
        <Card className="w-full max-w-md shadow-xl border-slate-200 bg-white relative z-10">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="text-5xl mb-4">📦❓</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Package Not Found</h2>
            <p className="text-slate-600 mb-6">
              We could not find a package with tracking code <strong>{trackingCode}</strong>.<br />
              Please check the code and try again.
            </p>
            <Button onClick={() => navigate("/")} className="bg-blue-700 hover:bg-blue-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tracking
            </Button>
          </CardContent>
        </Card>
        <div className="fixed bottom-6 left-0 right-0 z-10">
          <DailyTip />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <FloatingIcons count={5} />

      {/* Header */}
      <header className="relative z-10 bg-white border-b border-slate-200 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-slate-600">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-700" />
              <h1 className="text-lg font-bold text-slate-900">TitanRoute</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="hidden sm:flex">
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Official Receipt Banner */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-700 to-blue-800 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
                  {carrier.emoji}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{carrier.name}</h2>
                    {pkg.status === "delivered" && (
                      <Badge className="bg-green-400 text-green-900 hover:bg-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-blue-100 text-sm">TitanRoute Global Logistics</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-blue-200">Tracking Number</p>
                <p className="text-2xl font-mono font-bold">{pkg.trackingCode}</p>
                <p className="text-xs text-blue-200 mt-1">
                  Last updated: {new Date(pkg.updatedAt).toLocaleString("en-US")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-700" />
                    Delivery Progress
                  </CardTitle>
                  <Badge
                    className={`${STATUS_COLORS[pkg.status]} text-white px-3 py-1 text-sm`}
                  >
                    {STATUS_LABELS[pkg.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mt-4 mb-2">
                  <div className="absolute top-5 left-0 right-0 h-2 bg-slate-200 rounded-full" />
                  {currentStep >= 0 && (
                    <div
                      className="absolute top-5 left-0 h-2 bg-blue-600 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                      }}
                    />
                  )}
                  {currentStep >= 0 && currentStep < STATUS_STEPS.length - 1 && (
                    <div
                      className="absolute top-1 z-10 transition-all duration-1000"
                      style={{
                        left: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="text-2xl animate-pulse">
                        {pkg.status === "held_by_customs" ? "⏸️" : carrier.emoji}
                      </div>
                    </div>
                  )}
                  {pkg.status === "delivered" && (
                    <div
                      className="absolute top-1 z-10 transition-all duration-1000"
                      style={{ left: "100%", transform: "translateX(-50%)" }}
                    >
                      <div className="text-2xl animate-bounce">🎉</div>
                    </div>
                  )}

                  <div className="relative flex justify-between pt-8">
                    {STATUS_STEPS.map((step, index) => {
                      const isActive = index <= currentStep;
                      const isCurrent = index === currentStep;
                      return (
                        <div key={step.status} className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500 ${
                              isActive
                                ? "bg-blue-700 border-blue-700 text-white"
                                : "bg-white border-slate-300 text-slate-400"
                            } ${isCurrent ? "ring-4 ring-blue-200 scale-110" : ""}`}
                          >
                            {step.icon}
                          </div>
                          <span
                            className={`text-xs mt-2 font-medium ${
                              isActive ? "text-blue-700" : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {pkg.status === "canceled" && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-700 text-sm font-medium">
                      This package has been canceled.
                    </span>
                  </div>
                )}

                {pkg.status === "held_by_customs" && pkg.customStatusReason && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span className="text-orange-700 text-sm font-medium">
                      Reason: {pkg.customStatusReason}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Package Info & History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-700" />
                    Sender & Receiver
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Sender</p>
                    <p className="text-sm font-medium text-slate-900">{pkg.senderName}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Recipient</p>
                    <p className="text-sm font-medium text-slate-900">{pkg.recipientName}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-slate-900">{pkg.address}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Phone</p>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-slate-900">{pkg.phone}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Weight</p>
                    <div className="flex items-start gap-2">
                      <Weight className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium text-slate-900">{pkg.weight} kg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-700" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {history && history.length > 0 ? (
                    <div className="space-y-0">
                      {history.map((entry, index) => (
                        <div key={entry.id} className="flex items-start gap-3 relative pb-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                index === 0 ? "bg-blue-700" : "bg-slate-300"
                              }`}
                            />
                            {index < history.length - 1 && (
                              <div className="w-0.5 h-full bg-slate-200 absolute top-3 left-[5px]" />
                            )}
                          </div>
                          <div className="pb-1">
                            <p className="text-sm font-medium text-slate-900">
                              {STATUS_LABELS[entry.status]}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(entry.changedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              by {entry.changedBy}
                            </p>
                            {entry.reason && (
                              <p className="text-xs text-orange-600 mt-1">
                                Reason: {entry.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No history available.</p>
                  )}
                </CardContent>
              </Card>
            </div>

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
                        {url.match(/\.mp4|\.webm|\.mov|data:video/) ? (
                          <div className="relative w-full h-full">
                            <video src={url} className="w-full h-full object-cover" preload="metadata" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
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

          {/* Right Column - Live Map */}
          <div className="space-y-6">
            <Card className="border-slate-200 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-700" />
                  Live Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 bg-slate-100">
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

            {/* Mini Status Card */}
            <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-white">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: carrier.color + "20" }}
                  >
                    {carrier.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{carrier.name}</p>
                    <p className="text-xs text-slate-500">Assigned Carrier</p>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Current Status</span>
                    <span className="font-medium text-slate-900">{STATUS_LABELS[pkg.status]}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Weight</span>
                    <span className="font-medium text-slate-900">{pkg.weight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Shipped</span>
                    <span className="font-medium text-slate-900">
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-4">
        <DailyTip />
      </footer>
    </div>
  );
}
