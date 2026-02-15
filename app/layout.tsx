import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SoNymous – Anonymous Student Message Wall",
  description: "A safe, anonymous space to share your thoughts. No signup, no judgment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AdminProvider>
          <Navbar />
          {children}
        </AdminProvider>
      </body>
    </html>
  );
}
