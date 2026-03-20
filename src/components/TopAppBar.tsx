"use client";

import { useState, useRef, useEffect } from "react";
import { FiMenu, FiSearch, FiPlus, FiChevronLeft, FiLogOut, FiLink } from "react-icons/fi";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";

interface TopAppBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
  showMenu?: boolean;
  showAdd?: boolean;
  onAdd?: () => void;
}

export default function TopAppBar({
  title,
  showBack = false,
  onBack,
  showSearch = false,
  showMenu = false,
  showAdd = false,
  onAdd,
}: TopAppBarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const t = useTranslations();
  const locale = useLocale();

  const { nickname: authNickname, isAuthenticated, isAnonymous, signOut } = useAuthStore();
  const displayName = isAnonymous ? t('sidebar.guest') : authNickname;

  const handleLinkGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?locale=${locale}&linking=true`,
      },
    });
  };

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-app-bar bg-background-surface/95 backdrop-blur-md border-b border ">
        <div className="max-w-md mx-auto h-14 px-4 flex items-center justify-between relative">
          {/* Left Section */}
          <div className="flex items-center">
            {showBack && onBack && (
              <motion.button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center text-text hover:bg-primary/20 rounded-xl transition-colors"
                aria-label="Go back"
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiChevronLeft size={24} strokeWidth={2.5} />
              </motion.button>
            )}
            {showMenu && !showBack && (
              <motion.button
                onClick={() => setIsSidebarOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-text hover:bg-primary/20 rounded-xl transition-colors"
                aria-label="Menu"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiMenu size={20} strokeWidth={2.5} />
              </motion.button>
            )}
          </div>

        {/* Center Section - Title (absolute center) */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-black text-text truncate pointer-events-none">
          {title}
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {displayName && (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                aria-label="Profile menu"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isAnonymous ? 'bg-text-muted' : 'bg-primary'}`}>
                  <span className="text-sm font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-semibold text-text hidden sm:block max-w-20 truncate">
                  {displayName}
                </span>
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-background-surface border border-border rounded-xl shadow-lg overflow-hidden z-modal"
                  >
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-semibold text-text truncate">{displayName}</p>
                    </div>
                    {isAnonymous && (
                      <>
                        <p className="px-3 py-2 text-xs text-text-muted">
                          {t('sidebar.guestHint')}
                        </p>
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            handleLinkGoogle();
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-primary-dark hover:bg-primary/10 transition-colors"
                        >
                          <FiLink size={16} />
                          {t('sidebar.linkGoogle')}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-accent hover:bg-accent/10 transition-colors"
                    >
                      <FiLogOut size={16} />
                      {t('sidebar.logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Sidebar */}
    <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
