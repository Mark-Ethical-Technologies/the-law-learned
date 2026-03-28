import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fair Work Help | Know Your Rights. Get What You're Owed.",
  description:
    "Upload your payslip. We analyse your award level and show you exactly what you should be earning. Free for all Australian workers. Security guards, nurses, retail, hospitality, NDIS, aged care.",
  keywords: [
    "fair work help",
    "underpaid australia",
    "wage theft",
    "security guard pay",
    "award rates australia",
    "underpayment claim",
    "fair work ombudsman help",
    "payslip analysis",
    "ন্যায্য কাজের সাহায্য",
    "공정한 직장 도움",
    "公平工作帮助",
    "निष्पक्ष काम मदद",
    "நியாயமான வேலை உதவி",
    "tulong sa trabaho",
    "công việc công bằng giúp đỡ",
  ],
  openGraph: {
    title: "Fair Work Help — Are you being paid what you're owed?",
    description:
      "Free payslip analysis for Australian workers. Upload your payslip and find out if your employer is paying you the right award level.",
    url: "https://fairworkhelp.app",
    siteName: "Fair Work Help",
    locale: "en_AU",
    type: "website",
  },
  alternates: {
    canonical: "https://fairworkhelp.app",
    languages: {
      "en-AU": "https://fairworkhelp.app",
      bn: "https://fairworkhelp.app/bn",
      ne: "https://fairworkhelp.app/ne",
      hi: "https://fairworkhelp.app/hi",
      ta: "https://fairworkhelp.app/ta",
      "zh-Hans": "https://fairworkhelp.app/zh",
      vi: "https://fairworkhelp.app/vi",
      tl: "https://fairworkhelp.app/tl",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="alternate" hrefLang="en-AU" href="https://fairworkhelp.app" />
        <link rel="alternate" hrefLang="bn" href="https://fairworkhelp.app/bn" />
        <link rel="alternate" hrefLang="ne" href="https://fairworkhelp.app/ne" />
        <link rel="alternate" hrefLang="hi" href="https://fairworkhelp.app/hi" />
        <link rel="alternate" hrefLang="ta" href="https://fairworkhelp.app/ta" />
        <link rel="alternate" hrefLang="zh-Hans" href="https://fairworkhelp.app/zh" />
        <link rel="alternate" hrefLang="vi" href="https://fairworkhelp.app/vi" />
        <link rel="alternate" hrefLang="tl" href="https://fairworkhelp.app/tl" />
        <link rel="alternate" hrefLang="x-default" href="https://fairworkhelp.app" />
        <meta name="geo.region" content="AU" />
        <meta name="geo.placename" content="Australia" />
      </head>
      <body>{children}</body>
    </html>
  );
}
