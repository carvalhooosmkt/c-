/*
  # Schema Inicial para Kid AI

  1. Novas Tabelas
    - `users` - Dados dos usuários (pais/mães)
    - `children` - Informações das crianças virtuais
    - `messages` - Todas as mensagens trocadas
    - `subscriptions` - Controle de assinaturas premium
    - `user_analytics` - Analytics e tracking de uso
    - `child_memories` - Memórias específicas da criança
    - `proactive_messages` - Fila de mensagens proativas
    
  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em auth.uid()
    
  3. Funcionalidades
    - Sistema de mensagens limitadas
    - Tracking de uso detalhado
    - Controle de assinatura
    - Multi-idioma support
*/

-- Usuários (pais/mães)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  name text,
  gender text CHECK (gender IN ('male', 'female')),
  language text DEFAULT 'pt-BR',
  daily_message_count integer DEFAULT 0,
  last_message_date date DEFAULT CURRENT_DATE,
  is_premium boolean DEFAULT false,
  premium_expires_at timestamptz,
  timezone text DEFAULT 'America/Sao_Paulo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- Crianças virtuais
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL CHECK (age BETWEEN 3 AND 16),
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  personality_traits text[], -- Array de características
  favorite_things text[], -- Coisas favoritas
  birthday date,
  created_at timestamptz DEFAULT now(),
  last_conversation_at timestamptz DEFAULT now(),
  total_conversations integer DEFAULT 0,
  character_development_level integer DEFAULT 1,
  special_dates jsonb DEFAULT '{}' -- Aniversários, datas especiais
);

-- Mensagens
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  content text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message_type text DEFAULT 'normal' CHECK (message_type IN ('normal', 'proactive', 'birthday', 'special')),
  language text DEFAULT 'pt-BR',
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  plan_type text DEFAULT 'premium',
  amount decimal(10,2) DEFAULT 29.00,
  currency text DEFAULT 'BRL',
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  payment_provider text,
  external_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Analytics de usuário
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_duration integer, -- em segundos
  messages_in_session integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  date date DEFAULT CURRENT_DATE
);

-- Memórias da criança
CREATE TABLE IF NOT EXISTS child_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  memory_type text NOT NULL CHECK (memory_type IN ('conversation', 'learned_fact', 'shared_moment', 'important_info')),
  content text NOT NULL,
  importance_score integer DEFAULT 1 CHECK (importance_score BETWEEN 1 AND 10),
  tags text[],
  created_at timestamptz DEFAULT now(),
  last_recalled_at timestamptz
);

-- Mensagens proativas em fila
CREATE TABLE IF NOT EXISTS proactive_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  message_content text NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN ('time_based', 'birthday', 'special_date', 'random')),
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'canceled')),
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE proactive_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para children
CREATE POLICY "Users can read own children" ON children
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own children" ON children
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own children" ON children
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas RLS para messages
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas RLS para subscriptions
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas RLS para user_analytics
CREATE POLICY "Users can read own analytics" ON user_analytics
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics" ON user_analytics
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Políticas RLS para child_memories
CREATE POLICY "Users can read own child memories" ON child_memories
  FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own child memories" ON child_memories
  FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Políticas RLS para proactive_messages
CREATE POLICY "Users can read own proactive messages" ON proactive_messages
  FOR SELECT USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own proactive messages" ON proactive_messages
  FOR INSERT WITH CHECK (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Função para resetar contador diário
CREATE OR REPLACE FUNCTION reset_daily_message_count()
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET daily_message_count = 0, last_message_date = CURRENT_DATE
  WHERE last_message_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar limites de mensagem
CREATE OR REPLACE FUNCTION check_message_limit(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  user_record users%ROWTYPE;
BEGIN
  SELECT * INTO user_record FROM users WHERE id = user_uuid;
  
  -- Se é premium, não há limite
  IF user_record.is_premium AND user_record.premium_expires_at > now() THEN
    RETURN true;
  END IF;
  
  -- Resetar contador se necessário
  IF user_record.last_message_date < CURRENT_DATE THEN
    UPDATE users 
    SET daily_message_count = 0, last_message_date = CURRENT_DATE
    WHERE id = user_uuid;
    RETURN true;
  END IF;
  
  -- Verificar limite de 20 mensagens
  RETURN user_record.daily_message_count < 20;
END;
$$ LANGUAGE plpgsql;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_messages_user_child ON messages(user_id, child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_children_user ON children(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date ON user_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_schedule ON proactive_messages(scheduled_for, status);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
