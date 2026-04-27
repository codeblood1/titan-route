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
  status: "order_confirmed" | "picked_by_courier" | "on_the_way" | "held_by_customs" | "delivered";
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

// Supabase client setup
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

// ===== LOCALSTORAGE HELPERS =====
const LS_PACKAGES = "titanroute_packages_v2";
const LS_HISTORY = "titanroute_history_v2";

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("[supabase.ts] localStorage write failed:", e);
  }
}

function getPackages(): Package[] {
  const pkgs = safeGet<Package[]>(LS_PACKAGES, []);
  if (!Array.isArray(pkgs)) return [];
  return pkgs;
}

function setPackages(pkgs: Package[]) {
  safeSet(LS_PACKAGES, pkgs);
}

function getHistory(): PackageHistory[] {
  const h = safeGet<PackageHistory[]>(LS_HISTORY, []);
  if (!Array.isArray(h)) return [];
  return h;
}

function setHistory(h: PackageHistory[]) {
  safeSet(LS_HISTORY, h);
}

function generateTrackingCode(): string {
  return Math.random().toString(36).substring(2, 7).toUpperCase() +
    Math.random().toString(36).substring(2, 7).toUpperCase();
}

function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function now(): string {
  return new Date().toISOString();
}

// ===== MAPPERS =====
function mapFromSupabasePackage(row: Record<string, unknown>): Package {
  return {
    id: String(row.id),
    trackingCode: String(row.tracking_code),
    senderName: String(row.sender_name),
    recipientName: String(row.recipient_name),
    address: String(row.address),
    phone: String(row.phone),
    weight: Number(row.weight),
    description: row.description ? String(row.description) : null,
    notes: row.notes ? String(row.notes) : null,
    fishAvatar: String(row.fish_avatar),
    status: String(row.status) as Package["status"],
    customStatusReason: row.custom_status_reason ? String(row.custom_status_reason) : null,
    mediaUrls: Array.isArray(row.media_urls) ? (row.media_urls as string[]) : [],
    senderLat: row.sender_lat != null ? Number(row.sender_lat) : null,
    senderLng: row.sender_lng != null ? Number(row.sender_lng) : null,
    receiverLat: row.receiver_lat != null ? Number(row.receiver_lat) : null,
    receiverLng: row.receiver_lng != null ? Number(row.receiver_lng) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapToSupabasePackage(pkg: Package): Record<string, unknown> {
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

function mapToSupabasePackageUpdate(data: Partial<Package>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
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

function mapFromSupabaseHistory(row: Record<string, unknown>): PackageHistory {
  return {
    id: String(row.id),
    packageId: String(row.package_id),
    status: String(row.status),
    reason: row.reason ? String(row.reason) : null,
    changedBy: String(row.changed_by),
    changedAt: String(row.changed_at),
  };
}

// ===== FILE UPLOAD =====
export async function uploadPackageFiles(files: File[]): Promise<string[]> {
  if (!files || files.length === 0) return [];

  if (!supabase) {
    // LocalStorage fallback: base64 data URIs
    const urls: string[] = [];
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        throw new Error(`${file.name} is too large (max 2MB in demo mode)`);
      }
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsDataURL(file);
      });
      urls.push(dataUrl);
    }
    return urls;
  }

  // Supabase Storage upload
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`${file.name} is too large (max 10MB)`);
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `packages/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('titanroute-media')
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      if (uploadError.message?.includes('not found') || uploadError.message?.includes('bucket')) {
        throw new Error(
          `Storage bucket 'titanroute-media' not found. ` +
          `Create it in Supabase Dashboard → Storage → New Bucket → Name: titanroute-media → Public.`
        );
      }
      throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('titanroute-media')
      .getPublicUrl(filePath);

    if (urlData?.publicUrl) {
      urls.push(urlData.publicUrl);
    }
  }
  return urls;
}

// ===== HEALTH CHECK =====
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

// ===== PACKAGE SERVICE =====
export const packageService = {
  async getAll(): Promise<Package[]> {
    return this.list();
  },

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
      console.log("[packageService.list] Supabase response:", { rowCount: data?.length ?? 0, error: error?.message || null });
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
      status: "order_confirmed",
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
      status: "order_confirmed",
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

  async delete(id: string): Promise<void> {
    if (!USE_LOCAL && supabase) {
      const { error } = await withTimeout(
        supabase.from("packages").delete().eq("id", id),
        15000,
        "Package delete"
      );
      if (error) throw error;
      return;
    }
    setPackages(getPackages().filter((p) => p.id !== id));
  },

  async updateStatus(id: string, status: Package["status"], reason?: string): Promise<Package> {
    if (!USE_LOCAL && supabase) {
      const updateData: Record<string, unknown> = { status, updated_at: now() };
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
    packages[idx] = { ...packages[idx], status, updatedAt: now() };
    if (status === "held_by_customs") packages[idx].customStatusReason = reason || null;
    setPackages(packages);

    const history = getHistory();
    history.push({
      id: generateId(),
      packageId: id,
      status,
      reason: reason || null,
      changedBy: "Admin",
      changedAt: now(),
    });
    setHistory(history);

    return packages[idx];
  },

  async getCarrierLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.getLeaderboard();
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    if (!USE_LOCAL && supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase.rpc("get_carrier_leaderboard"),
          15000,
          "Leaderboard"
        );
        if (error || !data) return [];
        return (data as any[]).map((row) => ({
          fishAvatar: String(row.fish_avatar),
          count: Number(row.delivery_count),
          avgTime: row.avg_hours != null ? Number(row.avg_hours) : null,
        }));
      } catch {
        return [];
      }
    }

    // LocalStorage calculation
    const packages = getPackages().filter((p) => p.status === "delivered");
    const groups: Record<string, { count: number; times: number[] }> = {};
    for (const pkg of packages) {
      if (!groups[pkg.fishAvatar]) groups[pkg.fishAvatar] = { count: 0, times: [] };
      groups[pkg.fishAvatar].count++;
    }
    return Object.entries(groups).map(([fishAvatar, g]) => ({
      fishAvatar,
      count: g.count,
      avgTime: null,
    }));
  },
};

// ===== SEED DATA =====
function seedIfEmpty() {
  if (getPackages().length > 0) return;
  const samplePackages: Package[] = [
    {
      id: generateId(), trackingCode: "ABC123DEF4",
      senderName: "John Doe", recipientName: "Jane Smith",
      address: "123 Ocean Ave, Miami, FL", phone: "+1 555-0101",
      weight: 2.5, description: "Electronics package", notes: "Fragile contents",
      fishAvatar: "express", status: "delivered", customStatusReason: null,
      mediaUrls: [],
      senderLat: 25.7617, senderLng: -80.1918, receiverLat: 34.0522, receiverLng: -118.2437,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(), trackingCode: "XYZ789GHI0",
      senderName: "Alice Brown", recipientName: "Bob Wilson",
      address: "456 Harbor St, Seattle, WA", phone: "+1 555-0202",
      weight: 1.8, description: "Books and documents", notes: null,
      fishAvatar: "voyager", status: "on_the_way", customStatusReason: null,
      mediaUrls: [],
      senderLat: 47.6062, senderLng: -122.3321, receiverLat: 40.7128, receiverLng: -74.006,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(), trackingCode: "DEF456JKL7",
      senderName: "Carol White", recipientName: "Dan Green",
      address: "789 Reef Rd, San Diego, CA", phone: "+1 555-0303",
      weight: 5.2, description: "Sports equipment", notes: "Handle with care",
      fishAvatar: "sky", status: "picked_by_courier", customStatusReason: null,
      mediaUrls: [],
      senderLat: 32.7157, senderLng: -117.1611, receiverLat: 37.7749, receiverLng: -122.4194,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: generateId(), trackingCode: "GHI012MNO3",
      senderName: "Eva Black", recipientName: "Frank Gray",
      address: "321 Tide Ln, Boston, MA", phone: "+1 555-0404",
      weight: 0.8, description: "Jewelry", notes: "High value - insured",
      fishAvatar: "trail", status: "held_by_customs", customStatusReason: "Missing customs declaration form",
      mediaUrls: [],
      senderLat: 42.3601, senderLng: -71.0589, receiverLat: 25.7617, receiverLng: -80.1918,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: generateId(), trackingCode: "JKL345PQR8",
      senderName: "George Red", recipientName: "Helen Blue",
      address: "654 Wave St, Tampa, FL", phone: "+1 555-0505",
      weight: 3.0, description: "Clothing items", notes: null,
      fishAvatar: "swift", status: "order_confirmed", customStatusReason: null,
      mediaUrls: [],
      senderLat: 27.9506, senderLng: -82.4572, receiverLat: 33.4484, receiverLng: -112.0740,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];
  setPackages(samplePackages);
}

seedIfEmpty();
