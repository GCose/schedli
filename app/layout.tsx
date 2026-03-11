import "./globals.css";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Schedli",
    template: "Schedli | %s",
  },
  description:
    "Organize your repeating schedules effortlessly. Calendars manage events. Schedli manages patterns.",
  keywords: [
    "scheduling",
    "timetable",
    "pattern-based scheduling",
    "time management",
  ],
  authors: [{ name: "Goodness Adewuyi" }],
  creator: "Goodness Adewuyi",
  metadataBase: new URL("https://schedli.vercel.app"),
  openGraph: {
    title: "Schedli",
    description: "Organize your repeating schedules effortlessly.",
    url: "https://schedli.vercel.app",
    siteName: "Schedli",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Schedli",
    description: "Organize your repeating schedules effortlessly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}
