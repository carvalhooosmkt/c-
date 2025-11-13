/*
  # Melhorias no Sistema de Análise e Memórias

  1. Verificação e Criação de Índices
    - Otimização de performance para queries frequentes
    - Índices compostos para análises complexas
    
  2. Funções Utilitárias
    - Função para análise de uso diário
    - Função para limpeza de dados antigos
    - Trigger para atualização automática de analytics
    
  3. Melhorias em RLS
    - Políticas mais específicas
    - Melhor controle de acesso
*/

-- Verificar e criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_user_date ON messages(user_id, created_at::date);
CREATE INDEX IF NOT EXISTS idx_child_memories_importance ON child_memories(child_id, importance_score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(user_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_children_last_conversation ON children(user_id, last_conversation_at DESC);

-- Função para análise diária de uso
CREATE OR REPLACE FUNCTION get_daily_usage_stats(user_uuid uuid, target_date date DEFAULT CURRENT_DATE)
RETURNS TABLE(
  total_messages integer,
  conversation_duration interval,
  children_count integer,
  active_children integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(msg_count.total, 0)::integer as total_messages,
    COALESCE(msg_duration.duration, '0 seconds'::interval) as conversation_duration,
    COALESCE(child_count.total, 0)::integer as children_count,
    COALESCE(active_count.total, 0)::integer as active_children
  FROM (
    SELECT user_uuid as id
  ) base
  LEFT JOIN (
    SELECT user_id, COUNT(*) as total
    FROM messages 
    WHERE user_id = user_uuid 
    AND created_at::date = target_date
    GROUP BY user_id
  ) msg_count ON base.id = msg_count.user_id
  LEFT JOIN (
    SELECT user_id, MAX(created_at) - MIN(created_at) as duration
    FROM messages 
    WHERE user_id = user_uuid 
    AND created_at::date = target_date
    GROUP BY user_id
  ) msg_duration ON base.id = msg_duration.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as total
    FROM children
    WHERE user_id = user_uuid
    GROUP BY user_id
  ) child_count ON base.id = child_count.user_id
  LEFT JOIN (
    SELECT user_id, COUNT(*) as total
    FROM children
    WHERE user_id = user_uuid
    AND last_conversation_at::date = target_date
    GROUP BY user_id
  ) active_count ON base.id = active_count.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar memórias automaticamente baseado em conversas importantes
CREATE OR REPLACE FUNCTION create_memory_from_conversation()
RETURNS TRIGGER AS $$
DECLARE
  memory_content text;
  importance integer;
BEGIN
  -- Só criar memórias para mensagens de assistente (IA)
  IF NEW.role = 'assistant' THEN
    -- Determinar importância baseado no conteúdo
    importance := CASE
      WHEN LENGTH(NEW.content) > 200 THEN 7
      WHEN NEW.content ILIKE '%amor%' OR NEW.content ILIKE '%saudade%' THEN 8
      WHEN NEW.content ILIKE '%primeira vez%' OR NEW.content ILIKE '%especial%' THEN 9
      ELSE 5
    END;
    
    -- Criar memória se for importante o suficiente
    IF importance >= 7 THEN
      memory_content := SUBSTRING(NEW.content FROM 1 FOR 500);
      
      INSERT INTO child_memories (
        child_id,
        memory_type,
        content,
        importance_score,
        tags
      ) VALUES (
        NEW.child_id,
        'shared_moment',
        memory_content,
        importance,
        ARRAY['conversa', 'momento_especial']
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar memórias automaticamente
DROP TRIGGER IF EXISTS trigger_create_memory ON messages;
CREATE TRIGGER trigger_create_memory
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION create_memory_from_conversation();

-- Função para atualizar estatísticas do filho
CREATE OR REPLACE FUNCTION update_child_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar última conversa e total de conversas
  UPDATE children 
  SET 
    last_conversation_at = NEW.created_at,
    total_conversations = total_conversations + 1
  WHERE id = NEW.child_id AND NEW.role = 'user';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estatísticas do filho
DROP TRIGGER IF EXISTS trigger_update_child_stats ON messages;
CREATE TRIGGER trigger_update_child_stats
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_child_stats();

-- Função para limpeza automática de dados antigos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  -- Remover analytics com mais de 90 dias
  DELETE FROM user_analytics 
  WHERE created_at < CURRENT_DATE - INTERVAL '90 days';
  
  -- Remover memórias menos importantes com mais de 30 dias
  DELETE FROM child_memories 
  WHERE created_at < CURRENT_DATE - INTERVAL '30 days'
  AND importance_score < 5;
  
  -- Remover mensagens proativas não enviadas antigas
  DELETE FROM proactive_messages
  WHERE status = 'pending'
  AND scheduled_for < CURRENT_TIMESTAMP - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Política adicional para child_memories (update)
CREATE POLICY "Users can update own child memories" ON child_memories
  FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Política adicional para proactive_messages (update)
CREATE POLICY "Users can update own proactive messages" ON proactive_messages
  FOR UPDATE USING (child_id IN (SELECT id FROM children WHERE user_id = auth.uid()));

-- Verificar se todas as tabelas têm as colunas necessárias
DO $$
BEGIN
  -- Verificar se children tem character_development_level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'children' AND column_name = 'character_development_level'
  ) THEN
    ALTER TABLE children ADD COLUMN character_development_level integer DEFAULT 1;
  END IF;

  -- Verificar se messages tem tokens_used
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'tokens_used'
  ) THEN
    ALTER TABLE messages ADD COLUMN tokens_used integer DEFAULT 0;
  END IF;

  -- Verificar se user_analytics tem session_duration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_analytics' AND column_name = 'session_duration'
  ) THEN
    ALTER TABLE user_analytics ADD COLUMN session_duration integer;
  END IF;
END $$;
