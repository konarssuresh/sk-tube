import { Inter } from "next/font/google";

import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "SKTube",
  description:
    "Save YouTube channels and browse their latest long-form uploads in one calm place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
