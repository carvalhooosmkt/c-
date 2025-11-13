import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import AboutPage from './components/AboutPage';
// REMOVIDOS: Header, AuthModal, ChildSetup, ChildSelector, LimitModal
// REMOVIDO: { supabase } from './lib/supabase';
import { User, Child } from './types';
import './lib/i18n';

// TIPOS SIMPLIFICADOS (apenas para manter a compatibilidade de tipos)
type AppState = 'chat'; 

// DADOS SIMULADOS PARA A CHATBOT GINECOLOGISTA (Dra. Clara Mendes)
const SIMULATED_USER: User = { 
    id: 'anon_ginecologista', 
    email: 'anon@suporte.com', 
    name: 'Paciente Anônima', 
    gender: 'female', 
    is_premium: true, // Garante que não haverá limite de mensagens
    created_at: new Date().toISOString() 
};

const SIMULATED_CHILD: Child = {
    id: 'dra_clara_mendes',
    user_id: 'anon_ginecologista',
    name: 'Dra. Clara Mendes',
    age: 40, // Idade simbólica
    gender: 'female',
    description: 'Suporte especializado em Adenomiose.',
    created_at: new Date().toISOString()
};

function App() {
    const { t } = useTranslation();
    
    // Estado único focado no chat
    const [appState, setAppState] = useState<AppState>('chat');
    
    // Usuário e criança são sempre os dados simulados
    const [user, setUser] = useState<User | null>(SIMULATED_USER);
    const [child, setChild] = useState<Child | null>(SIMULATED_CHILD);
    
    const [showAbout, setShowAbout] = useState(false);

    // FUNÇÕES PLACEHOLDER - Nenhuma delas realmente avança ou lida com Auth/Limits
    
    const handleFirstMessage = () => { 
        // Não faz nada, o chat já está ativo.
        console.log('Chat já ativo. Primeira mensagem ignorada.');
    };
    
    const handleMessageLimit = () => {
        // Chat Anônimo é configurado como Premium, então não há limite.
        alert('Este chat está configurado com limites ilimitados (Simulação Premium).');
    };
    
    const handleShowAuth = () => {
        // Não mostra modal de auth/avanço, pois o chat é imediato.
        console.log('Login e Setup ignorados. Chat iniciado diretamente.');
    };

    // Define o esquema de cores para o background
    const getBackgroundClass = () => 'from-white via-pink-50/30 to-rose-50/20'; // Esquema de cores de suporte feminino

    // Como o appState é sempre 'chat', removemos o `if (loading)` e os outros `if (appState === ...)`

    return (
        <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClass()} transition-colors duration-500`}>
            <AnimatePresence mode="wait">
                {appState === 'chat' && (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="min-h-screen flex flex-col"
                    >
                        {/* Header Simplificado (substituindo o Header completo) */}
                        <header className="py-4 px-6 bg-white/70 backdrop-blur-sm shadow-md">
                            <h1 className="text-xl font-bold text-pink-600 flex items-center gap-2">
                                🩺 Dra. Clara Mendes - Suporte Adenomiose
                            </h1>
                            <p className="text-sm text-gray-500">
                                {t('common.educational_support_only')}
                            </p>
                        </header>
                        
                        <div className="flex-1 flex flex-col">
                            <ChatInterface 
                                // Importante: isInitialState deve ser false para renderizar o chat
                                isInitialState={false} 
                                onFirstMessage={handleFirstMessage}
                                user={user} 
                                child={child}
                                onMessageLimit={handleMessageLimit}
                                onShowAuth={handleShowAuth}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* O modal de About é o único que permanece */}
            <AboutPage
                isOpen={showAbout}
                onClose={() => setShowAbout(false)}
            />
            {/* REMOVIDO: AuthModal */}
            {/* REMOVIDO: LimitModal */}
        </div>
    );
}

export default App;
