import React, { createContext, useContext, useState } from 'react';
import type { Language } from '../types';

interface Translations {
  appName: string;
  tagline: string;
  home: string;
  animals: string;
  alerts: string;
  herd: string;
  verification: string;
  modelInfo: string;
  checkTodayHeader: string;
  checkTodaySub: string;
  syntheticNotice: string;
  highRisk: string;
  needsAttention: string;
  watch: string;
  noElevatedRisk: string;
  dataNeedsChecking: string;
  checkAnimal: string;
  profile: string;
  logout: string;
  switchRole: string;
  contactVet: string;
  futureRisk: string;
  recommendedVerification: string;
  whatShouldIDo: string;
  futureMastitisRisk: string;
  riskIsRising: string;
  riskIsStable: string;
  riskIsDeclining: string;
  dataConfidence: string;
  recommendedAction: string;
  whyMUNNOKKUConcerned: string;
  whatChanged: string;
  multiSignalPattern: string;
  multiSignalExplain: string;
  demoScenario: string;
  logCMT: string;
  herdAtAGlance: string;
  commonSignalChanges: string;
  enoughRecentData: string;
  someRecentData: string;
  limitedRecentHistory: string;
  notEnoughData: string;
  nonClinicalDisclaimer: string;
}

const dictionaries: Record<Language, Translations> = {
  en: {
    appName: 'MUNNOKKU',
    tagline: 'AI Bovine Mastitis Early Risk Forecasting',
    home: 'Farmer Home',
    animals: 'Cows',
    alerts: 'Risk Alerts',
    herd: 'Herd Summary',
    verification: 'Record Check',
    modelInfo: 'Model Intelligence',
    checkTodayHeader: 'Do I need to check any animal today?',
    checkTodaySub: 'Early warning indicators detected prior to obvious clinical signs.',
    syntheticNotice: 'PROTOTYPE • SYNTHETIC DATA',
    highRisk: 'HIGH RISK',
    needsAttention: 'NEEDS ATTENTION',
    watch: 'WATCHLIST',
    noElevatedRisk: 'NO ELEVATED RISK',
    dataNeedsChecking: 'DATA NEEDS CHECKING',
    checkAnimal: 'Check Animal',
    profile: 'Profile',
    logout: 'Logout',
    switchRole: 'Switch Demo Role',
    contactVet: 'Contact Veterinarian',
    futureRisk: 'Future Risk',
    recommendedVerification: 'Recommended Verification',
    whatShouldIDo: 'What Should I Do?',
    futureMastitisRisk: 'Future Mastitis Risk',
    riskIsRising: 'Risk is rising',
    riskIsStable: 'Risk is stable',
    riskIsDeclining: 'Risk is declining',
    dataConfidence: 'Data Confidence',
    recommendedAction: 'Recommended Verification',
    whyMUNNOKKUConcerned: 'Why is MUNNOKKU Concerned?',
    whatChanged: 'What Changed Recently?',
    multiSignalPattern: 'Multiple signals are changing together',
    multiSignalExplain: 'MUNNOKKU detected several signals moving away from this animal\'s recent baseline pattern.',
    demoScenario: 'DEMO SCENARIO',
    logCMT: 'Record CMT Check',
    herdAtAGlance: 'Herd at a glance',
    commonSignalChanges: 'Common model signal changes',
    enoughRecentData: 'Enough recent data',
    someRecentData: 'Some recent data available',
    limitedRecentHistory: 'Limited recent history',
    notEnoughData: 'Not enough data for reliable forecasting',
    nonClinicalDisclaimer: 'Decision support tool based on synthetic demonstration data. Not a clinical medical diagnosis.'
  },
  ta: {
    appName: 'முன்னோக்கு',
    tagline: 'மாடுகளுக்கு மடிநோய் முன் எச்சரிக்கை அமைப்பு',
    home: 'முகப்பு',
    animals: 'மாடுகள்',
    alerts: 'எச்சரிக்கைகள்',
    herd: 'மந்தை விவரம்',
    verification: 'சோதனை பதிவு',
    modelInfo: 'மாதிரி நுட்பம்',
    checkTodayHeader: 'இன்று நான் ஏதேனும் மாட்டை பரிசோதிக்க வேண்டுமா?',
    checkTodaySub: 'அறிகுறிகள் தெரியும் முன் முன்கூட்டியே கண்டறியும் எச்சரிக்கை.',
    syntheticNotice: 'மாதிரி • செயற்கை தரவு',
    highRisk: 'அதிக அபாயம்',
    needsAttention: 'கவனம் தேவை',
    watch: 'கண்காணிப்புப் பட்டியல்',
    noElevatedRisk: 'அபாயம் இல்லை',
    dataNeedsChecking: 'தரவு சரிபார்க்கப்பட வேண்டும்',
    checkAnimal: 'விலங்கை சரிபார்க்கவும்',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    switchRole: 'டெமோ பங்கை மாற்றவும்',
    contactVet: 'கால்நடை மருத்துவரைத் தொடர்பு கொள்ளவும்',
    futureRisk: 'எதிர்கால ஆபத்து',
    recommendedVerification: 'பரிந்துரைக்கப்படும் சரிபார்ப்பு',
    whatShouldIDo: 'நான் என்ன செய்ய வேண்டும்?',
    futureMastitisRisk: 'எதிர்கால ஆபத்து',
    riskIsRising: 'அபாயம் உயர்கிறது',
    riskIsStable: 'அபாயம் சீராக உள்ளது',
    riskIsDeclining: 'அபாயம் குறைகிறது',
    dataConfidence: 'தரவு நம்பிக்கை',
    recommendedAction: 'பரிந்துரைக்கப்படும் சரிபார்ப்பு',
    whyMUNNOKKUConcerned: 'முன்னோக்கு ஏன் எச்சரிக்கிறது?',
    whatChanged: 'சமீபத்தில் என்ன மாறியது?',
    multiSignalPattern: 'பல சிக்னல்கள் ஒன்றாக மாறுகின்றன',
    multiSignalExplain: 'மாட்டின் வழக்கமான அளவிலிருந்து பல சிக்னல்கள் மாறுபடுவதை முன்னோக்கு கண்டறிந்துள்ளது.',
    demoScenario: 'டெமோ காட்சி',
    logCMT: 'CMT பரிசோதனை பதிவு',
    herdAtAGlance: 'மந்தையின் ஒரு பார்வை',
    commonSignalChanges: 'பொதுவான சிக்னல் மாற்றங்கள்',
    enoughRecentData: 'போதுமான சமீபத்திய தரவு உள்ளது',
    someRecentData: 'சில சமீபத்திய தரவு உள்ளது',
    limitedRecentHistory: 'குறைந்த வரலாற்றுத் தரவு',
    notEnoughData: 'முன்னறிவிப்புக்கு போதுமான தரவு இல்லை',
    nonClinicalDisclaimer: 'செயற்கை தரவு அடிப்படையிலான முடிவெடுக்கும் உதவி கருவி. இது மருத்துவ சிகிச்சை அல்ல.'
  },
  hi: {
    appName: 'मुन्नोक्कू',
    tagline: 'पशु मस्टाइटिस थनैल रोग पूर्व चेतावनी प्रणाली',
    home: 'होम',
    animals: 'पशु सूची',
    alerts: 'जोखिम अलर्ट',
    herd: 'झुंड सारांश',
    verification: 'जाँच दर्ज करें',
    modelInfo: 'मॉडल जानकारी',
    checkTodayHeader: 'क्या मुझे आज किसी पशु की जांच करने की आवश्यकता है?',
    checkTodaySub: 'लक्षण दिखने से पहले प्रारंभिक जोखिम पूर्व चेतावनी।',
    syntheticNotice: 'प्रारूप • काल्पनिक डेटा',
    highRisk: 'ध्यान देने की आवश्यकता',
    needsAttention: 'ध्यान दें',
    watch: 'निगरानी सूची',
    noElevatedRisk: 'कोई जोखिम नहीं',
    dataNeedsChecking: 'डेटा जांच आवश्यक',
    checkAnimal: 'पशु की जाँच करें',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉग आउट',
    switchRole: 'डेमो भूमिका बदलें',
    contactVet: 'पशु चिकित्सक से संपर्क करें',
    futureRisk: 'भविष्य का जोखिम',
    recommendedVerification: 'अनुशंसित सत्यापन',
    whatShouldIDo: 'मुझे क्या करना चाहिए?',
    futureMastitisRisk: 'भविष्य का जोखिम',
    riskIsRising: 'जोखिम बढ़ रहा है',
    riskIsStable: 'जोखिम स्थिर है',
    riskIsDeclining: 'जोखिम घट रहा है',
    dataConfidence: 'डेटा विश्वसनीयता',
    recommendedAction: 'अनुशंसित सत्यापन',
    whyMUNNOKKUConcerned: 'मुन्नोक्कू चिंतित क्यों है?',
    whatChanged: 'हाल ही में क्या बदला?',
    multiSignalPattern: 'एक साथ कई संकेत बदल रहे हैं',
    multiSignalExplain: 'मुन्नोक्कू ने इस पशु के सामान्य पैटर्न से कई संकेतों को बदलते देखा है।',
    demoScenario: 'डेमो परिदृश्य',
    logCMT: 'CMT जांच दर्ज करें',
    herdAtAGlance: 'झुंड की एक झलक',
    commonSignalChanges: 'सामान्य मॉडल संकेत परिवर्तन',
    enoughRecentData: 'पर्याप्त हालिया डेटा',
    someRecentData: 'कुछ डेटा उपलब्ध',
    limitedRecentHistory: 'सीमित हालिया इतिहास',
    notEnoughData: 'विश्वसनीय पूर्वानुमान के लिए पर्याप्त डेटा नहीं',
    nonClinicalDisclaimer: 'काल्पनिक डेटा पर आधारित निर्णय सहायता प्रणाली। यह चिकित्सा निदान नहीं है।'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: dictionaries[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
