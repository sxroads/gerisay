import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Balatro from "@/components/Balatro";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kac kaldi kaldi?",
  description: "Kac kaldi?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 1080, height: 1080, flexShrink: 0, transform: "scale(calc(max(100vw, 100vh) / 1080))", transformOrigin: "center center" }}>
            <Balatro
              spinRotation={-2}
              spinSpeed={7}
              color1="#80a57e"
              color2="#5fa2ce"
              color3="#062c32"
              contrast={3.5}
              lighting={0.4}
              spinAmount={0.25}
              pixelFilter={700}
            />
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
