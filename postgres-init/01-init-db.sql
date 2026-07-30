-- ============================================================================
-- BASE DE DATOS 1: TRANSACTION ORCHESTRATOR (BFF)
-- ============================================================================
CREATE DATABASE orchestrator_db;
-- Nos conectamos a la nueva base de datos para crear sus cosas adentro

\c orchestrator_db;
CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'COP', 'PEN', 'BRL', 'ARS', 'CNY', 'CAD', 'MXN');
CREATE TYPE saga_state AS ENUM ('PENDING', 'RESERVED', 'COMPLETED', 'CANCELLED_COMPENSATED', 'FAILED');

CREATE TABLE IF NOT EXISTS "TRANSACTION" (
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
);

-- CORRECCIÓN: Se cambió saga_transaction por "TRANSACTION"
COMMENT ON COLUMN "TRANSACTION".currency IS 'Divisas de transacciones soportadas';

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
-- CORRECCIÓN: Se cambió saga_transaction por "TRANSACTION"
CREATE TRIGGER trg_saga_transaction_updated_at
    BEFORE UPDATE ON "TRANSACTION"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BASE DE DATOS 2: ACCOUNT LEDGER (CORE CONTABLE)
-- ============================================================================
CREATE DATABASE ledger_db;
-- Nos conectamos a la segunda base de datos
\c ledger_db;

-- NOTA: Como cambiamos de BD, tenemos que volver a declarar los ENUMs que usa esta BD
CREATE TYPE currency_type AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'COP', 'PEN', 'BRL', 'ARS', 'CNY', 'CAD', 'MXN');
CREATE TYPE ledger_reservation_status_type AS ENUM ('RESERVED', 'CONFIRMED', 'COMPENSATED');

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
    CONSTRAINT fk_reservation_account FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE RESTRICT
);

-- Volvemos a crear la función porque estamos en una BD nueva
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_account_updated_at
    BEFORE UPDATE ON account
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ledger_reservation_updated_at
    BEFORE UPDATE ON ledger_reservation
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();