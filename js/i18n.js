/* =============================================
   PixelForge - Internationalization Module
   ============================================= */

const I18n = (() => {
  const STORAGE_KEY = 'pixelforge_lang';
  const DEFAULT_LANG = 'en';

  let currentLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  let translations = {};
  let loadedLanguages = {};
  let callbacks = [];

  const supportedLanguages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ar', name: 'Arabic', native: 'العربية', rtl: true },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'es', name: 'Spanish', native: 'Español' },
    { code: 'de', name: 'German', native: 'Deutsch' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ja', name: 'Japanese', native: '日本語' },
    { code: 'pt', name: 'Portuguese', native: 'Português' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'ko', name: 'Korean', native: '한국어' },
  ];

  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object' && part in acc) return acc[part];
      return undefined;
    }, obj);
  }

  function translate(key, fallback) {
    // Try current language first
    let val = getNestedValue(translations, key);
    // Fall back to English
    if (val === undefined && currentLang !== 'en') {
      val = getNestedValue(loadedLanguages['en'] || {}, key);
    }
    return val !== undefined ? val : (fallback || key);
  }

  function t(key, fallback) {
    return translate(key, fallback);
  }

  async function loadLanguage(lang) {
    if (loadedLanguages[lang]) return loadedLanguages[lang];
    try {
      const resp = await fetch(`locales/${lang}.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      loadedLanguages[lang] = data;
      return data;
    } catch (e) {
      console.warn(`Failed to load locale: ${lang}`, e);
      // Create empty cache so we don't retry
      loadedLanguages[lang] = {};
      return {};
    }
  }

  async function setLanguage(lang) {
    if (lang === currentLang && loadedLanguages[lang]) {
      applyLanguage();
      return;
    }

    if (!supportedLanguages.some(l => l.code === lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    translations = await loadLanguage(lang);
    // Also ensure English is loaded as fallback
    if (lang !== 'en') await loadLanguage('en');

    applyLanguage();
    callbacks.forEach(cb => cb(lang));
  }

  function applyLanguage() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translated = translate(key);

      if (translated !== key) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translated;
        } else {
          el.textContent = translated;
        }
      }
    });

    // Set direction for RTL languages
    const langMeta = supportedLanguages.find(l => l.code === currentLang);
    if (langMeta && langMeta.rtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = currentLang;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = currentLang;
    }

    // Sync select elements
    document.querySelectorAll('select[id$="LangSelect"], select[id="settingsLangSelect"]').forEach(sel => {
      sel.value = currentLang;
    });
  }

  async function init() {
    await loadLanguage(DEFAULT_LANG);
    if (currentLang !== DEFAULT_LANG) {
      await loadLanguage(currentLang);
    }
    translations = loadedLanguages[currentLang] || loadedLanguages[DEFAULT_LANG] || {};
    applyLanguage();
  }

  function onChange(cb) {
    callbacks.push(cb);
  }

  function getCurrentLang() { return currentLang; }
  function getSupportedLanguages() { return supportedLanguages; }

  return { init, setLanguage, t, translate, getCurrentLang, getSupportedLanguages, onChange };
})();
