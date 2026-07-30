-- ============================================================================
-- Core Tables para Resuelve Ya - Refactorización de Prisma a PostgreSQL
-- ============================================================================

-- 1. Tipos ENUM
CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'COP', 'PEN', 'BRL', 'ARS', 'CNY', 'CAD', 'MXN');
CREATE TYPE saga_state AS ENUM ('PENDING', 'RESERVED', 'COMPLETED', 'CANCELLED_COMPENSATED', 'FAILED');
CREATE TYPE ledger_reservation_status_type AS ENUM ('RESERVED', 'CONFIRMED', 'COMPENSATED');

-- ============================================================================
-- BASE DE DATOS 1: TRANSACTION ORCHESTRATOR (BFF)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "TRANSACTION" (
    -- Recomendación Tecnica: En Postgres es mejor usar el tipo 'uuid' nativo en lugar de VARCHAR para IDs
    transaction_id UUID PRIMARY KEY, 
    source_account VARCHAR(50) NOT NULL,
    target_account VARCHAR(50) NOT NULL,
    amount decimal (12,2) NOT NULL,
    currency currency_type NOT NULL DEFAULT 'USD',
    saga_state saga_state NOT NULL DEFAULT 'PENDING',
    failure_reason TEXT NULL,
    "createdAt"  TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" TIMESTAMP(3) NULL
   -- NOTA TECNICA: No hay Foreign Keys aquí porque las cuentas viven en otro microservicio.
);

-- Se agrega el comentario en esta linea asi sera más limpio el codigo
COMMENT ON COLUMN saga_transaction.currency IS 'Divisas de transacciones soportadas';

-- ============================================================================
-- BASE DE DATOS 2: ACCOUNT LEDGER (CORE CONTABLE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS ACCOUNT (
    account_id VARCHAR(50) PRIMARY KEY,
    available_balance decimal(12,2) NOT NULL DEFAULT 0,
    reserved_balance decimal(12,2) NOT NULL DEFAULT 0,
    total_balance decimal(12,2) NOT NULL DEFAULT 0,
    currency currency_type NOT NULL DEFAULT 'USD',
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "version" BIGINT NOT NULL DEFAULT 0,
    "createdAt"  TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" TIMESTAMP(3) NULL
);

-- Transacciones en Divisas Soportadas: USD="Dólar estadounidense",  EUR="Euro", GBP="Libra esterlina", JPY="Yen japonés", COP="Peso colombiano", PEN="Sol peruano", BRL="Real brasileño", ARS="Peso argentino", CNY="Yuan chino", CAD="Dólar canadiense", MXN="Peso mexicano"
COMMENT ON COLUMN account.currency IS 'Divisas de transacciones soportadas';

CREATE TABLE IF NOT EXISTS LEDGER_RESERVATION (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL,
    account_id VARCHAR(50) NOT NULL,
    amount decimal (12,2) NOT NULL,
    "status" ledger_reservation_status_type DEFAULT 'RESERVED' NOT NULL,
    "createdAt"  TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" TIMESTAMP(3) NULL, 

    -- ÚNICO FOREIGN KEY VÁLIDO: Ambas tablas viven en el Ledger (mismo microservicios)
    CONSTRAINT fk_reservation_account FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE RESTRICT
);

-- ============================================================================
-- 3. Trigger para actualizar automáticamente updatedAt (Equivalente a ON UPDATE)
-- ============================================================================

-- A. Se crear la función que actualiza el timestamp ya que Postgres no existe la función nativa CURRENTTIMESTAMP de MySQL
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- B. Se asigna la función a las tres tablas del ecosistema
CREATE TRIGGER trg_saga_transaction_updated_at
    BEFORE UPDATE ON saga_transaction
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_account_updated_at
    BEFORE UPDATE ON account
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ledger_reservation_updated_at
    BEFORE UPDATE ON ledger_reservation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();