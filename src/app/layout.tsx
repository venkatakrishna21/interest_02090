import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Interest App",
  description: "Manage debts and customers with Supabase",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
