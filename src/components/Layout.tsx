import React from "react";
import DesktopNavigation from "./navigation/DesktopNavigation";
import MobileNavigation from "./navigation/MobileNavigation";
import SEO, { SEOProps } from "./SEO";

export type NavigationItem = {
  label: string;
  href: string;
};

export default function Layout({
  children,
  seo,
}: {
  children: React.ReactNode;
  seo: SEOProps;
}) {
  const navigationItems: NavigationItem[] = [
    { label: "Dashboard", href: "/" },
    { label: "Protocols", href: "/protocols" },
  ];

  return (
    <>
      <SEO {...seo} />
      <div className="flex flex-col md:flex-row h-screen">
        <DesktopNavigation items={navigationItems} />
        <MobileNavigation items={navigationItems} />

        <main className="flex-1 p-4">{children}</main>
      </div>
    </>
  );
}
