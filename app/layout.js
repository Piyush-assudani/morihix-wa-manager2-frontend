import { Inter } from "next/font/google";
import "./globals.css";
import SidebarNav from "./components/SidebarNav";
import AuthGuard from "./components/AuthGuard";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "MAA AAINATH GOU SEVA SAMITI BALOTRA",
  description: "WhatsApp Automation Dashboard",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} style={{ height: '100%', overflow: 'hidden' }}>
      <body style={{ margin: 0, height: '100%', overflow: 'hidden' }}>
        <div className="app-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          <SidebarNav />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <AuthGuard>
                {children}
              </AuthGuard>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '8px 20px', 
              fontSize: '11px', 
              color: 'var(--text-muted)', 
              borderTop: '1px solid var(--border-color)', 
              background: 'var(--bg-primary)', 
              flexShrink: 0 
            }}>
              <div style={{ flex: 1 }}></div>
              <div style={{ textAlign: 'center', flex: 3 }}>
                &copy; 2026 All rights reserved. Developed by <span style={{ color: 'var(--accent)', fontWeight: '600' }}>mox rathore (+91 6375 324 945)</span>
              </div>
              <div style={{ flex: 1 }}></div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
