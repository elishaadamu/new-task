"use client";

import Header from "./layout/header/Header";
import Sidebar from "./layout/sidebar/Sidebar";
import { useAppContext } from "@/app/context/Appcontext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userData, isLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !userData) {
      router.push("/auth/login");
    }
  }, [userData, isLoading, router]);

  if (isLoading || !userData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen">
      <div className="page-wrapper flex w-full">
        {/* Header/sidebar */}
        <div className="xl:block hidden">
          <Sidebar />
        </div>
        <div className="body-wrapper w-full bg-background">
          {/* Top Header  */}
          <Header />
          {/* Body Content  */}
          <div className={`container mx-auto px-6 py-30`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
