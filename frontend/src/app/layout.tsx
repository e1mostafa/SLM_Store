import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';

// FIX: Google Fonts may be unavailable in restricted/offline environments.
// Use CSS system font stack via globals.css instead of next/font/google.

export const metadata: Metadata = {
  title: {
    default: 'SLM Store - Shop Everything You Love',
    template: '%s | SLM Store',
  },
  description: 'Shop millions of products from thousands of sellers. Fast delivery across Egypt.',
  keywords: ['ecommerce', 'shopping', 'egypt', 'online store', 'marketplace'],
  authors: [{ name: 'SLM Store' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://slmstore.com',
    title: 'SLM Store - Shop Everything You Love',
    description: 'Shop millions of products from thousands of sellers.',
    siteName: 'SLM Store',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SLM Store - Shop Everything You Love',
    description: 'Shop millions of products from thousands of sellers.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
