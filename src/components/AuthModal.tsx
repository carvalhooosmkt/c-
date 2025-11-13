import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react'; // Trocado Mail/Lock/User por ArrowRight
import { useTranslation } from 'react-i18next';
// REMOVIDO: import { supabase } from '../lib/supabase'; // Não é mais necessário

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  
  // Simples função de avanço
  const handleAdvance = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    // Apenas chama a função de sucesso, que faz a transição para a próxima página/estado.
    onSuccess();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão fechar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <img
                  src="/ninna.png"
                  alt="Ninna"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                {t('auth.title')} {/* Ou renomeie para um título mais adequado, como "Começar" */}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-base max-w-xs mx-auto">
                {t('auth.subtitle')} {/* Use esta área para uma mensagem de boas-vindas */}
              </p>
            </div>

            {/* --- Novo Botão de Avanço --- */}
            <motion.button
              onClick={handleAdvance}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-3"
            >
              <ArrowRight className="w-5 h-5" />
              {t('auth.continue_without_login') || 'COMEÇAR A CONVERSAR'}
            </motion.button>
            
            {/* Informação de rodapé */}
            <div className="text-center mt-6">
              <p className="text-xs text-gray-400">
                Seus dados de conversa não serão salvos permanentemente sem autenticação.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
