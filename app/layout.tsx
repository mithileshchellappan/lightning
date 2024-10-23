import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { PWA } from "./pwa";
import { ThemeProvider } from '../context/ThemeProvider'
import { QuestionProvider } from "../context/QuestionContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "My PWA App",
  description: "A Progressive Web App built with Next.js",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <QuestionProvider>
            <PWA />
            {children}
          </QuestionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
