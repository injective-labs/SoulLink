-- SQL Schema for SoulLink (Apply this in Supabase SQL Editor)

CREATE TABLE IF NOT EXISTS public.bindings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT UNIQUE NOT NULL,            -- Wallet Address (Lowercased)
    passkey_id TEXT NOT NULL,                -- WebAuthn Credential ID
    credential_id TEXT,                      -- Raw Credential ID (Base64)
    public_key TEXT,                         -- Public Key String
    timestamp BIGINT NOT NULL,               -- Binding Timestamp
    tx_hash TEXT,                            -- Mock/Real Transaction Hash
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Security: Only allow authenticated or specific access if needed, 
    -- but for current demo we rely on the Anon Key.
    CONSTRAINT address_format CHECK (address ~* '^0x[a-fA-F0-9]{40}$')
);

-- Index for optimized lookups by wallet address
CREATE INDEX IF NOT EXISTS idx_bindings_address ON public.bindings(address);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bindings ENABLE ROW LEVEL SECURITY;

-- Creating a simple policy: Anyone with Anon key can read/write for this demo
CREATE POLICY "Enable access for all users" ON public.bindings
    FOR ALL
    USING (true)
    WITH CHECK (true);

-------------------------------------------------------
-- PRODUCTION TABLE (bindings_prod)
-------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bindings_prod (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT UNIQUE NOT NULL,
    passkey_id TEXT NOT NULL,
    credential_id TEXT,
    public_key TEXT,
    timestamp BIGINT NOT NULL,
    tx_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT address_format_prod CHECK (address ~* '^0x[a-fA-F0-9]{40}$')
);

CREATE INDEX IF NOT EXISTS idx_bindings_address_prod ON public.bindings_prod(address);
ALTER TABLE public.bindings_prod ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable access for all users prod" ON public.bindings_prod
    FOR ALL
    USING (true)
    WITH CHECK (true);
