import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Heart, Sparkles, Instagram, Mail, Star, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutPageProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Header fixo */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-4 shadow-sm"
          >
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <motion.button
                onClick={onClose}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">{t('about.back_to_app')}</span>
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                  <img src="/ninnabg.png" alt="Ninna" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Ninna
                </span>
              </div>
            </div>
          </motion.div>

          {/* Conteúdo com scroll livre */}
          <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              
              {/* Hero Section */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <div className="flex items-center justify-center gap-6 mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center"
                  >
                    <img src="/ninnabg.png" alt="Ninna" className="w-12 h-12 object-contain" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center"
                  >
                    <Heart className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                
                <motion.h1
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight"
                >
                  <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                    {t('about.title')}
                  </span>
                </motion.h1>
                
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="flex items-center justify-center gap-2 text-gray-500"
                >
                  <Star className="w-4 h-4" />
                  <Star className="w-5 h-5" />
                  <Star className="w-4 h-4" />
                </motion.div>
              </motion.div>

              {/* Story Sections */}
              <div className="space-y-12">
                
                {/* Vision Section */}
                <motion.section
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 rounded-3xl -z-10 opacity-50" />
                  
                  <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                        {t('about.intro_title')}
                      </h2>
                    </div>
                    
                    <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                      <p>{t('about.intro_text')}</p>
                      <p className="text-xl font-medium text-gray-900 pl-6 border-l-4 border-purple-200 bg-purple-50/50 py-4">
                        {t('about.vision_text')}
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Purpose Section */}
                <motion.section
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="relative"
                >
                
                  <div className="absolute -inset-4 bg-gradient-to-r from-pink-100 via-purple-50 to-pink-100 rounded-3xl -z-10 opacity-50" />
                  
                  <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Zap className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                        {t('about.purpose_mission_title')}
                      </h2>
                    </div>
                    
                    <div className="space-y-8">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {t('about.purpose_text')}
                      </p>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-200">
                        <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 leading-relaxed">
                          {t('about.mission_text')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Creator Section */}
                <motion.section
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="relative overflow-hidden"
                >
                  {/* Background com gradiente escuro */}
                  <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-2xl p-8 lg:p-12 relative">
                    
                    {/* Efeitos de fundo */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-2xl">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                          opacity: [0.1, 0.2, 0.1]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
                      />
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          rotate: [360, 180, 0],
                          opacity: [0.1, 0.15, 0.1]
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute -bottom-1/2 -left-1/2 w-80 h-80 bg-pink-500 rounded-full blur-3xl"
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                          className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center"
                        >
                          <Sparkles className="w-7 h-7 text-white" />
                        </motion.div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white">
                          {t('about.creator_title')}
                        </h2>
                      </div>
                      
                      <div className="space-y-8 text-lg">
                        <p className="text-gray-200 leading-relaxed">
                          {t('about.creator_intro')}
                        </p>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                          <p className="text-white leading-relaxed font-medium">
                            {t('about.creator_message')}
                          </p>
                        </div>

                        {/* Contact Section */}
                        <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/30">
                          <h3 className="text-2xl font-bold mb-6 text-yellow-300 flex items-center gap-3">
                            <Star className="w-6 h-6" />
                            {t('about.connect_title')}
                          </h3>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            <motion.a
                              href="https://www.instagram.com/pabeduardo"
                              target="_blank"
                              rel="noopener noreferrer"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-xl font-medium hover:shadow-xl transition-all duration-300"
                            >
                              <Instagram className="w-6 h-6" />
                              <div className="flex-1">
                                <div className="text-sm opacity-90">{t('about.instagram')}</div>
                                <div className="font-bold">@pabeduardo</div>
                              </div>
                              <ExternalLink className="w-5 h-5" />
                            </motion.a>
                            
                            <motion.a
                              href="mailto:contact@ninna.pro"
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl font-medium hover:shadow-xl transition-all duration-300"
                            >
                              <Mail className="w-6 h-6" />
                              <div className="flex-1">
                                <div className="text-sm opacity-90">{t('about.email')}</div>
                                <div className="font-bold">contact@ninna.pro</div>
                              </div>
                            </motion.a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>

              </div>

              {/* Bottom spacing para garantir scroll completo */}
              <div className="h-24" />
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AboutPage;
