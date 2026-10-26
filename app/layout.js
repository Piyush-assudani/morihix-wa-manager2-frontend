import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SidebarNav from "./components/SidebarNav";
import AuthGuard from "./components/AuthGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata = {
  title: "WhatsPulse | Enterprise WhatsApp Automation & CRM",
  description: "Enterprise WhatsApp marketing, broadcast campaigns, real-time live chat, and customer CRM powered by official Meta Cloud API.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

import AppFooter from "./components/AppFooter";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`} style={{ height: "100%", overflow: "hidden" }}>
      <body style={{ margin: 0, height: "100%", overflow: "hidden" }}>
        <div className="app-layout" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <SidebarNav />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <AuthGuard>
                {children}
              </AuthGuard>
            </div>
            <AppFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
