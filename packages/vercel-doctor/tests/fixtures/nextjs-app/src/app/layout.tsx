"use client";

import { useEffect, useState } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/layout-data")
      .then((response) => response.json())
      .then((json) => setData(json));
  }, []);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
};

export default Layout;
