
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LogOut, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Child } from '../types';

interface HeaderProps {
  child: Child | null;
  onBackToSelector?: () => void;
  onLogout?: () => void;
  hasMultipleChildren?: boolean;
}

const Header: React.FC<HeaderProps> = ({ child, onBackToSelector, onLogout, hasMultipleChildren = false }) => {
  const { t } = useTranslation();
  
  if (!child) return null;

  const colorScheme = child.gender === 'female' ? 'pink' : 'blue';
  const textClass = colorScheme === 'pink'
    ? 'from-pink-600 to-rose-500'
    : 'from-blue-600 to-cyan-500';

  const getChildTitle = () => {
    return child.gender === 'female' ? t('header.your_daughter') : t('header.your_son');
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 shadow-sm"
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Botão de trocar/criar filho */}
          <motion.button
            onClick={onBackToSelector}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={t('header.switch_child')}
          >
            <Users className="w-5 h-5 text-gray-600" />
          </motion.button>

          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/ninnabg.png" alt="Ninna" className="w-full h-full object-contain" />
          </div>
          
          <div>
            <h1 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${textClass}`}>
              {child.name}
            </h1>
            <p className="text-xs text-gray-500">
              {child.age} {t('children.years_old')} • {getChildTitle()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Sparkles className={`w-5 h-5 ${colorScheme === 'pink' ? 'text-pink-500' : 'text-blue-500'}`} />
          </motion.button>

          <motion.button
            onClick={onLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
