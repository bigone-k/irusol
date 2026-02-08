import type { ReactNode } from 'react';
import "./globals.css";

type Props = {
  children: ReactNode;
};

// Since we have a `[locale]` folder, this root layout only provides
// shared resources and static elements
export default function RootLayout({ children }: Props) {
  return children;
}
