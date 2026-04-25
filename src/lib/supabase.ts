import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Types
export interface Package {
  id: string;
  trackingCode: string;
  senderName: string;
  recipientName: string;
  address: string;
  phone: string;
  weight: number;
  description: string | null;
  notes: string | null;
  fishAvatar: string;
  status: "sent" | "received" | "delivered" | "canceled" | "held_by_customs";
  customStatusReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PackageHistory {
  id: string;
  packageId: string;
  status: string;
  reason: string | null;
  changedBy: string;
  changedAt: string;
}

export interface LeaderboardEntry {
  fishAvatar: string;
  count: number;
  avgTime: number | null;
}

// Runtime configuration helpers
const LS_SUPABASE_URL = "titanroute_supabase_url";
const LS_SUPABASE_KEY = "titanroute_supabase_key";

function getRuntimeSupabaseUrl(): string | null {
  try {
    return localStorage.getItem(LS_SUPABASE_URL) || null;
  } catch { return null; }
}

function getRuntimeSupabaseKey(): string | null {
  try {
    return localStorage.getItem(LS_SUPABASE_KEY) || null;
  } catch { return null; }
}

export function saveRuntimeSupabaseConfig(url: string, key: string) {
  try {
    localStorage.setItem(LS_SUPABASE_URL, url.trim());
    localStorage.setItem(LS_SUPABASE_KEY, key.trim());
  } catch (e) {
    console.error("[supabase.ts] Failed to save runtime config:", e);
  }
}

export function clearRuntimeSupabaseConfig() {
  try {
    localStorage.removeItem(LS_SUPABASE_URL);
    localStorage.removeItem(LS_SUPABASE_KEY);
  } catch (e) {
    console.error("[supabase.ts] Failed to clear runtime config:", e);
  }
}

export function hasRuntimeSupabaseConfig(): boolean {
  return !!getRuntimeSupabaseUrl() && !!getRuntimeSupabaseKey();
}

// Supabase client setup — checks .env first, then localStorage runtime config
function createSupabaseClient(): SupabaseClient | null {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const url = envUrl || getRuntimeSupabaseUrl();
  const key = envKey || getRuntimeSupabaseKey();

  if (!url || !key) return null;
  if (url.includes("your-project") || key.includes("your-anon-key")) return null;

  try {
    return createClient(url, key);
  } catch (e) {
    console.error("[supabase.ts] Failed to create Supabase client:", e);
    return null;
  }
}

export const supabase: SupabaseClient | null = createSupabaseClient();

export const USE_LOCAL = !supabase;

// LocalStorage helpers - DEFENSIVE (wraps JSON.parse in try-catch)
const LS_PACKAGES = "titanroute_packages_v2";
const LS_HISTORY = "titanroute_history_v2";

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T;
    console.warn(`[supabase.ts] localStorage key ${key} is not an array, resetting`);
    return fallback;
  } catch (e) {
    console.error(`[supabase.ts] Failed to parse localStorage key ${key}:`, e);
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[supabase.ts] Failed to write localStorage key ${key}:`, e);
  }
}

function getPackages(): Package[] {
  return safeGet<Package[]>(LS_PACKAGES, []);
}

function setPackages(packages: Package[]) {
  safeSet(LS_PACKAGES, packages);
}

function getHistory(): PackageHistory[] {
  return safeGet<PackageHistory[]>(LS_HISTORY, []);
}

function setHistory(history: PackageHistory[]) {
  safeSet(LS_HISTORY, history);
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateTrackingCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function now() {
  return new Date().toISOString();
}

// Seed data
try {
  seedData();
} catch (e) {
  console.error("[supabase.ts] seedData failed:", e);
}

function seedData() {
  try {
    const packages = getPackages();
    if (packages.length > 0) return;

  const samplePackages: Package[] = [
    {
      id: generateId(),
      trackingCode: "ABC123DEF4",
      senderName: "John Doe",
      recipientName: "Jane Smith",
      address: "123 Ocean Ave, Miami, FL",
      phone: "+1 555-0101",
      weight: 2.5,
      description: "Electronics package",
      notes: "Fragile contents",
      fishAvatar: "salmon",
      status: "delivered",
      customStatusReason: null,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      trackingCode: "XYZ789GHI0",
      senderName: "Alice Brown",
      recipientName: "Bob Wilson",
      address: "456 Harbor St, Seattle, WA",
      phone: "+1 555-0202",
      weight: 1.8,
      description: "Books and documents",
      notes: null,
      fishAvatar: "tuna",
      status: "received",
      customStatusReason: null,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      trackingCode: "DEF456JKL7",
      senderName: "Carol White",
      recipientName: "Dan Green",
      address: "789 Reef Rd, San Diego, CA",
      phone: "+1 555-0303",
      weight: 5.2,
      description: "Sports equipment",
      notes: "Handle with care",
      fishAvatar: "shark",
      status: "sent",
      customStatusReason: null,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      trackingCode: "GHI012MNO3",
      senderName: "Eva Black",
      recipientName: "Frank Gray",
      address: "321 Tide Ln, Boston, MA",
      phone: "+1 555-0404",
      weight: 0.8,
      description: "Jewelry",
      notes: "High value - insured",
      fishAvatar: "clownfish",
      status: "held_by_customs",
      customStatusReason: "Missing customs declaration form",
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      trackingCode: "JKL345PQR8",
      senderName: "George Red",
      recipientName: "Helen Blue",
      address: "654 Wave St, Tampa, FL",
      phone: "+1 555-0505",
      weight: 3.0,
      description: "Clothing items",
      notes: null,
      fishAvatar: "dolphin",
      status: "canceled",
      customStatusReason: null,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  const history: PackageHistory[] = [
    {
      id: generateId(),
      packageId: samplePackages[0].id,
      status: "sent",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[0].id,
      status: "received",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[0].id,
      status: "delivered",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[1].id,
      status: "sent",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[1].id,
      status: "received",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[2].id,
      status: "sent",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[3].id,
      status: "sent",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[3].id,
      status: "held_by_customs",
      reason: "Missing customs declaration form",
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[4].id,
      status: "sent",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: generateId(),
      packageId: samplePackages[4].id,
      status: "canceled",
      reason: null,
      changedBy: "Admin",
      changedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  setPackages(samplePackages);
  setHistory(history);
  } catch (e) {
    console.error("[supabase.ts] seedData internal error:", e);
  }
}

// Package service
export const packageService = {
  async list(filters?: { search?: string; status?: string }): Promise<Package[]> {
    if (!USE_LOCAL && supabase) {
      let query = supabase.from("packages").select("*").order("created_at", { ascending: false });
      if (filters?.search) {
        query = query.ilike("tracking_code", `%${filters.search}%`);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(mapFromSupabasePackage);
    }

    let packages = getPackages();
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      packages = packages.filter(
        (p) =>
          p.trackingCode.toLowerCase().includes(s) ||
          p.recipientName.toLowerCase().includes(s) ||
          p.senderName.toLowerCase().includes(s)
      );
    }
    if (filters?.status) {
      packages = packages.filter((p) => p.status === filters.status);
    }
    return packages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getByTrackingCode(code: string): Promise<Package | null> {
    if (!USE_LOCAL && supabase) {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .eq("tracking_code", code.toUpperCase())
        .single();
      if (error || !data) return null;
      return mapFromSupabasePackage(data);
    }
    return getPackages().find((p) => p.trackingCode === code.toUpperCase()) || null;
  },

  async create(data: Omit<Package, "id" | "trackingCode" | "createdAt" | "updatedAt" | "status">): Promise<Package> {
    const pkg: Package = {
      id: generateId(),
      trackingCode: generateTrackingCode(),
      status: "sent",
      customStatusReason: null,
      createdAt: now(),
      updatedAt: now(),
      ...data,
    };

    if (!USE_LOCAL && supabase) {
      const { data: inserted, error } = await supabase.from("packages").insert(mapToSupabasePackage(pkg)).select().single();
      if (error) throw error;
      return mapFromSupabasePackage(inserted);
    }

    const packages = getPackages();
    packages.push(pkg);
    setPackages(packages);

    // Add initial history entry
    const history = getHistory();
    history.push({
      id: generateId(),
      packageId: pkg.id,
      status: "sent",
      reason: null,
      changedBy: "Admin",
      changedAt: now(),
    });
    setHistory(history);

    return pkg;
  },

  async update(id: string, data: Partial<Package>): Promise<Package> {
    if (!USE_LOCAL && supabase) {
      const { data: updated, error } = await supabase
        .from("packages")
        .update(mapToSupabasePackageUpdate(data))
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapFromSupabasePackage(updated);
    }

    const packages = getPackages();
    const idx = packages.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Package not found");
    packages[idx] = { ...packages[idx], ...data, updatedAt: now() };
    setPackages(packages);
    return packages[idx];
  },

  async updateStatus(id: string, status: Package["status"], reason?: string): Promise<Package> {
    if (!USE_LOCAL && supabase) {
      const updateData: any = { status, updated_at: now() };
      if (status === "held_by_customs") updateData.custom_status_reason = reason || null;
      const { data: updated, error } = await supabase.from("packages").update(updateData).eq("id", id).select().single();
      if (error) throw error;
      return mapFromSupabasePackage(updated);
    }

    const packages = getPackages();
    const idx = packages.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Package not found");
    packages[idx].status = status;
    packages[idx].updatedAt = now();
    if (status === "held_by_customs") {
      packages[idx].customStatusReason = reason || null;
    }
    setPackages(packages);

    const history = getHistory();
    history.push({
      id: generateId(),
      packageId: id,
      status,
      reason: status === "held_by_customs" ? reason || null : null,
      changedBy: "Admin",
      changedAt: now(),
    });
    setHistory(history);

    return packages[idx];
  },

  async delete(id: string): Promise<void> {
    if (!USE_LOCAL && supabase) {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) throw error;
      return;
    }
    setPackages(getPackages().filter((p) => p.id !== id));
    setHistory(getHistory().filter((h) => h.packageId !== id));
  },

  async getHistory(packageId: string): Promise<PackageHistory[]> {
    if (!USE_LOCAL && supabase) {
      const { data, error } = await supabase
        .from("package_history")
        .select("*")
        .eq("package_id", packageId)
        .order("changed_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapFromSupabaseHistory);
    }
    return getHistory()
      .filter((h) => h.packageId === packageId)
      .sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const packages = await this.list();
    const history = getHistory();
    const delivered = packages.filter((p) => p.status === "delivered");

    const byFish: Record<string, { count: number; times: number[] }> = {};

    for (const pkg of delivered) {
      const pkgHistory = history
        .filter((h) => h.packageId === pkg.id)
        .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());

      const sent = pkgHistory.find((h) => h.status === "sent");
      const deliveredEntry = pkgHistory.find((h) => h.status === "delivered");

      if (sent && deliveredEntry) {
        const hours = (new Date(deliveredEntry.changedAt).getTime() - new Date(sent.changedAt).getTime()) / 3600000;
        if (!byFish[pkg.fishAvatar]) {
          byFish[pkg.fishAvatar] = { count: 0, times: [] };
        }
        byFish[pkg.fishAvatar].count++;
        byFish[pkg.fishAvatar].times.push(hours);
      }
    }

    return Object.entries(byFish)
      .map(([fishAvatar, data]) => ({
        fishAvatar,
        count: data.count,
        avgTime: data.times.length > 0 ? data.times.reduce((a, b) => a + b, 0) / data.times.length : null,
      }))
      .sort((a, b) => (a.avgTime ?? Infinity) - (b.avgTime ?? Infinity));
  },
};

// Supabase mappers
function mapFromSupabasePackage(row: any): Package {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    senderName: row.sender_name,
    recipientName: row.recipient_name,
    address: row.address,
    phone: row.phone,
    weight: row.weight,
    description: row.description,
    notes: row.notes,
    fishAvatar: row.fish_avatar,
    status: row.status,
    customStatusReason: row.custom_status_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToSupabasePackage(pkg: Package): any {
  return {
    id: pkg.id,
    tracking_code: pkg.trackingCode,
    sender_name: pkg.senderName,
    recipient_name: pkg.recipientName,
    address: pkg.address,
    phone: pkg.phone,
    weight: pkg.weight,
    description: pkg.description,
    notes: pkg.notes,
    fish_avatar: pkg.fishAvatar,
    status: pkg.status,
    custom_status_reason: pkg.customStatusReason,
    created_at: pkg.createdAt,
    updated_at: pkg.updatedAt,
  };
}

function mapToSupabasePackageUpdate(data: Partial<Package>): any {
  const result: any = {};
  if (data.trackingCode !== undefined) result.tracking_code = data.trackingCode;
  if (data.senderName !== undefined) result.sender_name = data.senderName;
  if (data.recipientName !== undefined) result.recipient_name = data.recipientName;
  if (data.address !== undefined) result.address = data.address;
  if (data.phone !== undefined) result.phone = data.phone;
  if (data.weight !== undefined) result.weight = data.weight;
  if (data.description !== undefined) result.description = data.description;
  if (data.notes !== undefined) result.notes = data.notes;
  if (data.fishAvatar !== undefined) result.fish_avatar = data.fishAvatar;
  if (data.status !== undefined) result.status = data.status;
  if (data.customStatusReason !== undefined) result.custom_status_reason = data.customStatusReason;
  result.updated_at = now();
  return result;
}

function mapFromSupabaseHistory(row: any): PackageHistory {
  return {
    id: row.id,
    packageId: row.package_id,
    status: row.status,
    reason: row.reason,
    changedBy: row.changed_by,
    changedAt: row.changed_at,
  };
}
