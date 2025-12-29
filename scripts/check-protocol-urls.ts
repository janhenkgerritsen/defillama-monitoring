import fs from "fs";
import {
  Protocol,
  ProtocolUrlResult,
  ProtocolUrlResultClassification,
  ProtocolUrlType,
} from "../src/shared/protocols";
import { PROTOCOL_URLS_RESULTS_FILE } from "@/cache";

const TEMP_RESULTS_FILE = PROTOCOL_URLS_RESULTS_FILE + ".tmp";

export type UrlTask = {
  protocol: Protocol;
  type: ProtocolUrlType;
  url: string;
};

async function main() {
  const response = await fetch("https://api.llama.fi/protocols");

  const getCheckedKey = (id: string, property: string) => `${id}-${property}`;

  let alreadyChecked: Set<string> = new Set();
  if (fs.existsSync(TEMP_RESULTS_FILE)) {
    const lines = fs
      .readFileSync(TEMP_RESULTS_FILE, "utf-8")
      .trim()
      .split("\n");

    alreadyChecked = new Set(
      lines.map((line) => {
        const result = JSON.parse(line);
        return getCheckedKey(result.protocolId, result.property);
      })
    );
  }

  const tasks: UrlTask[] = [];
  const twitterTasks: UrlTask[] = [];
  const githubTasks: UrlTask[] = [];

  for (const protocol of await response.json()) {
    if (
      protocol.url &&
      !alreadyChecked.has(getCheckedKey(protocol.id, "url"))
    ) {
      tasks.push({ protocol, type: "url", url: protocol.url });
    }

    if (
      protocol.referralUrl &&
      !alreadyChecked.has(getCheckedKey(protocol.id, "referralUrl"))
    ) {
      tasks.push({
        protocol,
        type: "referral_url",
        url: protocol.referralUrl,
      });
    }

    if (
      protocol.twitter &&
      !alreadyChecked.has(getCheckedKey(protocol.id, "twitter"))
    ) {
      twitterTasks.push({
        protocol,
        type: "twitter",
        url: `https://x.com/${protocol.twitter}`,
      });
    }

    if (
      protocol.github &&
      protocol.github.length &&
      !alreadyChecked.has(getCheckedKey(protocol.id, "github"))
    ) {
      githubTasks.push(
        ...protocol.github.map((handle: string) => ({
          protocol,
          type: "github",
          url: `https://github.com/${handle}`,
        }))
      );
    }

    if (
      protocol.audit_links &&
      protocol.audit_links.length &&
      !alreadyChecked.has(getCheckedKey(protocol.id, "audit_links"))
    ) {
      tasks.push(
        ...protocol.audit_links.map((auditLink: string) => ({
          protocol,
          type: "audit_link",
          url: auditLink,
        }))
      );
    }
  }

  const taskWorker = async (task: UrlTask) => {
    const result = await checkUrl(task.protocol, task.type, task.url);
    logResultToFile(result);
  };

  // TODO
  // Not checking Twitter for now, as they return a 200 OK response whether an account exists or not.
  // Furthermore, the HTML source code is the same as well. So cannot use simple source code text check either.
  // Twitter API is way too expensive for this usecase, so not an option.
  // Using a headless browser that can run Javascript likely is the most feasible option.
  await Promise.all([
    runWithConcurrency<UrlTask>(tasks, 10, taskWorker),
    // runWithConcurrency<UrlTask>(twitterTasks, 5, taskWorker),
    runWithConcurrency<UrlTask>(githubTasks, 1, taskWorker, 150), // Don't overload GitHub, will result in rate limiting
  ]);

  fs.renameSync(TEMP_RESULTS_FILE, PROTOCOL_URLS_RESULTS_FILE);
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
  delayMs: number = 0
) {
  let index = 0;

  async function runWorker() {
    while (true) {
      const currentIndex = index++;
      if (currentIndex >= items.length) break;
      await worker(items[currentIndex]);

      if (delayMs) await sleep(delayMs);
    }
  }

  const workers = Array.from({ length: limit }, () => runWorker());
  await Promise.all(workers);
}

async function checkUrl(
  protocol: Protocol,
  type: ProtocolUrlType,
  url: string
): Promise<ProtocolUrlResult> {
  const result: ProtocolUrlResult = {
    id: protocol.id,
    name: protocol.name,
    tvl: protocol.tvl,
    type,
    url,
    result: "OK",
  };

  let response: Response;

  try {
    response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const resultClassification = errorMessage.includes("Failed to parse")
      ? "PARSING_ERROR"
      : "FETCH_ERROR";

    return {
      ...result,
      result: resultClassification,
      error: errorMessage,
    };
  }

  let resultClassification: ProtocolUrlResultClassification;

  if (response.status >= 200 && response.status < 400) {
    const originalHostname = getNormalizedHostname(url);
    const finalHostname = getNormalizedHostname(response.url);

    if (!originalHostname || !finalHostname) {
      resultClassification = "PARSING_ERROR";
    } else if (originalHostname != finalHostname) {
      resultClassification = "OK_DOMAIN_CHANGED";
    } else {
      resultClassification = "OK";
    }
  } else if (response.status === 404 || response.status === 410) {
    resultClassification = "NOT_FOUND";
  } else if (response.status === 403) {
    resultClassification = "FORBIDDEN";
  } else if (response.status === 429) {
    resultClassification = "RATE_LIMITED";
  } else if (response.status >= 500) {
    resultClassification = "SERVER_ERROR";
  } else {
    resultClassification = "BAD_STATUS";
  }

  return {
    ...result,
    result: resultClassification,
    responseStatus: response.status,
    responseStatusText: response.statusText,
    responseUrl: response.url,
  };
}

function getNormalizedHostname(rawUrl: string) {
  try {
    const url = new URL(rawUrl);

    return url.hostname.toLowerCase().replace("www.", "");
  } catch {
    return null;
  }
}

function logResultToFile(result: ProtocolUrlResult) {
  fs.appendFileSync(TEMP_RESULTS_FILE, JSON.stringify(result) + "\n", "utf-8");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
