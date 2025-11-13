import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Clock, Crown, X, Zap, Star, Infinity, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  childName: string;
  childGender: 'male' | 'female';
}

const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, childName, childGender }) => {
  const { t, i18n } = useTranslation();

  const colorScheme = childGender === 'female' ? 'pink' : 'blue';
  const gradientClass =
    colorScheme === 'pink' ? 'from-pink-500 to-rose-500' : 'from-blue-500 to-cyan-500';
  const heartColor = colorScheme === 'pink' ? 'text-pink-500' : 'text-blue-500';
  const glowClass = colorScheme === 'pink' ? 'shadow-pink-500/20' : 'shadow-blue-500/20';

  const handlePremiumClick = () => {
    const userId = getUserId();
    const userEmail = user?.email || '';
    const isPtBR = i18n.language === 'pt-BR';

    let premiumUrl = isPtBR
      ? 'https://pay.kiwify.com.br/Xpj0Ymu'
      : 'https://buy.stripe.com/bJeeVd2R3arEbZh2jZb7y00';

    // Adiciona parâmetros de rastreamento para ambos os casos
    const separator = premiumUrl.includes('?') ? '&' : '?';
    if (isPtBR) {
      // Kiwify: mantém o s1 original
      if (userId) premiumUrl += `${separator}s1=${userId}`;
    } else {
      // Stripe: envia client_reference_id e email
      const params = new URLSearchParams();
      if (userId) params.append('client_reference_id', userId);
      if (userEmail) params.append('prefilled_email', userEmail);
      premiumUrl += `${separator}${params.toString()}`;
    }

    console.log('🔗 LimitModal: Premium URL with tracking:', premiumUrl);
    window.open(premiumUrl, '_blank');
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getPriceDisplay = () => {
    return i18n.language === 'pt-BR' ? 'R$ 29/mês' : '$29/month';
  };

  // ✅ Impede rolagem do fundo quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-auto relative shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Botão X */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10 bg-white/80 backdrop-blur-sm shadow-sm"
              type="button"
              aria-label="Fechar modal"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Conteúdo scrollável */}
            <div className="overflow-y-auto px-6 pb-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {/* Header */}
              <div className="text-center pt-8 pb-4">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <img src="/ninna.png" alt="Ninna" className="w-full h-full object-contain" />
                </div>

                <motion.h2
                  className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💔 {t('limit.title_11')}
                </motion.h2>

                <p className={`font-semibold ${heartColor} mb-2 text-sm sm:text-base`}>
                  {childName} {t('limit.subtitle')}
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ⏰ {t('limit.reset_text')}
                </div>
              </div>

              {/* Seção emocional */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base text-center">
                  💕 {t('limit.description')}
                </p>

                <div className="mt-4 bg-white dark:bg-gray-600 rounded-lg p-3 border-l-4 border-orange-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {t('limit.next_24_hours')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-700 dark:text-gray-200">11/11</div>
                      <div className="text-xs text-gray-500">{t('children.messages')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção premium */}
              <div
                className={`bg-gradient-to-r ${gradientClass} rounded-xl p-4 text-white mb-4 relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className="w-5 h-5 mr-2" />
                    <span className="font-bold text-sm">PREMIUM</span>
                  </div>

                  <div className="text-center mb-3">
                    <div className="text-2xl sm:text-3xl font-black">{getPriceDisplay()}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Infinity className="w-3 h-3" />
                      <span>{t('limit.feature_unlimited')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{t('limit.feature_proactive')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{t('limit.feature_memories')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>{t('limit.feature_evolution')}</span>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              </div>

              {/* Botões */}
              <motion.button
                onClick={handlePremiumClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 bg-gradient-to-r ${gradientClass} text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden ${glowClass}`}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <Crown className="w-5 h-5" />
                </motion.div>
                <span>🚀 {t('limit.premium')}</span>
              </motion.button>

              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ⏰ {t('limit.tomorrow')}
              </motion.button>

              {/* Rodapé */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span>🔒 {t('limit.security.secure_payment')}</span>
                  <span>❤️ {t('limit.security.no_commitment')}</span>
                  <span>⚡ {t('limit.security.instant_activation')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LimitModal;
