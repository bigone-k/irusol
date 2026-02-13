import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import TopAppBar from '@/components/TopAppBar';
import BottomNavigation from '@/components/BottomNavigation';
import ToastContainer from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: "DoTo - Goal Mate",
  description: "RPG-style habit tracking app",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <div className="flex flex-col min-h-screen">
            {/* Top App Bar - sticky */}
            <TopAppBar
              title="DoTo"
              showMenu={true}
              showSearch={true}
              showAdd={false}
            />

            {/* Main Content - scrollable */}
            <main className="flex-1 overflow-y-auto bg-gradient-to-b from-purple-50 to-blue-50">
              <div className="max-w-md mx-auto pb-20">
                {children}
              </div>
            </main>

            {/* Bottom Navigation - fixed */}
            <BottomNavigation />

            {/* Toast Notifications */}
            <ToastContainer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
