import React, { useState } from 'react';
import { X, Search, Check, Globe } from 'lucide-react';
import { LanguageOption, SUPPORTED_LANGUAGES } from '../modules/languages/languageData';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  title?: string;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  title = 'Select Language',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indianLanguages = filteredLanguages.filter((l) => l.region === 'Indian');
  const globalLanguages = filteredLanguages.filter((l) => l.region === 'Global');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[75vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedLanguage.flag} {selectedLanguage.nativeName} ({selectedLanguage.name})</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search language (e.g. Malayalam, Hindi, Arabic, Spanish)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              autoFocus
            />
          </div>
        </div>

        {/* Language List */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {/* Quick Popular Picks (when not searching) */}
          {!searchQuery && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2">
                Popular & Major Languages
              </span>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {SUPPORTED_LANGUAGES.filter((l) => l.popular).map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLanguage.code === lang.code
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <div className="text-xs font-semibold leading-tight">{lang.nativeName}</div>
                        <div className="text-[10px] text-slate-400">{lang.name}</div>
                      </div>
                    </div>
                    {selectedLanguage.code === lang.code && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Indian Languages Section */}
          {indianLanguages.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2">
                Indian Languages
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1.5">
                {indianLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLanguage.code === lang.code
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <span className="text-xs font-semibold">{lang.nativeName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">({lang.name})</span>
                      </div>
                    </div>
                    {selectedLanguage.code === lang.code && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Global / World Languages Section */}
          {globalLanguages.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 px-2">
                International & World Languages
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1.5">
                {globalLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSelectLanguage(lang);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLanguage.code === lang.code
                        ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <div>
                        <span className="text-xs font-semibold">{lang.nativeName}</span>
                        <span className="text-[11px] text-slate-400 ml-1.5">({lang.name})</span>
                        {lang.isRtl && (
                          <span className="ml-1 text-[9px] uppercase px-1 py-0.2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded">
                            RTL
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedLanguage.code === lang.code && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
