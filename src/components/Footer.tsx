
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Mail, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onAboutClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAboutClick }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="bg-gradient-to-t from-gray-50 to-transparent border-t border-gray-200/50 px-4 py-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Main Content */}
        <div className="flex flex-col items-center space-y-6">
          
          {/* Logo and Taglines */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img src="/ninna.png" alt="Ninna" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Ninna
              </span>
            </div>
            
            <p className="text-sm font-semibold text-gray-700 max-w-2xl leading-relaxed">
              {t('footer.tagline')}
            </p>
            <p className="text-xs italic text-gray-500 max-w-xl leading-relaxed">
              {t('footer.subtitle')}
            </p>
          </div>

          {/* Creator and Contact Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            
            {/* Creator */}
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">{t('footer.created_by')}</span>
              <button
                onClick={onAboutClick}
                className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300 underline decoration-purple-300 hover:decoration-purple-500"
              >
                Pablo Eduardo
              </button>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

            {/* Contact */}
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-purple-500" />
              <span className="text-gray-600">{t('footer.contact')}:</span>
              <a
                href="mailto:contact@ninna.pro"
                className="font-medium text-purple-600 hover:text-purple-700 transition-colors duration-300"
              >
                contact@ninna.pro
              </a>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

            {/* About Link */}
            <button
              onClick={onAboutClick}
              className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors duration-300"
            >
              {t('footer.about_link')}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

       

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-4 text-center">
            <p className="text-xs text-gray-400">
              {t('footer.rights', { year: currentYear })}
            </p>
          </div>

        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
