import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Header from "./components/Header"

const josefinSans = Josefin_Sans({ subsets: ["latin"], weight: ["600"] });

export const metadata: Metadata = {
  title: "Spark",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={josefinSans.className}>
      <body className={josefinSans.className}>{children}
      <Header />
      </body>
    </html>
  );
}
