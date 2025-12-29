import Layout from "@/components/Layout";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Layout heading={pageProps.heading} seo={pageProps.seo}>
          <Component {...pageProps} />
        </Layout>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
