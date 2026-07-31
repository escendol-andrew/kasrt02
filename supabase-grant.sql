-- Grant access to anon role (for publishable key)
GRANT SELECT, INSERT, UPDATE, DELETE ON warga TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON transaksi TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON settings TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Also grant to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON warga TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transaksi TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON settings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
