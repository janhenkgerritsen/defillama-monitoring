import Link from "next/link";
import Image from "next/image";
import { NavigationItem } from "../Layout";
import ThemeSwitcher from "../ThemeSwitcher";
import { useRouter } from "next/router";
import clsx from "clsx";
import { useEffect, useState } from "react";

export default function MobileNavigation({
  items = [],
}: {
  items: NavigationItem[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when page changes
  useEffect(() => {
    const close = () => setIsOpen(false);

    router.events.on("routeChangeStart", close);

    return () => router.events.off("routeChangeStart", close);
  }, [router.events, setIsOpen]);

  return (
    <div className="flex md:hidden p-4 bg-[linear-gradient(168deg,#344179_3.98%,#445ed0_100%)]">
      <Link href="/" className="mr-auto">
        <Image src="/img/defillama.webp" width={105} height={35} alt="" />
      </Link>

      <button
        type="button"
        className="rounded bg-[#445ed0] p-2 text-white shadow"
        onClick={() => setIsOpen(true)}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="www.w3.org"
        >
          <path
            d="M4 6H20M4 12H20M4 18H20"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      {/* Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-40",
          "transition-opacity duration-300 ease-out",
          {
            "opacity-100 pointer-events-auto": isOpen,
            "opacity-0 pointer-events-none": !isOpen,
          }
        )}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Menu */}
      <div
        className={clsx(
          "fixed inset-y-0 right-0 flex flex-col p-4 bg-main z-50 shadow-xl",
          "transform transition-transform duration-300 ease-out",
          {
            "translate-x-0": isOpen,
            "translate-x-full pointer-events-none": !isOpen,
          }
        )}
      >
        <button
          type="button"
          className="ml-auto hover:cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            xmlns="www.w3.org"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <nav className="mt-4 flex flex-col">
          {items.map((item) => {
            const active = router.pathname == item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "rounded px-2 py-1.5",
                  { "hover:bg-black/5 dark:hover:bg-white/10": !active },
                  { "bg-accent text-white hover:": active }
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <ThemeSwitcher onChanged={() => setIsOpen(false)} />
        </div>
      </div>
    </div>
  );
}
