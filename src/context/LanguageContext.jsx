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
    login: "Log In",
    signup: "Sign Up",
    dashboard: "Dashboard",
    personalProfile: "Personal Profile",
    uploadPhoto: "Upload Photo",
    logout: "Log Out",
    
    // Hero & Search
    verifiedBadge: "100% Legally Verified & Inspected Properties",
    heroTitle: "Discover Verified Properties in Ethiopia with Complete Trust",
    heroSubtitle: "Ethiopia's premier PropTech platform for verified residential and commercial real estate. Every listing is physically inspected, document-checked, and escrow-secured.",
    buyTab: "Buy",
    rentTab: "Rent",
    allTypes: "All Types",
    allLocations: "All Locations",
    location: "Location",
    propertyType: "Property Type",
    priceRange: "Price Range",
    anyPrice: "Any Price",
    keywords: "Search by keyword, neighborhood, or amenities...",
    searchPropertiesBtn: "Search Properties",
    searchPlaceholder: "Search by location, property type...",
    search: "Search Properties",
    
    // Property Types
    house: "House",
    apartment: "Apartment", 
    villa: "Villa",
    commercial: "Commercial",
    land: "Land",
    
    // Stats Bar
    propertiesListed: "Properties Listed",
    happyClients: "Happy Clients",
    verifiedProperties: "Verified Properties",
    secureTransactions: "Secure Transactions",
    
    // Verification Process
    verificationProcessTitle: "Property Verification Process",
    verificationProcessSubtitle: "Every property on our platform goes through rigorous 4-tier verification",
    docVerificationTitle: "Document Verification",
    docVerificationDesc: "All property documents, title deeds, and permits are thoroughly checked with municipal records",
    physicalInspectionTitle: "Physical Inspection",
    physicalInspectionDesc: "Our certified inspectors visit and verify the actual physical condition and GPS boundaries",
    ownerVerificationTitle: "Owner Verification",
    ownerVerificationDesc: "Property owners undergo identity verification and legal ownership confirmation",
    finalApprovalTitle: "Final Approval",
    finalApprovalDesc: "Only 100% verified properties receive our trust badge and are listed on the platform",
    
    // Common
    featuredProperties: "Featured Verified Properties",
    featuredSubtitle: "Curated collection of physically inspected homes and commercial spaces",
    viewAllProperties: "View All Properties",
    testimonials: "What Our Clients Say",
    testimonialsSubtitle: "Trusted by property seekers across Addis Ababa and the Ethiopian diaspora",
    whyChooseUs: "Why Choose Ethio-Home?",
    whyChooseSubtitle: "Comprehensive features engineered specifically for the Ethiopian real estate market",
    howItWorks: "How Ethio-Home Works",
    howItWorksSubtitle: "Simple, transparent, and protected steps to find your next home",
    viewAll: "View All",
    learnMore: "Learn More",
    getStarted: "Get Started",
    noPropertiesFound: "No properties found matching your criteria",
    
    // Footer
    quickLinks: "Quick Links",
    followUs: "Follow Us",
    newsletter: "Newsletter",
    subscribe: "Subscribe",
    
    // Dashboard
    welcome: "Welcome",
    profile: "Profile",
    settings: "Settings",
  },
  am: {
    // Navigation
    home: "መነሻ",
    properties: "ንብረቶች",
    about: "ስለ እኛ",
    contact: "ያግኙን",
    login: "ይግቡ",
    signup: "ይመዝገቡ",
    dashboard: "ዳሽቦርድ",
    personalProfile: "የግል መገለጫ",
    uploadPhoto: "ፎቶ ይጫኑ",
    logout: "ይውጡ",
    
    // Hero & Search
    verifiedBadge: "100% በህግ የተረጋገጡ እና በአካል የተመረመሩ ንብረቶች",
    heroTitle: "በኢትዮጵያ ውስጥ የእርስዎን ፍጹም ቤት በአስተማማኝ ሁኔታ ያግኙ",
    heroSubtitle: "በአዲስ አበባ እና በዋና ዋና ከተሞች የተረጋገጡ ቤቶችን፣ አፓርትመንቶችን እና የንግድ ቦታዎችን በህጋዊ ሰነድ እና በአካል ምርመራ ያግኙ።",
    buyTab: "ይግዙ",
    rentTab: "ይከራዩ",
    allTypes: "ሁሉም ዓይነቶች",
    allLocations: "ሁሉም አካባቢዎች",
    location: "አካባቢ",
    propertyType: "የንብረት ዓይነት",
    priceRange: "የዋጋ ክልል",
    anyPrice: "ማንኛውም ዋጋ",
    keywords: "በቁልፍ ቃል፣ በሰፈር ወይም በመገልገያዎች ይፈልጉ...",
    searchPropertiesBtn: "ንብረቶችን ይፈልጉ",
    searchPlaceholder: "በአካባቢ ወይም በንብረት ዓይነት ይፈልጉ...",
    search: "ንብረቶችን ይፈልጉ",
    
    // Property Types
    house: "ቤቶች",
    apartment: "አፓርትመንቶች",
    villa: "ቪላዎች", 
    commercial: "የንግድ ቦታዎች",
    land: "መሬት",
    
    // Stats Bar
    propertiesListed: "የተመዘገቡ ቤቶች",
    happyClients: "ረክተው የተስተናገዱ",
    verifiedProperties: "የተረጋገጡ ንብረቶች",
    secureTransactions: "አስተማማኝ ግብይቶች",
    
    // Verification Process
    verificationProcessTitle: "የንብረት ማረጋገጫ ሂደት",
    verificationProcessSubtitle: "በመድረካችን ላይ የሚቀርብ ማንኛውም ንብረት ጥብቅ ባለ 4-ደረጃ የማጣራት ሂደት ያልፋል",
    docVerificationTitle: "የሰነድ ማረጋገጫ",
    docVerificationDesc: "የይዞታ ማረጋገጫ፣ ካርታ እና የባለቤትነት ሰነዶች ከመንግስት መዛግብት ጋር በጥልቀት ይረጋገጣሉ",
    physicalInspectionTitle: "የአካል ምርመራ",
    physicalInspectionDesc: "ባለሙያ መሐንዲሶቻችን በአካል በመገኘት የግንባታውን ጥራት እና ድንበር ይመረምራሉ",
    ownerVerificationTitle: "የባለቤትነት ማረጋገጫ",
    ownerVerificationDesc: "ትክክለኛውን ባለቤትነት ለማረጋገጥ የመታወቂያ እና የባዮሜትሪክ ማጣራት ይደረጋል",
    finalApprovalTitle: "የመጨረሻ ፈቃድ",
    finalApprovalDesc: "100% የተረጋገጡ ንብረቶች ብቻ የይሁንታ ባጅ አግኝተው በይፋ ይቀርባሉ",
    
    // Common
    featuredProperties: "ተለይተው የቀረቡ ቤቶች",
    featuredSubtitle: "በአዲስ አበባ ተመራጭ ሰፈሮች ውስጥ የሚገኙ የተሟላ ህጋዊ ሰነድ ያላቸው ቤቶች",
    viewAllProperties: "ሁሉንም ቤቶች ይመልከቱ",
    testimonials: "የደንበኞች ምስክርነት",
    testimonialsSubtitle: "በአገር ውስጥም ሆነ በውጭ የሚኖሩ ኢትዮጵያውያን ተሞክሯቸውን ያካፍላሉ",
    whyChooseUs: "ለምን ኢትዮ-ሆምን ይመርጣሉ?",
    whyChooseSubtitle: "ለኢትዮጵያ የሪል እስቴት ገበያ የተዘጋጁ ዘመናዊ፣ አስተማማኝ እና ግልጽ የቴክኖሎጂ አገልግሎቶች",
    howItWorks: "ኢትዮ-ሆም እንዴት ይሰራል?",
    howItWorksSubtitle: "በሦስት ቀላል ደረጃዎች ህልምዎን ወደ እውን ይቀይሩ",
    viewAll: "ሁሉንም ይመልከቱ",
    learnMore: "የበለጠ ይወቁ",
    getStarted: "ይጀምሩ",
    noPropertiesFound: "ምንም የተገኘ ንብረት የለም",
    
    // Footer
    quickLinks: "ፈጣን አገናኞች",
    followUs: "ይከተሉን",
    newsletter: "ዜና ወረቀት",
    subscribe: "ይመዝገቡ",
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

  const t = (key, fallback) => {
    if (translations[currentLanguage] && translations[currentLanguage][key]) {
      return translations[currentLanguage][key];
    }
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    if (fallback !== undefined && fallback !== null) {
      return fallback;
    }
    return key;
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
