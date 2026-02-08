-- First, merge duplicate entries by customer (keeping the most recently created entry)
-- This consolidates data for the same customer
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY LOWER(mijoz_nomi), mijoz_turi ORDER BY sana DESC NULLS LAST) as rn
  FROM kronka
  WHERE mijoz_nomi IS NOT NULL
)
DELETE FROM kronka k
WHERE EXISTS (
  SELECT 1 FROM duplicates d
  WHERE k.id = d.id
  AND d.rn > 1
);

-- Create a trigger function to calculate qancha_qoldi automatically
CREATE OR REPLACE FUNCTION calculate_kronka_qoldi()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate remaining debt: what they owe minus what they paid
  NEW.qancha_qoldi := COALESCE(NEW.qanchaga_kelishildi, 0) - COALESCE(NEW.qancha_berdi, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate qancha_qoldi on insert/update
DROP TRIGGER IF EXISTS kronka_calculate_qoldi_trigger ON kronka;
CREATE TRIGGER kronka_calculate_qoldi_trigger
BEFORE INSERT OR UPDATE ON kronka
FOR EACH ROW
EXECUTE FUNCTION calculate_kronka_qoldi();

-- Add unique index on (mijoz_nomi, mijoz_turi) for kronka table (case-insensitive)
-- This ensures we merge data for duplicate customer entries
DROP INDEX IF EXISTS kronka_mijoz_unique_idx;
CREATE UNIQUE INDEX kronka_mijoz_unique_idx ON kronka (LOWER(mijoz_nomi), mijoz_turi) WHERE mijoz_nomi IS NOT NULL;
