import Head from "next/head";

export type SEOProps = {
  title?: string;
  description?: string;
};

const SITE_NAME = "DefiLlama Monitoring";

export default function SEO({ title, description }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description}></meta>
    </Head>
  );
}
