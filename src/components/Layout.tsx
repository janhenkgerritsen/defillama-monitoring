import React from "react";
import DesktopNavigation from "./navigation/DesktopNavigation";
import MobileNavigation from "./navigation/MobileNavigation";
import SEO, { SEOProps } from "./SEO";
import Link from "next/link";

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
    { label: "Protocol URLs", href: "/protocol-urls" },
  ];

  return (
    <>
      <SEO {...seo} />
      <div className="flex flex-col md:flex-row min-h-screen">
        <DesktopNavigation items={navigationItems} />
        <MobileNavigation items={navigationItems} />

        <main className="flex flex-1 flex-col min-w-0 p-4 ml-0 md:ml-56">
          <header className="mt-2 mb-4">
            <h1 className="text-3xl font-semibold tracking-tight text-base-content">
              {heading}
            </h1>
          </header>
          {children}
          <div className="mt-auto pt-5 text-center">
            <Link
              className="text-sm text-black dark:text-white underline"
              href="https://github.com/janhenkgerritsen/defillama-monitoring"
              target="_blank"
            >
              Website source code
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
