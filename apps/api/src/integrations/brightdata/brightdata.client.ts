import { config } from "../../config";
import http from "http";

export interface BrightDataTriggerResult {
  snapshot_id: string;
  status: string;
}

/**
 * Checks if Bright Data is configured.
 */
export function isBrightDataConfigured(): boolean {
  return !!config.BRIGHTDATA_API_TOKEN;
}

/**
 * Trigger Bright Data Web Dataset Collector.
 * @param datasetId e.g. BRIGHTDATA_ZILLOW_DATASET_ID or BRIGHTDATA_REALTOR_DATASET_ID
 * @param inputs array of search parameters / URLs to scrape
 */
export async function triggerDataset(
  datasetId: string,
  inputs: Array<Record<string, unknown>>
): Promise<BrightDataTriggerResult | null> {
  if (!config.BRIGHTDATA_API_TOKEN) {
    console.warn("[BrightData] BRIGHTDATA_API_TOKEN not configured.");
    return null;
  }

  const url = `https://api.brightdata.com/datasets/v3/trigger?dataset_id=${datasetId}&include_errors=true`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.BRIGHTDATA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputs),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Bright Data Dataset trigger failed (${res.status}): ${errorText}`);
  }

  const data = (await res.json()) as BrightDataTriggerResult;
  return data;
}

/**
 * Fetch dataset collection snapshot results from Bright Data.
 */
export async function getDatasetSnapshot<T = Record<string, unknown>>(
  snapshotId: string
): Promise<T[]> {
  if (!config.BRIGHTDATA_API_TOKEN) return [];

  const url = `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.BRIGHTDATA_API_TOKEN}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Bright Data snapshot retrieval failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as T[];
}

/**
 * Fetch target web page through Bright Data Web Unlocker Proxy.
 */
export async function fetchViaWebUnlocker(targetUrl: string): Promise<string> {
  if (!config.BRIGHTDATA_PROXY_HOST || !config.BRIGHTDATA_PROXY_USERNAME || !config.BRIGHTDATA_PROXY_PASSWORD) {
    throw new Error("Bright Data Proxy credentials are not fully configured.");
  }

  const [host, portStr] = config.BRIGHTDATA_PROXY_HOST.split(":");
  const port = parseInt(portStr, 10) || 44445;
  const auth = `${config.BRIGHTDATA_PROXY_USERNAME}:${config.BRIGHTDATA_PROXY_PASSWORD}`;

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host,
        port,
        path: targetUrl,
        headers: {
          Host: new URL(targetUrl).hostname,
          "Proxy-Authorization": `Basic ${Buffer.from(auth).toString("base64")}`,
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 30000,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
            resolve(body);
          } else {
            reject(new Error(`Proxy request returned status ${res.statusCode}: ${body.slice(0, 200)}`));
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Bright Data Proxy request timed out"));
    });
    req.end();
  });
}
