import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  translation: {
    // Header
    "sys_status_opt": "System Operational",
    "register": "Register Complaint",
    "track": "Track Complaint",
    "dashboard": "Dashboard",
    "login": "Login",
    "reviews": "Reviews",
    "admin_login": "Admin Login",
    "logout": "Logout",

    // Home Hero
    "quote": "Water is life, conserve it for tomorrow.",
    "quote_hi": "जल ही जीवन है",
    "hero_title": "Report Water Issues. Get Faster Solutions.",
    "hero_subtitle": "A public service portal to submit, track, and resolve water-related problems efficiently.",
    "hero_btn_report": "Report Issue Now",
    "hero_btn_track": "Track with 6-digit ID",

    // Stats Section
    "stats_total": "Total Complaints",
    "stats_resolved": "Resolved",
    "stats_progress": "In Progress",
    "stats_pending": "Pending",
    "stats_title": "Platform Impact",

    // Registration
    "reg_title": "Register a new Water Complaint",
    "reg_label_type": "Issue Type",
    "reg_label_desc": "Description",
    "reg_label_img": "Upload Image",
    "reg_label_pin": "Indian Pincode",
    "reg_label_loc": "Auto-filled Location",
    "reg_btn_submit": "Submit Complaint",

    // Tracking
    "track_title": "Track Your Complaint",
    "track_subtitle": "Enter your 6-digit tracking ID to see the real-time status of your report.",
    "track_input_placeholder": "Tracking ID (e.g. 739421)",
    "trk_title": "Track Existing Complaint",
    "trk_placeholder": "Enter 6-digit ID (e.g. 739421)",
    "trk_btn": "Check Status",

    // Gallery
    "gallery_title": "Public Complaint Gallery",

    // Footer
    "footer_text": "© 2026 Water Complaint & Alert Management System. For public awareness."
  }
};

// Hindi translations
const hi = {
  translation: {
    // Header
    "sys_status_opt": "सिस्टम चालू है",
    "register": "शिकायत दर्ज करें",
    "track": "शिकायत ट्रैक करें",
    "dashboard": "डैशबोर्ड",
    "login": "लॉग इन",
    "reviews": "समीक्षाएं",
    "admin_login": "प्रशासक लॉगिन",
    "logout": "लॉग आउट",

    // Home Hero
    "quote": "जल ही जीवन है, कल के लिए इसे बचाएं।",
    "quote_hi": "जल ही जीवन है",
    "hero_title": "पानी की समस्या रिपोर्ट करें। तेज़ समाधान पाएं।",
    "hero_subtitle": "पानी से संबंधित समस्याओं को ऑनलाइन दर्ज करने और ट्रैक करने का सार्वजनिक पोर्टल।",
    "hero_btn_report": "अब समस्या दर्ज करें",
    "hero_btn_track": "6-अंकीय ID से ट्रैक करें",

    // Stats Section
    "stats_total": "कुल शिकायतें",
    "stats_resolved": "समस्याएं हल हुईं",
    "stats_progress": "प्रगति पर",
    "stats_pending": "लंबित",
    "stats_title": "प्लेटफ़ॉर्म प्रभाव",

    // Registration
    "reg_title": "नई पानी शिकायत दर्ज करें",
    "reg_label_type": "समस्या का प्रकार",
    "reg_label_desc": "विवरण",
    "reg_label_img": "फोटो अपलोड करें",
    "reg_label_pin": "पिनकोड",
    "reg_label_loc": "स्वचालित स्थान",
    "reg_btn_submit": "शिकायत जमा करें",

    // Tracking
    "track_title": "अपनी शिकायत ट्रैक करें",
    "track_subtitle": "अपनी रिपोर्ट की रीयल-टाइम स्थिति देखने के लिए अपनी 6-अंकीय ट्रैकिंग आईडी दर्ज करें।",
    "track_input_placeholder": "ट्रैकिंग आईडी (जैसे 739421)",
    "trk_title": "मौजूदा शिकायत ट्रैक करें",
    "trk_placeholder": "6-अंकीय ID दर्ज करें (जैसे 739421)",
    "trk_btn": "स्थिति जांचें",

    // Gallery
    "gallery_title": "सार्वजनिक शिकायत गैलरी",

    // Footer
    "footer_text": "© 2026 जल शिकायत एवं अलर्ट प्रबंधन प्रणाली। जन जागरूकता के लिए।"
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      hi
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
