import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'AlagaLink - La Trinidad PWD/CWD Information System',
  description: 'Empowering Persons with Disabilities and Children with Special Needs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
