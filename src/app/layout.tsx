// src/app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Siloam Dashboard",
  description: "Warehouse Management System",
  icons: {
    icon: [{ url: "/logo-siloam.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
