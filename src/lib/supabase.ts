import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Timeout wrapper for async operations
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

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
  mediaUrls: string[];
  senderLat: number | null;
  senderLng: number | null;
  receiverLat: number | null;
  receiverLng: number | null;
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

export function getRuntimeSupabaseUrl(): string | null {
  try {
    return localStorage.getItem(LS_SUPABASE_URL) || null;
  } catch { return null; }
}

export function getRuntimeSupabaseKey(): string | null {
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
  // Proper UUID v4 format for Supabase UUID columns
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
      fishAvatar: "express",
      status: "delivered",
      customStatusReason: null,
      mediaUrls: [],
      senderLat: 25.7617,
      senderLng: -80.1918,
      receiverLat: 34.0522,
      receiverLng: -118.2437,
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
      fishAvatar: "voyager",
      status: "received",
      customStatusReason: null,
      mediaUrls: [],
      senderLat: 47.6062,
      senderLng: -122.3321,
      receiverLat: 40.7128,
      receiverLng: -74.006,
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
      fishAvatar: "sky",
      status: "sent",
      customStatusReason: null,
      mediaUrls: [],
      senderLat: 32.7157,
      senderLng: -117.1611,
      receiverLat: 37.7749,
      receiverLng: -122.4194,
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
      fishAvatar: "trail",
      status: "held_by_customs",
      customStatusReason: "Missing customs declaration form",
      mediaUrls: [],
      senderLat: 42.3601,
      senderLng: -71.0589,
      receiverLat: 25.7617,
      receiverLng: -80.1918,
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
      fishAvatar: "swift",
      status: "canceled",
      customStatusReason: null,
      mediaUrls: [],
      senderLat: 27.9506,
      senderLng: -82.4572,
      receiverLat: 33.4484,
      receiverLng: -112.0740,
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
      const { data, error } = await withTimeout(query, 15000, "Package list");
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
        .maybeSingle();
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
      const { data: insertedRows, error } = await withTimeout(
        supabase.from("packages").insert(mapToSupabasePackage(pkg)).select(),
        15000,
        "Package create"
      );
      if (error) {
        console.error("[packageService.create] Supabase insert error:", error.message, error.code, error.details);
        throw new Error(`Database insert failed: ${error.message}`);
      }
      if (!insertedRows || insertedRows.length === 0) {
        console.warn("[packageService.create] Insert succeeded but no rows returned. RLS may be blocking SELECT after INSERT.");
        // Return the local pkg object as fallback
        return pkg;
      }
      return mapFromSupabasePackage(insertedRows[0]);
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
      const { data: updatedRows, error } = await withTimeout(
        supabase.from("packages").update(mapToSupabasePackageUpdate(data)).eq("id", id).select(),
        15000,
        "Package update"
      );
      if (error) {
        console.error("[packageService.update] Supabase update error:", error.message, error.code, error.details);
        throw new Error(`Database update failed: ${error.message}`);
      }
      if (!updatedRows || updatedRows.length === 0) {
        console.warn("[packageService.update] Update succeeded but no rows returned.");
        throw new Error("Update succeeded but row could not be read back.");
      }
      return mapFromSupabasePackage(updatedRows[0]);
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
      const { data: updatedRows, error } = await withTimeout(
        supabase.from("packages").update(updateData).eq("id", id).select(),
        15000,
        "Package updateStatus"
      );
      if (error) throw error;
      if (!updatedRows || updatedRows.length === 0) throw new Error("Update succeeded but no rows returned");
      return mapFromSupabasePackage(updatedRows[0]);
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
    mediaUrls: row.media_urls || [],
    senderLat: row.sender_lat,
    senderLng: row.sender_lng,
    receiverLat: row.receiver_lat,
    receiverLng: row.receiver_lng,
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
    media_urls: pkg.mediaUrls,
    sender_lat: pkg.senderLat,
    sender_lng: pkg.senderLng,
    receiver_lat: pkg.receiverLat,
    receiver_lng: pkg.receiverLng,
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
  if (data.mediaUrls !== undefined) result.media_urls = data.mediaUrls;
  if (data.senderLat !== undefined) result.sender_lat = data.senderLat;
  if (data.senderLng !== undefined) result.sender_lng = data.senderLng;
  if (data.receiverLat !== undefined) result.receiver_lat = data.receiverLat;
  if (data.receiverLng !== undefined) result.receiver_lng = data.receiverLng;
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

export async function checkSupabaseHealth(): Promise<{ ok: boolean; ms: number; error?: string }> {
  if (!supabase) return { ok: false, ms: 0, error: "Supabase client not initialized" };
  const start = Date.now();
  try {
    const { error } = await withTimeout(
      supabase.from("packages").select("id", { count: "exact", head: true }),
      8000,
      "Health check"
    );
    const ms = Date.now() - start;
    if (error) {
      if (error.code === "PGRST301") {
        return { ok: false, ms, error: "Project is paused. Go to Supabase Dashboard and click Restore." };
      }
      return { ok: false, ms, error: error.message };
    }
    return { ok: true, ms };
  } catch (err: any) {
    const ms = Date.now() - start;
    const msg = err?.message || "";
    if (msg.includes("timed out")) {
      return { ok: false, ms, error: "Connection timed out. Your Supabase project may be paused or the URL/Key is wrong." };
    }
    return { ok: false, ms, error: msg };
  }
}
export async function uploadPackageFiles(files: File[]): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  if (!supabase) {
    // LocalStorage fallback: convert to base64 data URIs
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        errors.push(`${file.name}: File too large (max 2MB in demo mode)`);
        continue;
      }
      try {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        urls.push(dataUrl);
      } catch {
        errors.push(`${file.name}: Failed to read file`);
      }
    }
    return { urls, errors };
  }

  // Supabase Storage upload
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`${file.name}: File too large (max 10MB)`);
      continue;
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `packages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('titanroute-media')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      errors.push(`${file.name}: ${uploadError.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from('titanroute-media')
      .getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      urls.push(urlData.publicUrl);
    } else {
      errors.push(`${file.name}: Failed to get public URL`);
    }
  }
  return { urls, errors };
}
