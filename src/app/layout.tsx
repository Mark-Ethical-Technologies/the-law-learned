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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://fairworkhelp.app/#website",
      "url": "https://fairworkhelp.app",
      "name": "Fair Work Help",
      "description": "AI-powered legal education for Australian workers. Know your rights under the Fair Work Act 2009.",
      "publisher": { "@id": "https://fairworkhelp.app/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": { "@type": "EntryPoint", "urlTemplate": "https://fairworkhelp.app/?q={search_term_string}" },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://fairworkhelp.app/#organization",
      "name": "Fair Work Help",
      "alternateName": "Ethical Technologies Pty Ltd",
      "url": "https://fairworkhelp.app",
      "description": "Legal education platform for Australian workers. Not the Fair Work Ombudsman.",
      "areaServed": "AU",
      "knowsAbout": ["Fair Work Act 2009", "Modern Awards", "Australian employment law", "wage theft", "underpayment recovery"],
      "serviceType": "Legal Education",
      "slogan": "Know the law. Change everything."
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Am I being paid the correct award rate?",
          "acceptedAnswer": { "@type": "Answer", "text": "Upload your payslip and our AI will compare your pay against your award classification. Most workers are on the wrong level. Check for free at fairworkhelp.app." }
        },
        {
          "@type": "Question",
          "name": "What is the security guard pay rate in Australia 2025?",
          "acceptedAnswer": { "@type": "Answer", "text": "Under the Security Services Industry Award MA000016, rates range from $25.27/hr (Level 1) to $27.74/hr (Level 5) plus penalty rates for nights, weekends and public holidays. Most guards are misclassified." }
        },
        {
          "@type": "Question",
          "name": "How far back can I claim unpaid wages in Australia?",
          "acceptedAnswer": { "@type": "Answer", "text": "Under the Fair Work Act 2009, you can generally claim up to 6 years of unpaid wages. For many workers, this represents tens of thousands of dollars." }
        },
        {
          "@type": "Question",
          "name": "Is Fair Work Help the same as the Fair Work Ombudsman?",
          "acceptedAnswer": { "@type": "Answer", "text": "No. Fair Work Help is a legal education platform by Ethical Technologies Pty Ltd. The Fair Work Ombudsman (fairwork.gov.au) is the official government regulator. We help you understand and prepare — they investigate and enforce." }
        }
      ]
    }
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
