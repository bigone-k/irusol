"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { FiGlobe, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

export default function LanguageSettingsPage() {
  const t = useTranslations("settings.language");
  const locale = useLocale();
  const params = useParams();
  const currentLocale = (params.locale as string) || locale;
  const router = useRouter();

  const languages = [
    { code: "ko", key: "korean" },
    { code: "en", key: "english" },
  ];

  const handleLanguageChange = (newLocale: "ko" | "en") => {
    router.replace('/settings/language', { locale: newLocale });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
          <FiGlobe className="text-primary-dark" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">{t("title")}</h1>
          <p className="text-sm text-text-muted">{t("subtitle")}</p>
        </div>
      </div>

      {/* Language Options */}
      <div className="space-y-3">
        {languages.map((language, index) => {
          const isActive = currentLocale === language.code;

          return (
            <motion.button
              key={language.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLanguageChange(language.code as "ko" | "en")}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? "border-primary bg-secondary"
                  : "border bg-background-surface hover:border"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? "bg-secondary" : "bg-track"
                  }`}
                >
                  <FiGlobe
                    className={isActive ? "text-primary-dark" : "text-text-muted"}
                    size={20}
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold text-text">{t(language.key)}</p>
                  <p className="text-sm text-text-muted">{t(language.key)}</p>
                </div>
              </div>

              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-primary rounded-full flex items-center justify-center"
                >
                  <FiCheck className="text-white" size={18} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border">
        <p className="text-sm text-primary-dark">
          💡 {t("info")}
        </p>
        <p className="text-sm text-primary-dark mt-1">
          💡 {t("infoEnglish")}
        </p>
      </div>
    </div>
  );
}
