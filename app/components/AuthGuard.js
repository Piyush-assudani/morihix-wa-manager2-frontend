"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // We don't want to run the check on the login page itself
    if (pathname === "/login") {
      setIsAuthorized(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Don't render children until we've verified auth status
  // For login page, we always render immediately
  if (!isAuthorized && pathname !== "/login") {
    return null; 
  }

  return <>{children}</>;
}
