-- RT Finance Database Setup
-- Jalankan di Supabase SQL Editor

-- Table warga
CREATE TABLE IF NOT EXISTS warga (
  id BIGSERIAL PRIMARY KEY,
  no INTEGER,
  nama TEXT NOT NULL,
  blok TEXT,
  bayar JSONB DEFAULT '{}'::jsonb,
  kosong BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table transaksi
CREATE TABLE IF NOT EXISTS transaksi (
  id BIGSERIAL PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL,
  jenis TEXT NOT NULL CHECK (jenis IN ('masuk', 'keluar')),
  keterangan TEXT,
  jumlah BIGINT DEFAULT 0,
  tanggal DATE,
  ref TEXT,
  bulan INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table settings (for config like tahun, iuran, etc)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default settings
INSERT INTO settings (key, value) VALUES 
  ('tahun', '2025'::jsonb),
  ('iuran_normal', '200000'::jsonb),
  ('iuran_kosong', '100000'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE warga;
ALTER PUBLICATION supabase_realtime ADD TABLE transaksi;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;

-- RLS (Row Level Security) - allow public read, authenticated write
ALTER TABLE warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (for warga to view)
CREATE POLICY "Allow public read warga" ON warga FOR SELECT USING (true);
CREATE POLICY "Allow public read transaksi" ON transaksi FOR SELECT USING (true);
CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);

-- Allow anonymous write access (admin operations via API key)
CREATE POLICY "Allow public insert warga" ON warga FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update warga" ON warga FOR UPDATE USING (true);
CREATE POLICY "Allow public delete warga" ON warga FOR DELETE USING (true);

CREATE POLICY "Allow public insert transaksi" ON transaksi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update transaksi" ON transaksi FOR UPDATE USING (true);
CREATE POLICY "Allow public delete transaksi" ON transaksi FOR DELETE USING (true);

CREATE POLICY "Allow public insert settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update settings" ON settings FOR UPDATE USING (true);
