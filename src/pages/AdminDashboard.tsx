import { useState, useEffect, type ReactNode, Suspense, lazy, Component } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { packageService, uploadPackageFiles, checkSupabaseHealth, type Package } from "@/lib/supabase";
import {
  LayoutDashboard, Package, Plus, Trophy, Settings, LogOut,
  Search, Edit, Trash2, Filter, ChevronLeft, ChevronRight,
  X, Truck, Loader2, AlertCircle, CheckCircle2,
  Upload, Video, MapPin, Camera, Shield,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const LiveMap = lazy(() => import("@/components/LiveMap"));

// ============== CONSTANTS ==============
const CARRIER_AVATARS = [
  { id: "express", name: "Express Prime", emoji: "🚚" },
  { id: "voyager", name: "Voyager Cargo", emoji: "🚛" },
  { id: "sky", name: "SkyFreight", emoji: "✈️" },
  { id: "trail", name: "Trail Haulers", emoji: "🚂" },
  { id: "swift", name: "Swift Logistics", emoji: "🚐" },
  { id: "global", name: "Global Ship", emoji: "🚢" },
  { id: "fastway", name: "FastWay", emoji: "🛻" },
];

const STATUS_COLORS: Record<string, string> = {
  order_confirmed: "bg-blue-600",
  picked_by_courier: "bg-blue-500",
  on_the_way: "bg-slate-500",
  held_by_customs: "bg-amber-500",
  delivered: "bg-emerald-600",
};

const STATUS_LABELS: Record<string, string> = {
  order_confirmed: "Order Confirmed",
  picked_by_courier: "Picked by Courier",
  on_the_way: "On the Way",
  held_by_customs: "Custom Hold",
  delivered: "Delivered",
};

// ============== ERROR BOUNDARY ==============
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-slate-600 mb-2">Something went wrong loading this section.</p>
          <p className="text-xs text-slate-400 mb-4">{this.state.error?.message}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function SafeSection({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="p-8 text-center"><Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto" /></div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// ============== SIDEBAR ==============
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Shipments", path: "/admin/shipments" },
  { icon: Plus, label: "New Package", path: "/admin/create" },
  { icon: Trophy, label: "Leaderboard", path: "/admin/leaderboard" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center"><Truck className="h-5 w-5 text-white" /></div>
          <h1 className="text-lg font-bold text-white">TitanRoute</h1>
        </div>
        {user && <p className="mt-3 text-xs text-slate-500">{user.email}</p>}
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <Button variant="ghost" size="sm" onClick={logout} className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start">
          <LogOut className="h-4 w-4 mr-2" />Logout
        </Button>
      </div>
    </div>
  );
}

// ============== BOTTOM NAV (Mobile) ==============
const mobileNavItems = [
  { icon: LayoutDashboard, label: "Home", path: "/admin" },
  { icon: Package, label: "Shipments", path: "/admin/shipments" },
  { icon: Plus, label: "Create", path: "/admin/create" },
  { icon: Trophy, label: "Carriers", path: "/admin/leaderboard" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <div className="flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = path === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 flex-1 min-w-0 transition-colors ${isActive ? "text-blue-700" : "text-slate-400"}`}>
              <item.icon className="h-[18px] w-[18px]" />
              <span className="text-[10px] font-medium mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ============== PACKAGE FORM ==============
function PackageForm({
  initialData,
  onSubmit,
  isCreate = false,
  isSubmitting = false,
}: {
  initialData?: Package;
  onSubmit: (data: any, files: File[], keepMediaUrls: string[]) => void;
  isCreate?: boolean;
  isSubmitting?: boolean;
}) {
  const [formData, setFormData] = useState({
    senderName: initialData?.senderName || "",
    recipientName: initialData?.recipientName || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    weight: initialData?.weight?.toString() || "",
    description: initialData?.description || "",
    notes: initialData?.notes || "",
    fishAvatar: initialData?.fishAvatar || "express",
    senderLat: initialData?.senderLat?.toString() || "",
    senderLng: initialData?.senderLng?.toString() || "",
    receiverLat: initialData?.receiverLat?.toString() || "",
    receiverLng: initialData?.receiverLng?.toString() || "",
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingMedia, setExistingMedia] = useState<string[]>(initialData?.mediaUrls || []);
  const [showMap, setShowMap] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setNewFiles((prev) => [...prev, ...selected]);
    const previews = selected.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeExisting = (index: number) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNew = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        ...formData,
        weight: parseFloat(formData.weight) || 0,
        senderLat: formData.senderLat ? parseFloat(formData.senderLat) : null,
        senderLng: formData.senderLng ? parseFloat(formData.senderLng) : null,
        receiverLat: formData.receiverLat ? parseFloat(formData.receiverLat) : null,
        receiverLng: formData.receiverLng ? parseFloat(formData.receiverLng) : null,
      },
      newFiles,
      existingMedia
    );
  };

  const parseCoord = (v: string) => (v ? parseFloat(v) : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium text-slate-700">Sender Name</label><Input value={formData.senderName} onChange={(e) => setFormData({ ...formData, senderName: e.target.value })} required /></div>
        <div><label className="text-sm font-medium text-slate-700">Recipient Name</label><Input value={formData.recipientName} onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })} required /></div>
      </div>
      <div><label className="text-sm font-medium text-slate-700">Address</label><Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} required /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="text-sm font-medium text-slate-700">Phone</label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required /></div>
        <div><label className="text-sm font-medium text-slate-700">Weight (kg)</label><Input type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} required /></div>
      </div>
      <div><label className="text-sm font-medium text-slate-700">Description</label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
      <div><label className="text-sm font-medium text-slate-700">Notes</label><Input value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>

      <div>
        <label className="text-sm font-medium text-slate-700">Assigned Carrier</label>
        <Select value={formData.fishAvatar} onValueChange={(v) => setFormData({ ...formData, fishAvatar: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CARRIER_AVATARS.map((c) => (
              <SelectItem key={c.id} value={c.id}><span className="flex items-center gap-2"><span>{c.emoji}</span>{c.name}</span></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Locations */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-slate-700">Route Locations (Lat/Lng)</h3>
          <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => setShowMap(!showMap)}>
            {showMap ? "Hide Map" : "Pick on Map"}
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Sender Lat</label>
            <Input type="number" step="any" value={formData.senderLat} onChange={(e) => setFormData({ ...formData, senderLat: e.target.value })} placeholder="25.7617" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Sender Lng</label>
            <Input type="number" step="any" value={formData.senderLng} onChange={(e) => setFormData({ ...formData, senderLng: e.target.value })} placeholder="-80.1918" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Receiver Lat</label>
            <Input type="number" step="any" value={formData.receiverLat} onChange={(e) => setFormData({ ...formData, receiverLat: e.target.value })} placeholder="34.0522" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Receiver Lng</label>
            <Input type="number" step="any" value={formData.receiverLng} onChange={(e) => setFormData({ ...formData, receiverLng: e.target.value })} placeholder="-118.2437" />
          </div>
        </div>
        {showMap && (
          <div className="h-64 rounded-lg border border-slate-200 overflow-hidden">
            <Suspense fallback={<div className="h-full flex items-center justify-center text-slate-400 text-sm">Loading map...</div>}>
              <LiveMap
                status="order_confirmed"
                senderLat={parseCoord(formData.senderLat)}
                senderLng={parseCoord(formData.senderLng)}
                receiverLat={parseCoord(formData.receiverLat)}
                receiverLng={parseCoord(formData.receiverLng)}
                editable={true}
                onSenderChange={(lat, lng) => setFormData((prev) => ({ ...prev, senderLat: lat.toFixed(6), senderLng: lng.toFixed(6) }))}
                onReceiverChange={(lat, lng) => setFormData((prev) => ({ ...prev, receiverLat: lat.toFixed(6), receiverLng: lng.toFixed(6) }))}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* File Upload */}
      <div className="border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-blue-700" />
          <h3 className="text-sm font-semibold text-slate-700">Photos & Videos</h3>
        </div>
        <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <Upload className="h-5 w-5" />
            <span className="text-xs">Click to upload photos or videos</span>
          </div>
          <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
        </label>

        {existingMedia.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Current Media</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {existingMedia.map((url, i) => (
                <div key={`existing-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                  {url.match(/\.mp4|\.webm|\.mov|data:video/) ? (
                    <div className="relative w-full h-full">
                      <video src={url} className="w-full h-full object-cover" preload="metadata" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none"><Video className="h-5 w-5 text-white" /></div>
                    </div>
                  ) : (
                    <img src={url} alt={`media ${i + 1}`} className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => removeExisting(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {newPreviews.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">New Uploads</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {newPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                  {url.match(/\.mp4|\.webm|\.mov|data:video/) ? (
                    <div className="relative w-full h-full">
                      <video src={url} className="w-full h-full object-cover" preload="metadata" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none"><Video className="h-5 w-5 text-white" /></div>
                    </div>
                  ) : (
                    <img src={url} alt={`new ${i + 1}`} className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => removeNew(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {isCreate ? "Creating..." : "Saving..."}
            </span>
          ) : isCreate ? "Create Package" : "Update Package"}
        </Button>
      </div>
    </form>
  );
}

// ============== PAGES ==============
function DashboardOverview() {
  const [stats, setStats] = useState({ total_shipments: 0, delivered: 0, in_transit: 0, held_customs: 0, canceled: 0 });
  const [recent, setRecent] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [allPackages, leaderboard] = await Promise.all([
          packageService.getAll(),
          packageService.getCarrierLeaderboard(),
        ]);
        if (cancelled) return;
        const delivered = allPackages.filter((p) => p.status === "delivered").length;
        const inTransit = allPackages.filter((p) => p.status === "picked_by_courier" || p.status === "on_the_way").length;
        const held = allPackages.filter((p) => p.status === "held_by_customs").length;
        setStats({ total_shipments: allPackages.length, delivered, in_transit: inTransit, held_customs: held });
        setRecent(allPackages.slice(0, 5));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Shipments", value: stats.total_shipments, icon: Package, color: "bg-blue-600" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle2, color: "bg-emerald-600" },
          { label: "In Transit", value: stats.in_transit, icon: Truck, color: "bg-amber-500" },
          { label: "Held by Customs", value: stats.held_customs, icon: AlertCircle, color: "bg-purple-500" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center text-white`}><s.icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-slate-500">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.value}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>
      <Card><CardHeader><CardTitle className="text-lg">Recent Shipments</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 md:mx-0"><Table className="min-w-[640px] md:min-w-0">
            <TableHeader><TableRow>
              <TableHead>Tracking</TableHead><TableHead>Carrier</TableHead><TableHead className="hidden sm:table-cell">Recipient</TableHead>
              <TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {recent.map((pkg) => {
                const carrier = CARRIER_AVATARS.find((f) => f.id === pkg.fishAvatar) || CARRIER_AVATARS[0];
                return (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-mono text-sm font-medium">{pkg.trackingCode}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><span className="text-lg">{carrier.emoji}</span><span className="text-sm hidden sm:inline">{carrier.name}</span></div></TableCell>
                    <TableCell className="text-sm hidden sm:table-cell">{pkg.recipientName}</TableCell>
                    <TableCell><Badge className={`${STATUS_COLORS[pkg.status]} text-white text-xs`}>{STATUS_LABELS[pkg.status]}</Badge></TableCell>
                    <TableCell className="text-sm text-slate-500 hidden md:table-cell">{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table></div>
        </CardContent>
      </Card>
    </div>
  );
}

function ShipmentsPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [deletePkg, setDeletePkg] = useState<Package | null>(null);
  const [statusPkg, setStatusPkg] = useState<Package | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = await packageService.getAll();
        if (!cancelled) setPackages(data);
      } catch (e: any) {
        if (!cancelled) {
          console.error("[ShipmentsPage] load error:", e);
          setLoadError(e?.message || "Failed to load packages from Supabase");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = packages.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || p.trackingCode.toLowerCase().includes(q) || p.recipientName.toLowerCase().includes(q) || p.senderName.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const limit = filtered.length <= PAGE_SIZE;

  const handleCreate = async (data: any, files: File[]) => {
    setFormError(""); setIsSubmitting(true);
    try {
      const urls = files.length > 0 ? await uploadPackageFiles(files) : [];
      await packageService.create({ ...data, mediaUrls: urls });
      setCreateOpen(false); setRefreshKey((k) => k + 1);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("timed out")) {
        setFormError(
          "Connection to Supabase timed out. Your project may be paused or unreachable. " +
          "Go to your Supabase Dashboard and check if the project shows 'Paused'. If so, click 'Restore'."
        );
      } else {
        setFormError(msg || "Failed to create package.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any, files: File[], keepMediaUrls: string[]) => {
    if (!editPkg) return;
    setFormError(""); setIsSubmitting(true);
    try {
      const { urls, errors } = files.length > 0 ? await uploadPackageFiles(files) : { urls: [], errors: [] };
      if (errors.length > 0) setFormError("Upload warnings: " + errors.join("; "));
      await packageService.update(editPkg.id, { ...data, mediaUrls: [...keepMediaUrls, ...urls] });
      setEditPkg(null); setRefreshKey((k) => k + 1);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("timed out")) {
        setFormError(
          "Connection to Supabase timed out. Your project may be paused or unreachable. " +
          "Go to your Supabase Dashboard and check if the project shows 'Paused'. If so, click 'Restore'."
        );
      } else {
        setFormError(msg || "Failed to update package.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePkg) return;
    try { await packageService.delete(deletePkg.id); setDeletePkg(null); setRefreshKey((k) => k + 1); }
    catch (err: any) { alert("Delete failed: " + (err?.message || "Unknown error")); }
  };

  const handleStatusChange = async () => {
    if (!statusPkg || !newStatus) return;
    try {
      await packageService.updateStatus(statusPkg.id, newStatus as any, statusReason || undefined);
      setStatusPkg(null); setNewStatus(""); setStatusReason(""); setRefreshKey((k) => k + 1);
    } catch (err: any) { alert("Status update failed: " + (err?.message || "Unknown error")); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h2 className="text-2xl font-bold text-slate-900">Shipments</h2><p className="text-slate-500">Manage all package shipments</p></div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button className="bg-blue-700 hover:bg-blue-800"><Plus className="h-4 w-4 mr-1" /> New Package</Button></DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create New Package</DialogTitle></DialogHeader>
            {formError && <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-2">{formError}</div>}
            <PackageForm onSubmit={handleCreate} isCreate={true} isSubmitting={isSubmitting} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search tracking, recipient..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-9" /></div>
            <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-44"><Filter className="h-4 w-4 mr-2 text-slate-400" /><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="order_confirmed">Order Confirmed</SelectItem>
                <SelectItem value="picked_by_courier">Picked by Courier</SelectItem>
                <SelectItem value="on_the_way">On the Way</SelectItem>
                <SelectItem value="held_by_customs">Custom Hold</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div> : loadError ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-700 mb-1">Failed to load packages</p>
              <p className="text-xs text-red-500">{loadError}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setRefreshKey(k => k + 1)}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <Table className="min-w-[640px] md:min-w-0">
                  <TableHeader><TableRow>
                    <TableHead>Tracking</TableHead><TableHead>Carrier</TableHead><TableHead className="hidden sm:table-cell">Recipient</TableHead>
                    <TableHead>Status</TableHead><TableHead className="hidden md:table-cell">Weight</TableHead><TableHead className="hidden md:table-cell">Created</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-8">
                        <p className="text-slate-500 mb-1">No packages found.</p>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          If packages exist in Supabase but don't show here, RLS policies may be blocking SELECT. Run in SQL Editor:
                        </p>
                        <code className="block mt-2 text-[10px] bg-slate-100 rounded px-2 py-1 font-mono text-slate-600">
                          SELECT * FROM pg_policies WHERE tablename = 'packages';
                        </code>
                      </TableCell></TableRow>
                    ) : (
                      paginated.map((pkg) => {
                        const carrier = CARRIER_AVATARS.find((f) => f.id === pkg.fishAvatar) || CARRIER_AVATARS[0];
                        return (
                          <TableRow key={pkg.id}>
                            <TableCell className="font-mono text-sm font-medium">{pkg.trackingCode}</TableCell>
                            <TableCell><div className="flex items-center gap-2"><span className="text-lg">{carrier.emoji}</span><span className="text-sm hidden sm:inline">{carrier.name}</span></div></TableCell>
                            <TableCell className="text-sm hidden sm:table-cell">{pkg.recipientName}</TableCell>
                            <TableCell><Badge className={`${STATUS_COLORS[pkg.status]} text-white text-xs`}>{STATUS_LABELS[pkg.status]}</Badge></TableCell>
                            <TableCell className="text-sm hidden md:table-cell">{pkg.weight} kg</TableCell>
                            <TableCell className="text-sm text-slate-500 hidden md:table-cell">{new Date(pkg.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setFormError(""); setEditPkg(pkg); }}><Edit className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStatusPkg(pkg)}><Package className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700" onClick={() => setDeletePkg(pkg)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              {!limit && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200">
                  <p className="text-sm text-slate-500">Page {page + 1} of {totalPages} ({packages.length} total)</p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editPkg} onOpenChange={() => setEditPkg(null)}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Package</DialogTitle></DialogHeader>
          {formError && <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-2">{formError}</div>}
          {isSubmitting && <div className="flex items-center justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" /><span className="text-sm text-slate-500">Saving...</span></div>}
          {editPkg && <PackageForm initialData={editPkg} onSubmit={handleUpdate} isSubmitting={isSubmitting} />}
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={!!statusPkg} onOpenChange={() => setStatusPkg(null)}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="order_confirmed">Order Confirmed</SelectItem>
                <SelectItem value="picked_by_courier">Picked by Courier</SelectItem>
                <SelectItem value="on_the_way">On the Way</SelectItem>
                <SelectItem value="held_by_customs">Custom Hold</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Reason (optional)" value={statusReason} onChange={(e) => setStatusReason(e.target.value)} />
            <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={handleStatusChange} disabled={!newStatus}>Update Status</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletePkg} onOpenChange={() => setDeletePkg(null)}>
        <DialogContent className="w-[95vw] max-w-sm">
          <DialogHeader><DialogTitle>Delete Package</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 py-2">Are you sure you want to delete package <b>{deletePkg?.trackingCode}</b>? This cannot be undone.</p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeletePkg(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateShipmentPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any, files: File[]) => {
    setFormError(""); setIsSubmitting(true);
    try {
      const urls = files.length > 0 ? await uploadPackageFiles(files) : [];
      await packageService.create({ ...data, mediaUrls: urls });
      navigate("/admin/shipments");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("timed out")) {
        setFormError(
          "Connection to Supabase timed out. Your project may be paused or unreachable. " +
          "Go to your Supabase Dashboard and check if the project shows 'Paused'. If so, click 'Restore'."
        );
      } else {
        setFormError(msg || "Failed to create package.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900">Create New Shipment</h2><p className="text-slate-500">Fill in the details to create a new package shipment</p></div>
      <Card>
        <CardContent className="pt-6">
          {formError && <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 mb-4">{formError}</div>}
          {isSubmitting && <div className="flex items-center justify-center py-2 mb-4"><Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" /><span className="text-sm text-slate-500">Creating...</span></div>}
          <PackageForm onSubmit={handleSubmit} isCreate={true} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<{ fishAvatar: string; count: number; avgTime: number | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await packageService.getCarrierLeaderboard();
        if (!cancelled) setLeaderboard(data);
      } catch (e) { if (!cancelled) console.error("[LeaderboardPage] error:", e); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900">Carrier Leaderboard</h2><p className="text-slate-500">Top performing carriers by delivery speed</p></div>
      {loading ? <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div> : (
        <div className="grid gap-3">
          {leaderboard.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-slate-500">No delivered packages yet.</CardContent></Card>
          ) : (
            leaderboard.map((entry, i) => {
              const carrier = CARRIER_AVATARS.find((f) => f.id === entry.fishAvatar) || CARRIER_AVATARS[0];
              return (
                <Card key={entry.fishAvatar}><CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">{i + 1}</div>
                  <div className="flex-1"><div className="flex items-center gap-2"><span className="text-2xl">{carrier.emoji}</span><span className="font-semibold text-slate-900">{carrier.name}</span></div></div>
                  <div className="text-right"><p className="text-sm text-slate-500">Deliveries</p><p className="text-lg font-bold text-slate-900">{entry.count}</p></div>
                  <div className="text-right"><p className="text-sm text-slate-500">Avg Time</p><p className="text-lg font-bold text-slate-900">{entry.avgTime !== null ? `${entry.avgTime.toFixed(1)}h` : "N/A"}</p></div>
                </CardContent></Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function SettingsPage() {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-2xl space-y-6">
      <div><h2 className="text-2xl font-bold text-slate-900">Settings</h2><p className="text-slate-500">Account and system preferences</p></div>
      <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Settings className="h-5 w-5" />Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><p className="text-sm text-slate-500">Email</p><p className="font-medium text-slate-900">{user?.email}</p></div>
          <div><p className="text-sm text-slate-500">Role</p><p className="font-medium text-slate-900 capitalize">{user?.role}</p></div>
          <Button variant="outline" onClick={logout} className="mt-2"><LogOut className="h-4 w-4 mr-2" />Logout</Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============== CONNECTION BANNER ==============
function ConnectionBanner() {
  const [health, setHealth] = useState<{ ok: boolean; checked: boolean; error?: string }>({ ok: true, checked: false });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const result = await checkSupabaseHealth();
      if (!cancelled) setHealth({ ok: result.ok, checked: true, error: result.error });
    }
    check();
    const interval = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  if (!health.checked || health.ok) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm text-red-700">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span className="font-medium">Supabase unreachable:</span>
        <span>{health.error}</span>
        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs font-semibold underline hover:text-red-900"
        >
          Open Supabase Dashboard →
        </a>
      </div>
    </div>
  );
}

// ============== MAIN EXPORT ==============
export default function AdminDashboard() {
  return (
    <ErrorBoundary>
      <AdminDashboardInner />
    </ErrorBoundary>
  );
}

function AdminDashboardInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Required</h2>
            <p className="text-slate-500 mb-4">Please sign in to access the admin dashboard.</p>
            <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => navigate("/login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const path = location.pathname;
  let content: ReactNode;
  try {
    if (path === "/admin/create") content = <SafeSection><CreateShipmentPage /></SafeSection>;
    else if (path === "/admin/shipments") content = <SafeSection><ShipmentsPage /></SafeSection>;
    else if (path === "/admin/leaderboard") content = <SafeSection><LeaderboardPage /></SafeSection>;
    else if (path === "/admin/settings") content = <SafeSection><SettingsPage /></SafeSection>;
    else content = <SafeSection><DashboardOverview /></SafeSection>;
  } catch (err: any) {
    content = (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <p className="text-slate-600">Failed to load page content: {err?.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <BottomNav />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 md:pb-0 pb-16">
        <ConnectionBanner />
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <h2 className="text-lg font-semibold text-slate-900">
            {path === "/admin" ? "Dashboard" : path === "/admin/shipments" ? "Shipments" : path === "/admin/create" ? "New Shipment" : path === "/admin/leaderboard" ? "Leaderboard" : "Settings"}
          </h2>
          <div className="flex items-center gap-3">
            {user && <div className="text-right hidden sm:block"><p className="text-sm font-medium text-slate-900">{user.name}</p><p className="text-xs text-slate-500">{user.email}</p></div>}
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">{user?.name?.charAt(0).toUpperCase() || "A"}</div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">{content}</main>
      </div>
    </div>
  );
}

