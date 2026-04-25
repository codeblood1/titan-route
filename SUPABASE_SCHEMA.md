# TitanRoute - Supabase Database Schema

This document describes the database tables and schema needed to connect TitanRoute to a real Supabase (PostgreSQL) backend.

## Setup Instructions

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the SQL below to create the tables
4. Copy your `Project URL` and `anon public` API key
5. Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## SQL Schema

```sql
-- Enable Row Level Security (recommended)
alter table if exists packages enable row level security;
alter table if exists package_history enable row level security;

-- Packages Table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code TEXT NOT NULL UNIQUE,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  weight DECIMAL(10, 2) NOT NULL DEFAULT 0,
  description TEXT,
  notes TEXT,
  fish_avatar TEXT NOT NULL DEFAULT 'express',
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'received', 'delivered', 'canceled', 'held_by_customs')),
  custom_status_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Package History Table (status change log)
CREATE TABLE IF NOT EXISTS package_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  reason TEXT,
  changed_by TEXT NOT NULL DEFAULT 'Admin',
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster tracking lookups
CREATE INDEX IF NOT EXISTS idx_packages_tracking_code ON packages(tracking_code);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_history_package_id ON package_history(package_id);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## Table Descriptions

### `packages` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `tracking_code` | TEXT | Unique 10-character tracking code (e.g., ABC123DEF4) |
| `sender_name` | TEXT | Name of the sender |
| `recipient_name` | TEXT | Name of the recipient |
| `address` | TEXT | Delivery address |
| `phone` | TEXT | Contact phone number |
| `weight` | DECIMAL | Package weight in kilograms |
| `description` | TEXT | Optional package description |
| `notes` | TEXT | Optional internal notes |
| `fish_avatar` | TEXT | Carrier ID (e.g., 'express', 'voyager', 'sky') |
| `status` | TEXT | Current status: sent, received, delivered, canceled, held_by_customs |
| `custom_status_reason` | TEXT | Reason when held_by_customs |
| `created_at` | TIMESTAMPTZ | Auto-generated creation timestamp |
| `updated_at` | TIMESTAMPTZ | Auto-updated on every change |

### `package_history` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `package_id` | UUID | Foreign key to packages(id) |
| `status` | TEXT | The new status that was set |
| `reason` | TEXT | Optional reason for the change |
| `changed_by` | TEXT | Who made the change (default: Admin) |
| `changed_at` | TIMESTAMPTZ | When the change occurred |

---

## Carrier Options (fish_avatar values)

| ID | Name | Emoji | Color |
|----|------|-------|-------|
| `express` | Express Prime | 🚚 | #2563EB |
| `voyager` | Sea Voyager | 🚢 | #0D9488 |
| `sky` | Sky Freight | ✈️ | #7C3AED |
| `trail` | Trail Blazer | 🚛 | #DC2626 |
| `swift` | Swift Route | 🏍️ | #EA580C |
| `global` | Global Link | 🌐 | #0891B2 |
| `rapid` | Rapid Rail | 🚆 | #4F46E5 |
| `direct` | Direct Drop | 📦 | #059669 |
| `cargo` | Cargo King | 🏗️ | #CA8A04 |
| `flash` | Flash Fleet | ⚡ | #9333EA |

---

## Row Level Security (RLS) Policies (Optional)

If you want to secure your data with RLS:

```sql
-- Allow anyone to read packages (public tracking)
CREATE POLICY "Allow public read" ON packages
  FOR SELECT TO anon USING (true);

-- Allow anyone to read history (public tracking)
CREATE POLICY "Allow public read history" ON package_history
  FOR SELECT TO anon USING (true);

-- Only authenticated admins can write
CREATE POLICY "Allow admin insert" ON packages
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow admin update" ON packages
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow admin delete" ON packages
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow admin insert history" ON package_history
  FOR INSERT TO authenticated WITH CHECK (true);
```

> **Note:** The app currently uses a simple password-based auth (stored in localStorage) rather than Supabase Auth. To use Supabase Auth, you would need to integrate `supabase.auth.signInWithPassword()`.

---

## Fallback Mode

If Supabase credentials are **not** provided in `.env`, the app automatically uses **localStorage** as a fallback. All data is stored in the browser and will persist across page reloads. This is useful for:
- Development and testing
- Demos without a backend
- Quick prototyping

To switch to Supabase:
1. Create the tables using the SQL above
2. Add your credentials to `.env`
3. Refresh the page - the app will automatically use Supabase
