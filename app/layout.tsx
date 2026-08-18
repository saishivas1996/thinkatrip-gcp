import './globals.css';
import Script from 'next/script';
import Image from 'next/image';

export const metadata = {
  title: 'thinkatrip | road to heaven',
  description: 'Your ultimate travel and flight booking platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        
        {/* Travelpayouts Monetization Script */}
        <Script 
          id="travelpayouts-monetization" 
          strategy="afterInteractive" 
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                  var script = document.createElement("script");
                  script.async = 1;
                  script.setAttribute("data-cmp-ab","2");
                  script.src = 'https://emrldtp.cc/NTYzMTY1.js?t=563165';
                  document.head.appendChild(script);
              })();
            `
          }} 
        />

        {/* Global Navigation Header */}
        <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
          <div className="flex items-center gap-4">
            {/* Increased Logo Size */}
            <Image 
              src="/logo.png" 
              alt="thinkatrip logo" 
              width={80} 
              height={80} 
              className="object-contain"
            />
            
            {/* Brand Name & Caption */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-tight text-blue-900">
                thinkatrip
              </h1>
              <p className="text-sm font-medium italic text-gray-500">
                road to heaven
              </p>
            </div>
          </div>
        </header>

        {/* This renders your page.tsx content below the header */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}
