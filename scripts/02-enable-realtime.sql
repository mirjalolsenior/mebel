-- Enable Supabase Realtime for all tables
-- This allows real-time subscriptions to table changes

-- Enable realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Enable realtime for regular_clients table
ALTER PUBLICATION supabase_realtime ADD TABLE regular_clients;

-- Enable realtime for clients table
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
