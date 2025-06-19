CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tools (name, description, url, category, tags, is_featured, is_trending)
VALUES
  ('ChatGPT', 'Advanced conversational AI assistant by OpenAI for answering questions, writing, and problem-solving', 'https://chat.openai.com', 'Chatbots', ARRAY['AI', 'chatbot', 'conversation'], true, true),
  ('Midjourney', 'AI-powered image generation tool that creates stunning artwork from text descriptions', 'https://midjourney.com', 'Image Generation', ARRAY['AI', 'images', 'art'], true, true),
  ('Copy.ai', 'AI marketing copywriter that generates high-converting content for ads, emails, and websites', 'https://copy.ai', 'Marketing', ARRAY['content', 'copywriting', 'marketing'], true, false),
  ('Claude', 'Anthropic''s AI assistant focused on helpful, harmless, and honest conversations', 'https://claude.ai', 'Chatbots', ARRAY['AI', 'assistant', 'conversation'], true, true),
  ('Jasper AI', 'Enterprise-grade AI content platform for creating marketing copy and long-form content', 'https://jasper.ai', 'Content Creation', ARRAY['content', 'writing', 'enterprise'], false, true),
  ('Runway ML', 'AI-powered creative tools for video editing, image generation, and multimedia content', 'https://runwayml.com', 'Video & Media', ARRAY['AI', 'video', 'creative'], true, false),
  ('Notion AI', 'AI writing assistant integrated into Notion workspace for enhanced productivity', 'https://notion.so/ai', 'Productivity', ARRAY['productivity', 'writing', 'workspace'], false, true),
  ('Canva AI', 'AI-enhanced design platform for creating graphics, presentations, and visual content', 'https://canva.com/ai', 'Design', ARRAY['design', 'graphics', 'visual'], false, false),
  ('GitHub Copilot', 'AI pair programmer that suggests code completions and entire functions', 'https://github.com/features/copilot', 'Development', ARRAY['coding', 'development', 'AI'], true, true),
  ('Grammarly', 'AI-powered writing assistant for grammar checking, style improvement, and clarity', 'https://grammarly.com', 'Writing', ARRAY['writing', 'grammar', 'editing'], false, false);