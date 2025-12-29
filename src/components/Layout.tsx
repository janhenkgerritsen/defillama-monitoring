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
  heading,
  seo,
}: {
  children: React.ReactNode;
  heading: string;
  seo: SEOProps;
}) {
  const navigationItems: NavigationItem[] = [
    { label: "Dashboard", href: "/" },
    { label: "Protocols", href: "/protocols" },
  ];

  // TODO CARD STYLE, PAGE HEADING STYLE, TABLE WRAPPER FOR HORIZONTAL SCROLLING
  return (
    <>
      <SEO {...seo} />
      <div className="flex flex-col md:flex-row">
        <DesktopNavigation items={navigationItems} />
        <MobileNavigation items={navigationItems} />

        <main className="flex-1 min-w-0 p-4 ml-0 md:ml-56">
          <header className="mt-4 mb-4">
            <h1 className="text-3xl font-semibold tracking-tight text-base-content">
              {heading}
            </h1>
          </header>
          {children}
        </main>
      </div>
    </>
  );
}
