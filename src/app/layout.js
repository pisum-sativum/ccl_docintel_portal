import { Inter_Tight } from 'next/font/google';
import "./globals.css";
import ClientShell from "./ClientShell";

const interTight = Inter_Tight({ subsets: ['latin'] });

export const metadata = {
  title: "CCL DocIntel",
  description: "Intelligent document compliance system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${interTight.className} antialiased selection:bg-[#85BDA6]/30`}>
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}