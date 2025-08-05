import React, { createContext, useContext, useState, useEffect } from "react";

const supportedLanguages = ["en", "am"];

const LanguageContext = createContext();

export { LanguageContext };

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Supported translations
const translations = {
  en: {
    // Navigation
    home: "Home",
    properties: "Properties",
    about: "About",
    contact: "Contact",
    login: "Login",
    signup: "Sign Up",
    dashboard: "Dashboard",
    
    // Hero Section
    heroTitle: "Discover Your Perfect Home in Ethiopia",
    heroSubtitle: "Find verified properties across Addis Ababa and beyond with Ethiopia's most trusted real estate platform",
    searchPlaceholder: "Enter city or area",
    search: "Search Properties",
    
    // Property Types
    house: "Houses",
    apartment: "Apartments", 
    villa: "Villas",
    commercial: "Commercial",
    
    // Common
    featuredProperties: "Featured Properties",
    testimonials: "What Our Clients Say",
    viewAll: "View All",
    learnMore: "Learn More",
    getStarted: "Get Started",
    
    // Footer
    quickLinks: "Quick Links",
    followUs: "Follow Us",
    newsletter: "Newsletter",
    subscribe: "Subscribe",
    
    // Dashboard
    welcome: "Welcome",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout"
  },
  am: {
    // Navigation
    home: "ቤት",
    properties: "ንብረቶች",
    about: "ስለ እኛ",
    contact: "ያግኙን",
    login: "ግባ",
    signup: "ተመዝገብ",
    dashboard: "ዳሽቦርድ",
    
    // Hero Section
    heroTitle: "በኢትዮጵያ ውስጥ የእርስዎን ፍጹም ቤት ያግኙ",
    heroSubtitle: "በኢትዮጵያ በጣም የታመነ የሪል እስቴት መድረክ በአዲስ አበባ እና ከዚያ በላይ የተረጋገጡ ንብረቶችን ያግኙ",
    searchPlaceholder: "ከተማ ወይም አካባቢ ያስገቡ",
    search: "ንብረቶችን ይፈልጉ",
    
    // Property Types
    house: "ቤቶች",
    apartment: "አፓርትመንቶች",
    villa: "ቪላዎች", 
    commercial: "የንግድ",
    
    // Common
    featuredProperties: "ተመራጭ ንብረቶች",
    testimonials: "ደንበኞቻችን የሚሉት",
    viewAll: "ሁሉንም ይመልከቱ",
    learnMore: "የበለጠ ይወቁ",
    getStarted: "ይጀምሩ",
    
    // Footer
    quickLinks: "ፈጣን አገናኞች",
    followUs: "ይከተሉን",
    newsletter: "ዜና ወረቀት",
    subscribe: "ይመዝገቡ",
    
    // Dashboard
    welcome: "እንኳን ደህና መጡ",
    profile: "መገለጫ",
    settings: "ቅንብሮች",
    logout: "ውጣ"
  },
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const stored = localStorage.getItem("language");
    return supportedLanguages.includes(stored) ? stored : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", currentLanguage);
  }, [currentLanguage]);

  const switchLanguage = (lang) => {
    if (supportedLanguages.includes(lang)) {
      setCurrentLanguage(lang);
    } else {
      console.warn(`Unsupported language: ${lang}`);
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  const value = {
    currentLanguage,
    switchLanguage,
    t,
    isAmharic: currentLanguage === "am",
    isEnglish: currentLanguage === "en",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
