import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

const setInitialTheme = `
(function() {
  let theme = localStorage.getItem('theme');

  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  document.documentElement.classList.add(theme);
})();
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <Script
          id="set-initial-theme"
          dangerouslySetInnerHTML={{ __html: setInitialTheme }}
        />
      </Head>
      <body className="bg-base text-black dark:text-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
