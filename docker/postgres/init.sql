-- SLM Store Database Initialization Script
-- This runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search optimization

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE slm_store_db TO postgres;

-- Set timezone
SET timezone = 'Africa/Cairo';

-- NOTE: BUG FIX - After Prisma migrations run, the cart_items table has a
-- @@unique([userId, productId, variantId]) constraint. In PostgreSQL, NULLs are
-- considered distinct in unique constraints, which means two rows with variantId=NULL
-- would NOT be considered duplicates. To fix this, we drop the generated constraint
-- and replace it with two partial unique indexes:
--
-- The actual fix runs in the app (cart.service.ts uses findFirst + null normalization)
-- but for a clean schema, these indexes are more correct than the generated one.
--
-- This runs AFTER Prisma migrations via a separate migration step.
-- Uncomment and run manually if needed:
--
-- DROP INDEX IF EXISTS cart_items_userId_productId_variantId_key;
-- CREATE UNIQUE INDEX cart_items_no_variant ON cart_items("userId", "productId")
--   WHERE "variantId" IS NULL;
-- CREATE UNIQUE INDEX cart_items_with_variant ON cart_items("userId", "productId", "variantId")
--   WHERE "variantId" IS NOT NULL;
