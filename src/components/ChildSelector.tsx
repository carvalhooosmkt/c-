import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Heart, LogOut, Sparkles, Crown, Zap, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Child } from '../types';
import PremiumUpsellModal from './PremiumUpsellModal';

interface ChildSelectorProps {
  children: Child[];
  onSelectChild: (child: Child) => void;
  onCreateNew: () => void;
  onLogout: () => void;
  user?: any;
  loadingUser?: boolean;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({
  children,
  onSelectChild,
  onCreateNew,
  onLogout,
  user,
  loadingUser = false
}) => {
  const { t, i18n } = useTranslation();
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false);

  const getChildGradient = (gender: 'male' | 'female') =>
    gender === 'female' ? 'from-pink-500 to-rose-500' : 'from-blue-500 to-cyan-500';

  const getChildBg = (gender: 'male' | 'female') =>
    gender === 'female' ? 'from-pink-50 to-rose-50' : 'from-blue-50 to-cyan-50';

  const handlePremiumClick = () => {
    const userId = getUserId();
    const isPtBR = i18n.language === 'pt-BR';
    const userEmail = user?.email;

    let premiumUrl = isPtBR
      ? 'https://pay.kiwify.com.br/Xpj0Ymu'
      : 'https://buy.stripe.com/bJeeVd2R3arEbZh2jZb7y00';

    // 🔗 Adiciona parâmetros para tracking (mantém igual à Kiwify e compatível com Stripe)
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

  const getPriceDisplay = () =>
    i18n.language === 'pt-BR' ? 'R$ 29/mês' : 'US$29/month';

  const showPriceExplanation = () => false; // 🧹 removido "(R$159,50)" e explicação

  const isPremium = () => {
    if (!user) return false;
    if (user.is_premium && user.premium_expires_at) {
      const expiresAt = new Date(user.premium_expires_at);
      return expiresAt > new Date();
    }
    return false;
  };

  const handleCreateNewChild = () => {
    if (!isPremium() && children.length >= 1) {
      setShowPremiumUpsell(true);
    } else {
      onCreateNew();
    }
  };

  const premiumBanner = (
    <motion.div
      key="premiumBanner"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-6 rounded-3xl shadow-2xl text-white relative overflow-hidden"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/5 rounded-full blur-2xl"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <Crown className="w-6 h-6 text-yellow-300" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold">{t('premium.cta_title')}</h2>
              <p className="text-white/80 text-sm">{t('premium.cta_subtitle')}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-300">{getPriceDisplay()}</div>
          </div>
        </div>

        <div className="mb-4 text-sm text-white/90">
          <p className="mb-2">{t('premium.features_preview')}</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-300" />
              {t('premium.free_limit_11')}
            </span>
          </div>
        </div>

        <motion.button
          onClick={handlePremiumClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Crown className="w-5 h-5 text-yellow-300" />
          {t('premium.cta_button')}
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-1"
          >
            ✨
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 flex flex-col p-6 animate-pulse">
        <div className="flex justify-between items-center mb-8 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div>
              <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        </div>

        <div className="h-28 w-full bg-gray-100 rounded-3xl mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl" />
          ))}
          <div className="h-36 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 flex flex-col p-4">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center mb-6 pt-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/ninna.png" alt="Ninna" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('children.select')}</h1>
            <p className="text-gray-600 text-sm mt-1">{t('children.choose_child')}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </motion.div>

      <AnimatePresence>{!isPremium() && premiumBanner}</AnimatePresence>

      <div
        className={`flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full ${
          isPremium() ? 'mt-4' : ''
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
          {children.map((child, index) => (
            <motion.button
              key={child.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              onClick={() => onSelectChild(child)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative bg-gradient-to-br ${getChildBg(
                child.gender
              )} p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl transition-all duration-300 text-left group overflow-hidden`}
            >
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute top-3 right-3 opacity-60"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
              </motion.div>

              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${getChildGradient(
                    child.gender
                  )} rounded-xl flex items-center justify-center shadow-md group-hover:animate-pulse`}
                >
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{child.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {child.age} {t('children.years_old')} •{' '}
                    {child.gender === 'female' ? t('children.daughter') : t('children.son')}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {child.total_conversations} {t('children.conversations')}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: children.length * 0.1 + 0.3 }}
            onClick={handleCreateNewChild}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-lg border-2 border-dashed border-gray-300 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 text-center group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:animate-bounce">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">{t('children.create_new')}</h3>
            <p className="text-sm text-gray-500">{t('children.add_child')}</p>

            {!isPremium() && children.length >= 1 && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                <Crown className="w-3 h-3 inline mr-1" />
                PREMIUM
              </div>
            )}
          </motion.button>
        </div>
      </div>

      <PremiumUpsellModal
        isOpen={showPremiumUpsell}
        onClose={() => setShowPremiumUpsell(false)}
      />
    </div>
  );
};

export default ChildSelector;
