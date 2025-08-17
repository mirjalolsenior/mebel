-- Sample data for testing
-- Insert some sample products, orders, and clients

-- Sample products
INSERT INTO products (name, got_amount, paid_amount, due_date) VALUES
('Yotoq xonasi mebeli', 5000000, 3000000, '2025-01-25'),
('Oshxona stoli', 1500000, 1500000, '2025-01-20'),
('Shkaf', 2500000, 1000000, '2025-01-30'),
('Divan', 3000000, 0, '2025-02-05');

-- Sample orders
INSERT INTO orders (type, number, got_amount, paid_amount, due_date) VALUES
('Maxsus buyurtma', 'ORD-001', 4000000, 2000000, '2025-01-28'),
('Standart', 'ORD-002', 1800000, 1800000, '2025-01-22'),
('Premium', 'ORD-003', 6000000, 3500000, '2025-02-10');

-- Sample regular clients
INSERT INTO regular_clients (client_name, delivered_count, tape_used_m, paid_amount, note) VALUES
('Aziz Karimov', 15, 120.5, 12000000, 'Doimiy mijoz, chegirmali narx'),
('Nodira Tosheva', 8, 85.2, 6500000, 'Tez to''lov qiladi'),
('Sherzod Umarov', 22, 180.7, 18000000, 'Katta buyurtmalar beradi');

-- Sample clients
INSERT INTO clients (client_name, delivered_count, tape_used_m, paid_amount, note) VALUES
('Malika Rahimova', 3, 25.5, 2500000, 'Yangi mijoz'),
('Bobur Aliyev', 5, 42.8, 4200000, 'Sifatli ishni yaxshi ko''radi'),
('Zarina Nazarova', 2, 18.3, 1800000, 'Kichik buyurtmalar');
