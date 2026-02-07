"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: 'ko' | 'en') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1.5 bg-purple-50 rounded-lg px-3 py-1.5 border border-purple-100">
      <FiGlobe className="text-purple-600" size={18} />
      <select
        value={locale}
        onChange={(e) => switchLanguage(e.target.value as 'ko' | 'en')}
        className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 cursor-pointer pr-1"
      >
        <option value="ko">한국어</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
