import { protocolsUrlCache } from "@/cache";
import Link from "next/link";

type ProtocolUrlData = Record<
  string,
  {
    label: string;
    total: number;
    ok: number;
    redirect: number;
    error: number;
  }
>;

export async function getServerSideProps() {
  const data = await protocolsUrlCache.getData();

  const protocolUrlData: ProtocolUrlData = {
    url: { label: "URLs", total: 0, ok: 0, redirect: 0, error: 0 },
    referral_url: {
      label: "Referral URLs",
      total: 0,
      ok: 0,
      redirect: 0,
      error: 0,
    },
    github: { label: "Github", total: 0, ok: 0, redirect: 0, error: 0 },
    audit_link: {
      label: "Audit links",
      total: 0,
      ok: 0,
      redirect: 0,
      error: 0,
    },
  };

  for (const row of data) {
    protocolUrlData[row.type]["total"]++;

    if (row.result === "OK") {
      protocolUrlData[row.type]["ok"]++;
    } else if (row.result === "OK_DOMAIN_CHANGED") {
      protocolUrlData[row.type]["redirect"]++;
    } else {
      protocolUrlData[row.type]["error"]++;
    }
  }

  return {
    props: {
      heading: "Dashboard",
      seo: {
        title: "Dashboard",
      },
      protocolUrlData,
    },
  };
}

export default function Home({
  protocolUrlData,
}: {
  protocolUrlData: ProtocolUrlData;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 md2:grid-cols-2 xl:grid-cols-3 gap-4">
      <div className="card">
        <div className="card-header flex justify-between">
          Protocol URLs
          <Link
            className="text-sm font-medium text-primary hover:underline"
            href="/protocol-urls"
          >
            Details
          </Link>
        </div>
        <div className="card-body">
          <dl className="grid grid-cols-2 gap-x-12 gap-y-8">
            {Object.values(protocolUrlData).map((x) => (
              <div key={x.label}>
                <dt className="text-sm font-medium text-base-content">
                  {x.label}
                </dt>

                <dd className="mt-2 space-y-2 text-sm tabular-nums">
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="text-base-content/70">Ok</span>
                    <span className="font-semibold text-base-content">
                      {x.ok}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="text-base-content/70">Redirect</span>
                    <span className="font-semibold text-base-content">
                      {x.redirect}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-6">
                    <span className="text-base-content/70">Error</span>
                    <span className="font-semibold text-base-content">
                      {x.error}
                    </span>
                  </div>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
