-- FCM Tokens Table for Firebase Cloud Messaging
-- This replaces the web-push VAPID subscriptions for FCM support

-- FCM Tokens table for storing device FCM tokens
CREATE TABLE IF NOT EXISTS fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  platform TEXT CHECK (platform IN ('web', 'android', 'ios')),
  browser TEXT,
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FCM Notification logs table for tracking all FCM notifications sent
CREATE TABLE IF NOT EXISTS fcm_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID REFERENCES fcm_tokens(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'invalid_token')),
  error_message TEXT,
  message_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_active ON fcm_tokens(is_active);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_platform ON fcm_tokens(platform);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(token);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_created ON fcm_tokens(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fcm_notification_logs_token ON fcm_notification_logs(token_id);
CREATE INDEX IF NOT EXISTS idx_fcm_notification_logs_status ON fcm_notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_fcm_notification_logs_created ON fcm_notification_logs(created_at DESC);

-- Add comment to table
COMMENT ON TABLE fcm_tokens IS 'Stores FCM registration tokens for push notifications';
COMMENT ON TABLE fcm_notification_logs IS 'Logs all FCM notifications sent to devices';
