-- Migration: Create market_metrics table for BER Market Reports Dashboard
-- This table stores all real estate market metrics by year and month

CREATE TABLE IF NOT EXISTS market_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_type TEXT NOT NULL,           -- 'closed_sales', 'new_listings', etc.
  year INTEGER NOT NULL,               -- 2019, 2020, etc.
  month INTEGER NOT NULL,              -- 1-12
  value REAL NOT NULL,                 -- The actual value
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(metric_type, year, month)     -- Prevent duplicates
);

-- Create index for faster queries by metric type
CREATE INDEX IF NOT EXISTS idx_market_metrics_type ON market_metrics(metric_type);

-- Create index for faster queries by year
CREATE INDEX IF NOT EXISTS idx_market_metrics_year ON market_metrics(year);
