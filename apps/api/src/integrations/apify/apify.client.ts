import { ApifyClient } from "apify-client";
import { config } from "../../config";

let _client: ApifyClient | null = null;

/**
 * Returns a singleton ApifyClient.
 * Returns null if APIFY_API_TOKEN is not configured —
 * callers must handle the null case gracefully.
 */
export function getApifyClient(): ApifyClient | null {
  if (!config.APIFY_API_TOKEN) {
    console.warn(
      "[Apify] APIFY_API_TOKEN not set. Apify integration is disabled. " +
      "Add your token to .env to enable scraping."
    );
    return null;
  }

  if (!_client) {
    _client = new ApifyClient({ token: config.APIFY_API_TOKEN });
  }

  return _client;
}

export interface ApifyRunResult {
  runId: string;
  defaultDatasetId: string;
  status: string;
}

/**
 * Trigger an Apify actor run.
 * Returns run metadata including defaultDatasetId for fetching results.
 */
export async function runActor(
  actorId: string,
  input: Record<string, unknown>
): Promise<ApifyRunResult | null> {
  const client = getApifyClient();
  if (!client) return null;

  try {
    const run = await client.actor(actorId).call(input, {
      waitSecs: 0, // Non-blocking — don't wait for completion
    });

    return {
      runId: run.id,
      defaultDatasetId: run.defaultDatasetId,
      status: run.status,
    };
  } catch (err) {
    console.error(`[Apify] Failed to start actor ${actorId}:`, err);
    throw err;
  }
}

/**
 * Poll until an actor run finishes (or timeout is reached).
 * For production use — allows waiting for completion before fetching results.
 */
export async function waitForRun(
  runId: string,
  timeoutMs = 300_000 // 5 minutes default
): Promise<ApifyRunResult | null> {
  const client = getApifyClient();
  if (!client) return null;

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const run = await client.run(runId).get();
    if (!run) throw new Error(`Run ${runId} not found`);

    if (run.status === "SUCCEEDED" || run.status === "FAILED" || run.status === "ABORTED") {
      return {
        runId: run.id,
        defaultDatasetId: run.defaultDatasetId,
        status: run.status,
      };
    }

    // Wait 5 seconds before polling again
    await new Promise((r) => setTimeout(r, 5000));
  }

  throw new Error(`Apify run ${runId} timed out after ${timeoutMs}ms`);
}

/**
 * Fetch all items from an Apify dataset.
 */
export async function getDatasetItems<T = Record<string, unknown>>(
  datasetId: string
): Promise<T[]> {
  const client = getApifyClient();
  if (!client) return [];

  const dataset = await client.dataset(datasetId).listItems();
  return dataset.items as T[];
}
