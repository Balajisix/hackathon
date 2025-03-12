// app/layout.tsx (Client Component)
"use client";

import "./globals.css";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Example: client-side state or effect in the layout
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>My Payment App</title>
      </head>
      <body className="bg-gray-100">
        {mounted && children}
      </body>
    </html>
  );
}
