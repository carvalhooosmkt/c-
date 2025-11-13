import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Star, Heart, Zap, Shield, MessageCircle, Baby, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
}

const PremiumUpsellModal: React.FC<PremiumUpsellModalProps> = ({ isOpen, onClose, user }) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handlePremiumClick = () => {
    const userId = getUserId();
    const userEmail = user?.email;
    const isPtBR = i18n.language === 'pt-BR';

    let premiumUrl = isPtBR
      ? 'https://pay.kiwify.com.br/Xpj0Ymu'
      : 'https://buy.stripe.com/bJeeVd2R3arEbZh2jZb7y00';

    // Adiciona parâmetros de tracking
    if (userId || userEmail) {
      const separator = premiumUrl.includes('?') ? '&' : '?';
      const params = new URLSearchParams();
      if (isPtBR) {
        if (userId) params.append('s1', userId);
      } else {
        if (userId) params.append('client_reference_id', userId);
        if (userEmail) params.append('prefilled_email', userEmail);
      }
      premiumUrl += `${separator}${params.toString()}`;
    }

    window.open(premiumUrl, '_blank');
  };

  const getPriceDisplay = () => (i18n.language === 'pt-BR' ? 'R$ 29/mês' : 'US$29/month');

  const features = [
    { icon: <Baby />, text: t('premium.upsell.feature1'), color: 'from-purple-500 to-pink-500' },
    { icon: <MessageCircle />, text: t('premium.upsell.feature2'), color: 'from-blue-500 to-cyan-500' },
    { icon: <Zap />, text: t('premium.upsell.feature3'), color: 'from-green-500 to-emerald-500' },
    { icon: <Heart />, text: t('premium.upsell.feature4'), color: 'from-orange-500 to-red-500' },
    { icon: <Sparkles />, text: t('premium.upsell.feature5'), color: 'from-yellow-500 to-amber-500' },
    { icon: <Star />, text: t('premium.upsell.feature6'), color: 'from-rose-500 to-pink-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg mx-auto my-4 relative shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex flex-col max-h-[90vh]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition"
            >
              <X className="w-4 h-4 text-gray-700 dark:text-gray-200" />
            </button>

            <div className="overflow-y-auto px-6 sm:px-8 py-8 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 rounded-3xl">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>

                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">
                  {t('premium.upsell.title')}
                </h1>

                <p className="text-lg font-semibold text-purple-600 mb-2">
                  {t('premium.upsell.subtitle')}
                </p>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('premium.upsell.description')}
                </p>
              </div>

              {/* Price Section */}
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
                <motion.div
                  animate={{ x: [-100, 300] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-300" />
                    <span className="text-lg font-bold">PREMIUM</span>
                    <Star className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="text-4xl font-black mb-1">{getPriceDisplay()}</div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${f.color} rounded-lg flex items-center justify-center mb-2`}>
                      {React.cloneElement(f.icon, { className: 'w-4 h-4 text-white' })}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">{f.text}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                onClick={handlePremiumClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-3 mb-5 relative overflow-hidden"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Crown className="w-6 h-6 text-yellow-300" />
                </motion.div>
                <span>{t('premium.upsell.cta')}</span>
              </motion.button>

              <button
                onClick={onClose}
                className="w-full py-3 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition mb-4"
              >
                {t('premium.upsell.maybe_later')}
              </button>

              <div className="text-center mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  {t('premium.upsell.guarantee')}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-500">🔒 {t('limit.security.secure_payment')}</span>
                <span className="text-xs text-gray-500">⚡ {t('limit.security.instant_activation')}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PremiumUpsellModal;
