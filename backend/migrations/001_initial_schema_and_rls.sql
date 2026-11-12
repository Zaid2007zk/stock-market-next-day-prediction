-- ==============================================================================
-- MarketPulse Database Migration 001: Initial Schema & Row-Level Security (RLS)
-- Target: PostgreSQL 15 on Supabase Free Tier
-- Security Policy: Database-enforced multi-tenant isolation via auth.uid()
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. User Profiles Table (Linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Watchlists Table
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_user_watchlist_name UNIQUE (user_id, name)
);

-- 4. Watchlist Items Table
CREATE TABLE IF NOT EXISTS public.watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(20) DEFAULT 'NSE' NOT NULL,
    added_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    CONSTRAINT unique_watchlist_symbol UNIQUE (watchlist_id, symbol)
);

-- 5. Portfolio Holdings Table
CREATE TABLE IF NOT EXISTS public.portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    exchange VARCHAR(20) DEFAULT 'NSE' NOT NULL,
    quantity NUMERIC(15, 4) NOT NULL CHECK (quantity > 0),
    average_buy_price NUMERIC(15, 4) NOT NULL CHECK (average_buy_price > 0),
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Research Notes Table
CREATE TABLE IF NOT EXISTS public.research_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Database Indices for Performant Query Execution
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_symbol ON public.watchlist_items(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol ON public.portfolio_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_research_notes_user_id ON public.research_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_research_notes_symbol ON public.research_notes(symbol);

-- ==============================================================================
-- 8. DATABASE-ENFORCED ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- A. Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- B. Watchlists RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlists_select_own"
    ON public.watchlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "watchlists_insert_own"
    ON public.watchlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlists_update_own"
    ON public.watchlists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "watchlists_delete_own"
    ON public.watchlists FOR DELETE
    USING (auth.uid() = user_id);

-- C. Watchlist Items RLS (Inherits ownership through parent watchlist)
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_items_select_own"
    ON public.watchlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.watchlists
            WHERE public.watchlists.id = public.watchlist_items.watchlist_id
            AND public.watchlists.user_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_items_insert_own"
    ON public.watchlist_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.watchlists
            WHERE public.watchlists.id = public.watchlist_items.watchlist_id
            AND public.watchlists.user_id = auth.uid()
        )
    );

CREATE POLICY "watchlist_items_delete_own"
    ON public.watchlist_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.watchlists
            WHERE public.watchlists.id = public.watchlist_items.watchlist_id
            AND public.watchlists.user_id = auth.uid()
        )
    );

-- D. Portfolio Holdings RLS
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_holdings_select_own"
    ON public.portfolio_holdings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "portfolio_holdings_insert_own"
    ON public.portfolio_holdings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolio_holdings_update_own"
    ON public.portfolio_holdings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "portfolio_holdings_delete_own"
    ON public.portfolio_holdings FOR DELETE
    USING (auth.uid() = user_id);

-- E. Research Notes RLS
ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_notes_select_own"
    ON public.research_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "research_notes_insert_own"
    ON public.research_notes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "research_notes_update_own"
    ON public.research_notes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "research_notes_delete_own"
    ON public.research_notes FOR DELETE
    USING (auth.uid() = user_id);
