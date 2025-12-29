import { promises as fs } from "fs";
import { ProtocolUrlResult } from "./shared/protocols";
import { getDataDir } from "./config";
import path from "path";

type Cache<T> = {
  getData(): Promise<ReadonlyArray<T>>;
};

export function createInMemoryCache<T>(file: string): Cache<T> {
  let mtimeMs = 0;
  let data: ReadonlyArray<T> | null = null;
  let loading: Promise<ReadonlyArray<T>> | null = null;

  async function getData(): Promise<ReadonlyArray<T>> {
    const stat = await fs.stat(file);

    if (data && mtimeMs === stat.mtimeMs) return data;

    if (loading) return loading;

    loading = (async () => {
      const json = await fs.readFile(file, "utf-8");

      data = json
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .map((l) => JSON.parse(l) as T);

      mtimeMs = stat.mtimeMs;

      return data;
    })();

    try {
      return await loading;
    } finally {
      loading = null;
    }
  }

  return {
    getData,
  };
}

export const PROTOCOL_URLS_RESULTS_FILE = path.join(
  getDataDir(),
  "protocol-urls.jsonl"
);

export const protocolsUrlCache = createInMemoryCache<ProtocolUrlResult>(
  PROTOCOL_URLS_RESULTS_FILE
);
