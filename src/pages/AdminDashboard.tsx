import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { packageService } from "@/lib/supabase";
import type { Package } from "@/lib/supabase";
import {
  LayoutDashboard,
  Package,
  Plus,
  Trophy,
  Settings,
  LogOut,
  Search,
  Edit,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  Ship,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CARRIER_AVATARS, STATUS_COLORS, STATUS_LABELS } from "@/const";

const PAGE_SIZE = 10;

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Manage Shipments", path: "/admin/shipments" },
  { icon: Plus, label: "Create New Shipment", path: "/admin/create" },
  { icon: Trophy, label: "Fastest Carriers", path: "/admin/leaderboard" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center p-8">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-slate-600 mb-6">
            This area is protected. Please sign in with an admin account.
          </p>
          <Button onClick={() => navigate("/login")} className="bg-blue-700 hover:bg-blue-800">
            Sign In
          </Button>
          <Button variant="ghost" onClick={() => navigate("/")} className="ml-2">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  // Conditional rendering based on path - avoids nested Routes issues
  const renderContent = () => {
    const path = location.pathname;
    if (path === "/admin/create") return <CreateShipmentPage />;
    if (path === "/admin/shipments") return <ShipmentsPage />;
    if (path === "/admin/leaderboard") return <LeaderboardPage />;
    if (path === "/admin/settings") return <SettingsPage />;
    return <DashboardOverview />;
  };

  const activeLabel = sidebarItems.find((i) => i.path === location.pathname)?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">TitanRoute</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-sm text-blue-400">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-slate-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 rounded bg-blue-700 flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">TitanRoute</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
            <span>Admin Manager</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-medium">{activeLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {user?.role}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-600 hidden md:flex"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </header>

        {/* Content Area - CONDITIONAL RENDERING (no nested Routes) */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-blue-700 text-white shadow-lg"
        onClick={() => setOpen(!open)}
      >
        <BarChart3 className="h-5 w-5" />
      </Button>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 text-slate-300 flex flex-col">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold text-white">TitanRoute</h1>
              </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-700 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full text-slate-400 hover:text-white hover:bg-slate-800 justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DashboardOverview() {
  const [stats, setStats] = useState({ total: 0, delivered: 0, inTransit: 0, held: 0 });

  useEffect(() => {
    async function load() {
      const packages = await packageService.list();
      setStats({
        total: packages.length,
        delivered: packages.filter((p) => p.status === "delivered").length,
        inTransit: packages.filter((p) => p.status === "sent" || p.status === "received").length,
        held: packages.filter((p) => p.status === "held_by_customs").length,
      });
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Overview of your shipping operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Ship className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Total Shipments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.delivered}</p>
                <p className="text-xs text-slate-500">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Truck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.inTransit}</p>
                <p className="text-xs text-slate-500">In Transit</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.held}</p>
                <p className="text-xs text-slate-500">Held by Customs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ShipmentsPage limit={5} />
    </div>
  );
}

function ShipmentsPage({ limit }: { limit?: number }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPackage, setEditPackage] = useState<Package | null>(null);
  const [statusPackage, setStatusPackage] = useState<Package | null>(null);
  const [deletePackage, setDeletePackage] = useState<Package | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      const data = await packageService.list({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setPackages(data);
    }
    load();
  }, [search, statusFilter, refreshKey]);

  const paginatedPackages = limit
    ? packages.slice(0, limit)
    : packages.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil((packages?.length || 0) / PAGE_SIZE);

  const handleCreate = async (data: any) => {
    await packageService.create(data);
    setCreateOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleUpdate = async (data: any) => {
    if (!editPackage) return;
    await packageService.update(editPackage.id, data);
    setEditPackage(null);
    setRefreshKey((k) => k + 1);
  };

  const handleStatusUpdate = async (data: any) => {
    if (!statusPackage) return;
    await packageService.updateStatus(statusPackage.id, data.status, data.reason);
    setStatusPackage(null);
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = async () => {
    if (!deletePackage) return;
    await packageService.delete(deletePackage.id);
    setDeletePackage(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {!limit && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Manage Shipments</h2>
          <p className="text-slate-500">View and manage all package shipments</p>
        </div>
      )}

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search tracking code..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
                <SelectTrigger className="w-full sm:w-44">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="held_by_customs">Held by Customs</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-700 hover:bg-blue-800">
                  <Plus className="h-4 w-4 mr-1" />
                  New Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">📦</span>
                    Create New Package
                  </DialogTitle>
                </DialogHeader>
                <PackageForm onSubmit={handleCreate} isLoading={false} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Packages Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No packages found. Create one to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPackages.map((pkg) => {
                    const carrier = CARRIER_AVATARS.find((f) => f.id === pkg.fishAvatar) || CARRIER_AVATARS[0];
                    return (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-mono text-sm font-medium">
                          {pkg.trackingCode}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{carrier.emoji}</span>
                            <span className="text-sm">{carrier.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{pkg.recipientName}</TableCell>
                        <TableCell>
                          <Badge className={`${STATUS_COLORS[pkg.status]} text-white text-xs`}>
                            {STATUS_LABELS[pkg.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{pkg.weight} kg</TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {new Date(pkg.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setEditPackage(pkg)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setStatusPackage(pkg)}>
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeletePackage(pkg)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {!limit && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, packages?.length || 0)} of {packages?.length} packages
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 0}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-600 px-2">
                  Page {page + 1} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editPackage} onOpenChange={() => setEditPackage(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">✏️</span>
              Edit Package
            </DialogTitle>
          </DialogHeader>
          {editPackage && (
            <PackageForm
              initialData={editPackage}
              onSubmit={handleUpdate}
              isLoading={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!statusPackage} onOpenChange={() => setStatusPackage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Update Status
            </DialogTitle>
          </DialogHeader>
          {statusPackage && (
            <StatusForm
              packageId={statusPackage.id}
              currentStatus={statusPackage.status}
              onSubmit={handleStatusUpdate}
              isLoading={false}
              onCancel={() => setStatusPackage(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deletePackage} onOpenChange={() => setDeletePackage(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Package
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete package{" "}
            <strong>{deletePackage?.trackingCode}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeletePackage(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateShipmentPage() {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    await packageService.create(data);
    navigate("/admin/shipments");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Create New Shipment</h2>
        <p className="text-slate-500">Fill in the details to create a new package shipment</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <PackageForm onSubmit={handleSubmit} isLoading={false} />
        </CardContent>
      </Card>
    </div>
  );
}

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await packageService.getLeaderboard();
      setLeaderboard(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Fastest Carriers Leaderboard</h2>
        <p className="text-slate-500">See which carriers are the speediest</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Top Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const carrier = CARRIER_AVATARS.find((f) => f.id === entry.fishAvatar) || CARRIER_AVATARS[0];
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div key={entry.fishAvatar} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                    <span className="text-2xl">{medals[index] || `${index + 1}.`}</span>
                    <span className="text-3xl">{carrier.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{carrier.name}</p>
                      <p className="text-sm text-slate-500">{entry.count} deliveries completed</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-700">
                        {entry.avgTime?.toFixed(1) || "0"}h
                      </p>
                      <p className="text-xs text-slate-500">avg delivery time</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p>No delivered packages yet. Complete some deliveries to see the fastest carriers!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500">Configure your TitanRoute admin panel</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">App Name</p>
              <p className="font-medium text-slate-900">TitanRoute</p>
            </div>
            <div>
              <p className="text-slate-500">Version</p>
              <p className="font-medium text-slate-900">1.0.0</p>
            </div>
            <div>
              <p className="text-slate-500">Backend</p>
              <p className="font-medium text-slate-900">Supabase (or localStorage fallback)</p>
            </div>
            <div>
              <p className="text-slate-500">Theme</p>
              <p className="font-medium text-slate-900">Corporate Blue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Supabase URL</span>
              <span className="font-mono text-slate-900">
                {import.meta.env.VITE_SUPABASE_URL ? "✅ Configured" : "❌ Not set (using localStorage)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Admin Email</span>
              <span className="font-mono text-slate-900">
                {import.meta.env.VITE_ADMIN_EMAIL || "admin@titanroute.com"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Reusable Package Form
function PackageForm({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: Package;
  onSubmit: (data: any) => void;
  isLoading: boolean;
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      weight: parseFloat(formData.weight) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Sender Name</label>
          <Input
            value={formData.senderName}
            onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Recipient Name</label>
          <Input
            value={formData.recipientName}
            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Address</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Weight (kg)</label>
          <Input
            type="number"
            step="0.01"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <Input
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Assigned Carrier</label>
        <Select
          value={formData.fishAvatar}
          onValueChange={(v) => setFormData({ ...formData, fishAvatar: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CARRIER_AVATARS.map((carrier) => (
              <SelectItem key={carrier.id} value={carrier.id}>
                <span className="flex items-center gap-2">
                  <span>{carrier.emoji}</span>
                  {carrier.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="pt-2 flex justify-end gap-2">
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update Package" : "Create Package"}
        </Button>
      </div>
    </form>
  );
}

function StatusForm({
  packageId,
  currentStatus,
  onSubmit,
  isLoading,
  onCancel,
}: {
  packageId: string;
  currentStatus: string;
  onSubmit: (data: { id: string; status: "sent" | "received" | "delivered" | "canceled" | "held_by_customs"; reason?: string }) => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<"sent" | "received" | "delivered" | "canceled" | "held_by_customs">(currentStatus as any);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: packageId,
      status,
      reason: status === "held_by_customs" ? reason : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700">New Status</label>
        <Select value={status} onValueChange={(v) => setStatus(v as any)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="held_by_customs">Held by Customs</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {status === "held_by_customs" && (
        <div>
          <label className="text-sm font-medium text-slate-700">Reason</label>
          <Input
            placeholder="e.g., Missing invoice"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required={status === "held_by_customs"}
          />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Status"}
        </Button>
      </div>
    </form>
  );
}
