import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Maths Game 🔮",
  description: "Predict your Maths marks and get funny roasts!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.className}>
      <head>
        <Script src="/ddo_connect/launcher.js" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
