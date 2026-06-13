import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MimoTTS Studio",
  description: "TTS & ASR powered by Mimo Provider",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
