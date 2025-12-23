import Layout from "@/components/Layout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Layout seo={pageProps.seo}>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
