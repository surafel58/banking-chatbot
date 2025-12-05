-- Add data_sources table to existing database
-- Run this in Supabase SQL Editor if you already have the base schema

-- Data sources table for knowledge base management
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('document', 'url')),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  file_size INTEGER,
  file_type VARCHAR(50),
  url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_data_sources_type ON data_sources(type);
CREATE INDEX IF NOT EXISTS idx_data_sources_status ON data_sources(status);

-- Enable Row Level Security
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to data_sources" ON data_sources FOR ALL TO service_role USING (true);
CREATE POLICY "Anyone can read data_sources" ON data_sources FOR SELECT USING (true);
CREATE POLICY "Anyone can insert data_sources" ON data_sources FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update data_sources" ON data_sources FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete data_sources" ON data_sources FOR DELETE USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE data_sources IS 'Stores knowledge base data sources (documents and URLs)';

-- Grant permissions
GRANT ALL ON data_sources TO anon, authenticated, service_role;
