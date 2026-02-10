-- Enhanced AI Store Builder - Supabase Schema
-- Real-time AI conversation storage and learning

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" = 'your-jwt-secret';

-- User Preferences Table
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_type VARCHAR(50),
  preferred_colors JSONB DEFAULT '[]',
  design_style VARCHAR(50) DEFAULT 'modern',
  language VARCHAR(10) DEFAULT 'ar',
  ai_suggestions_enabled BOOLEAN DEFAULT true,
  ui_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Conversations Table
CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  intent VARCHAR(50),
  confidence DECIMAL(3,2),
  execution_time DECIMAL(5,3),
  html_before TEXT,
  html_after TEXT,
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store Analytics Table  
CREATE TABLE store_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  popular_sections JSONB DEFAULT '[]',
  device_breakdown JSONB DEFAULT '{}',
  traffic_sources JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Learning Data Table
CREATE TABLE ai_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type VARCHAR(50) NOT NULL,
  input_pattern TEXT NOT NULL,
  output_result TEXT NOT NULL,
  success_rate DECIMAL(5,2) DEFAULT 100,
  usage_count INTEGER DEFAULT 1,
  store_types VARCHAR[] DEFAULT '{}',
  effectiveness_score DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Notifications Table
CREATE TABLE ai_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'suggestion', 'completion', 'error', 'insight'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_store_id ON ai_conversations(store_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_store_analytics_store_id ON store_analytics(store_id);
CREATE INDEX idx_ai_learning_pattern_type ON ai_learning_data(pattern_type);
CREATE INDEX idx_ai_notifications_user_id ON ai_notifications(user_id, created_at);

-- Row Level Security Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for ai_conversations  
CREATE POLICY "Users can view their own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert conversations" ON ai_conversations
  FOR INSERT WITH CHECK (true);

-- Policies for store_analytics
CREATE POLICY "Users can view analytics for their stores" ON store_analytics
  FOR SELECT USING (
    store_id IN (
      SELECT id FROM stores WHERE user_id = auth.uid()
    )
  );

-- Policies for ai_notifications
CREATE POLICY "Users can view their own notifications" ON ai_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON ai_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE ai_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE store_analytics;

-- Functions for auto-updating
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ai_learning_data_updated_at 
  BEFORE UPDATE ON ai_learning_data 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Analytics aggregation function
CREATE OR REPLACE FUNCTION update_store_analytics(store_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE store_analytics 
  SET 
    page_views = page_views + 1,
    last_updated = NOW()
  WHERE store_id = store_uuid;
  
  -- Insert if doesn't exist
  INSERT INTO store_analytics (store_id, page_views)
  SELECT store_uuid, 1
  WHERE NOT EXISTS (
    SELECT 1 FROM store_analytics WHERE store_id = store_uuid
  );
END;
$$ LANGUAGE plpgsql;