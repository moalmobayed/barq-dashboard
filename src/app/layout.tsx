import { Rubik } from "next/font/google";
import "./globals.css";

import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import NotificationHandler from "@/components/common/NotificationHandler";

// const outfit = Outfit({
//   subsets: ["latin"],
// });

// const cairo = Cairo({
//   subsets: ["latin"],
// });

const rubik = Rubik({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${rubik.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <SidebarProvider>
            <NotificationHandler />
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
