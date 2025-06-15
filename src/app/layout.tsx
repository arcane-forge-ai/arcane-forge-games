import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Arcane Forge Games',
  description: 'Explore our library of AI-generated games',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    <a href="/games" className="transition-colors duration-200">
                      Arcane Forge Games
                    </a>
                  </h1>
                </div>
                <nav className="flex items-center space-x-8">
                  <a
                    href="/games"
                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200 relative group"
                  >
                    🎮 Games
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
                  </a>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-white/60 backdrop-blur-md border-t border-white/20 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-gray-900">Arcane Forge</span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Discover incredible gaming experiences crafted by artificial intelligence.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>✨ AI-Generated Games</li>
                    <li>🚀 Instant Play</li>
                    <li>🆓 Free to Play</li>
                    <li>📱 No Downloads</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">About</h3>
                  <p className="text-sm text-gray-600">
                    Each game is uniquely created by AI, offering fresh and innovative gameplay experiences you won't find anywhere else.
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                <p className="text-gray-500 text-sm">
                  © 2024 Arcane Forge Games. Powered by AI creativity.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 