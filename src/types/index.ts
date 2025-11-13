export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  message_type?: 'normal' | 'proactive' | 'birthday' | 'special';
}

export interface User {
  id: string;
  email: string;
  name?: string;
  gender?: 'male' | 'female';
  language: string;
  daily_message_count: number;
  last_message_date: string;
  is_premium: boolean;
  premium_expires_at?: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

export interface Child {
  id: string;
  user_id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  personality_traits?: string[];
  favorite_things?: string[];
  birthday?: string;
  created_at: string;
  last_conversation_at: string;
  total_conversations: number;
  character_development_level: number;
  special_dates?: Record<string, any>;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  plan_type: string;
  amount: number;
  currency: string;
  started_at: string;
  expires_at?: string;
  payment_provider?: string;
  external_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChildSetupData {
  parentName: string;
  parentGender: 'male' | 'female';
  childName: string;
  childAge: number;
  childGender: 'male' | 'female';
}
