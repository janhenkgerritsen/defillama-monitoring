import type { ColumnMeta } from "@tanstack/react-table";

export type Protocol = {
  id: string;
  name: string;
  tvl: number;
  url: string;
  referralUrl?: string;
  twitter?: string;
  github?: string[]; // Contains GitHub handles, not URLs
  audit_links?: string[];
  rugged?: boolean;
  deadUrl?: boolean;
  deprecated?: boolean;
};

export type ProtocolUrlResultClassification =
  | "OK"
  | "OK_DOMAIN_CHANGED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "BAD_STATUS"
  | "PARSING_ERROR"
  | "FETCH_ERROR";

export type ProtocolUrlType =
  | "url"
  | "referral_url"
  | "audit_link"
  | "github"
  | "twitter";

export type ProtocolUrlResult = {
  id: string;
  name: string;
  tvl: number;
  type: ProtocolUrlType;
  url: string;
  result: ProtocolUrlResultClassification;
  responseStatus?: number;
  responseStatusText?: string;
  responseUrl?: string;
  error?: string;
};

export const TYPE_LABELS: Record<ProtocolUrlType, string> = {
  url: "Url",
  referral_url: "Referral url",
  audit_link: "Audit link",
  github: "Github",
  twitter: "Twitter",
};

export const STATUS_LABELS: Record<ProtocolUrlResultClassification, string> = {
  OK: "OK",
  OK_DOMAIN_CHANGED: "OK (Domain Changed)",
  NOT_FOUND: "Not Found (404)",
  FORBIDDEN: "Forbidden (403)",
  RATE_LIMITED: "Rate Limited (429)",
  SERVER_ERROR: "Server Error (5xx)",
  BAD_STATUS: "Unexpected Status",
  PARSING_ERROR: "Invalid URL",
  FETCH_ERROR: "Fetch Error",
};

export const FILTERS: Record<string, ColumnMeta<unknown, unknown>["filter"]> = {
  name: { type: "text" },
  type: {
    type: "select",
    options: { "": "All types", ...TYPE_LABELS },
  },
  result: { type: "select", options: { "": "All results", ...STATUS_LABELS } },
  url: { type: "text" },
};

export const FILTERABLE_COLUMNS = Object.keys(FILTERS);
export const SORTABLE_COLUMNS = ["name", "tvl"];
