import { Inter } from "next/font/google";
import "./globals.css";
import SidebarNav from "./components/SidebarNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "MAA AAINATH GOU SEVA SAMITI BALOTRA",
  description: "WhatsApp Automation Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <div className="app-layout" style={{ display: 'flex', height: '100vh' }}>
          <SidebarNav />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
            <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}>
            &copy; 2026 All rights reserved. Developed by <span style={{ color: 'var(--accent)', fontWeight: '600' }}>mox rathore (+91 6375 324 945)</span>
          </div>
          </div>
        </div>
      </body>
    </html>
  );
}
