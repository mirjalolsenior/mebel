-- Create zapchastlar table for spare parts
CREATE TABLE IF NOT EXISTS zapchastlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tovar_nomi TEXT NOT NULL,
  raqami TEXT,
  amal_turi TEXT NOT NULL,
  miqdor NUMERIC NOT NULL,
  izoh TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create kronkalar table for ribbon products
CREATE TABLE IF NOT EXISTS kronkalar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tovar_nomi TEXT NOT NULL,
  raqami TEXT,
  amal_turi TEXT NOT NULL,
  miqdor NUMERIC NOT NULL,
  izoh TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_zapchastlar_created_at ON zapchastlar(created_at);
CREATE INDEX IF NOT EXISTS idx_zapchastlar_tovar_nomi ON zapchastlar(tovar_nomi);
CREATE INDEX IF NOT EXISTS idx_kronkalar_created_at ON kronkalar(created_at);
CREATE INDEX IF NOT EXISTS idx_kronkalar_tovar_nomi ON kronkalar(tovar_nomi);
