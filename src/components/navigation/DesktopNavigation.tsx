import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { NavigationItem } from "../Layout";
import ThemeSwitcher from "../ThemeSwitcher";

export default function DesktopNavigation({
  items = [],
}: {
  items: NavigationItem[];
}) {
  const router = useRouter();

  return (
    <div className="hidden fixed inset-y-0 bg-base md:flex flex-col w-56 p-4">
      <Link href="/">
        <Image
          src="/img/defillama.webp"
          className="hidden dark:block"
          width={155}
          height={53}
          alt=""
        />
        <Image
          src="/img/defillama-dark.webp"
          className="block dark:hidden"
          width={155}
          height={53}
          alt=""
        />
      </Link>

      <nav className="mt-4 flex flex-col">
        {items.map((item) => {
          const active = router.pathname == item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded px-2 py-1.5 text-black dark:text-white",
                {
                  "hover:bg-black/5 dark:hover:bg-white/10 hover:no-underline":
                    !active,
                },
                { "bg-accent text-white hover:no-underline": active }
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <ThemeSwitcher />
      </div>
    </div>
  );
}
