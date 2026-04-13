import React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const LanguageSelection: React.FC = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const chooseLanguage = async (nextLanguage: "en" | "ta") => {
    await setLanguage(nextLanguage);
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 px-0 sm:px-4 lg:px-6 flex flex-col items-center justify-center">
      <div className="mobile-container bg-soft-gradient shadow-2xl overflow-hidden flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-12">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.16, 1], x: [0, 24, 0], y: [0, -18, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 -left-28 w-[420px] h-[420px] bg-deep-purple/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, -28, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-32 -right-24 w-[420px] h-[420px] bg-ocean-blue/10 rounded-full blur-[120px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto w-full max-w-lg space-y-8"
        >
          <header className="space-y-4 text-center">
            <div className="mx-auto flex w-full justify-center">
              <div className="rounded-[32px] bg-white/55 p-3 shadow-2xl shadow-deep-purple/15 backdrop-blur-xl border border-white/60">
                <img
                  src="/images/yogshala-logo.png"
                  alt="YOGSHALA"
                  className="h-20 w-auto max-w-[min(60vw,15rem)] object-contain sm:h-24 md:h-28"
                />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {language === "ta" ? "மொழியை தேர்வு செய்யுங்கள்" : "Choose Your Language"}
              </h1>
              <p className="text-body text-gray-500">
                {language === "ta"
                  ? "உள்நுழைவதற்கு முன் பயன்பாட்டின் மொழியை அமைக்கவும்."
                  : "Set the app language before you continue to login."}
              </p>
            </div>
          </header>

          <div className="space-y-4">
            <button
              onClick={() => void chooseLanguage("en")}
              className={`w-full rounded-[28px] border px-6 py-5 text-left transition-all ${
                language === "en"
                  ? "bg-deep-purple text-white border-deep-purple shadow-xl shadow-deep-purple/20"
                  : "glass-card bg-white/50 border-white/60 text-gray-800"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-bold">English</div>
                  <div className={`text-sm ${language === "en" ? "text-white/80" : "text-gray-500"}`}>
                    Continue in English
                  </div>
                </div>
                <div className={`text-xs font-bold uppercase tracking-[0.24em] ${language === "en" ? "text-white/80" : "text-gray-400"}`}>
                  EN
                </div>
              </div>
            </button>

            <button
              onClick={() => void chooseLanguage("ta")}
              className={`w-full rounded-[28px] border px-6 py-5 text-left transition-all ${
                language === "ta"
                  ? "bg-deep-purple text-white border-deep-purple shadow-xl shadow-deep-purple/20"
                  : "glass-card bg-white/50 border-white/60 text-gray-800"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-bold">தமிழ்</div>
                  <div className={`text-sm ${language === "ta" ? "text-white/80" : "text-gray-500"}`}>
                    தமிழில் தொடரவும்
                  </div>
                </div>
                <div className={`text-xs font-bold uppercase tracking-[0.24em] ${language === "ta" ? "text-white/80" : "text-gray-400"}`}>
                  TA
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => navigate("/auth")}
            className="w-full rounded-[28px] bg-gray-900 text-white px-6 py-5 font-bold shadow-xl flex items-center justify-center gap-3"
          >
            <span>{language === "ta" ? "உள்நுழைவுக்கு தொடரவும்" : "Continue to Login"}</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LanguageSelection;
