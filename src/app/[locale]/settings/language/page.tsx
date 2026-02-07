"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { FiGlobe, FiCheck } from "react-icons/fi";
import { motion } from "framer-motion";

export default function LanguageSettingsPage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: "ko", name: "한국어", nativeName: "한국어" },
    { code: "en", name: "English", nativeName: "English" },
  ];

  const handleLanguageChange = (newLocale: "ko" | "en") => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <FiGlobe className="text-purple-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">언어 설정</h1>
          <p className="text-sm text-gray-600">Language Settings</p>
        </div>
      </div>

      {/* Language Options */}
      <div className="space-y-3">
        {languages.map((language, index) => {
          const isActive = locale === language.code;

          return (
            <motion.button
              key={language.code}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleLanguageChange(language.code as "ko" | "en")}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-purple-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <FiGlobe
                    className={isActive ? "text-purple-600" : "text-gray-500"}
                    size={20}
                  />
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">{language.nativeName}</p>
                  <p className="text-sm text-gray-600">{language.name}</p>
                </div>
              </div>

              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center"
                >
                  <FiCheck className="text-white" size={18} />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          💡 언어를 변경하면 즉시 적용됩니다.
        </p>
        <p className="text-sm text-blue-800 mt-1">
          💡 Language changes will be applied immediately.
        </p>
      </div>
    </div>
  );
}
