import { config } from "../config";
import { executeAuditPipeline } from "./audit-pipeline.service";

let schedulerIntervalId: NodeJS.Timeout | null = null;

function parseIntervalToMs(intervalStr: string): number {
  switch (intervalStr.toLowerCase().trim()) {
    case "hourly":
      return 60 * 60 * 1000; // 1 hour
    case "every_6_hours":
    case "6_hours":
      return 6 * 60 * 60 * 1000; // 6 hours
    case "daily":
      return 24 * 60 * 60 * 1000; // 24 hours
    default: {
      const parsed = parseInt(intervalStr, 10);
      return isNaN(parsed) || parsed < 60000 ? 6 * 60 * 60 * 1000 : parsed;
    }
  }
}

/**
 * Initializes automated audit scraping and pipeline execution on server start.
 */
export function startAuditScheduler() {
  if (!config.AUDIT_SCHEDULER_ENABLED) {
    console.log("⏱️  Audit scheduler is disabled (AUDIT_SCHEDULER_ENABLED=false)");
    return;
  }

  const intervalMs = parseIntervalToMs(config.AUDIT_SCHEDULE_INTERVAL);
  console.log(`⏱️  Audit scheduler active — running every ${intervalMs / 1000 / 60} minutes`);

  // Run initial automatic scrape & audit cycle on server startup (after 3s warm-up)
  setTimeout(async () => {
    console.log("\n🚀 [Auto-Audit] Server started: Running automatic initial portal scraping & audit cycle...");
    try {
      const result = await executeAuditPipeline({ triggeredBy: "server-startup" });
      console.log(
        `✅ [Auto-Audit] Startup audit cycle completed: ${result.status} | Listings Processed: ${result.listingsProcessed} | Matched: ${result.listingsMatched} | Discrepancies: ${result.discrepanciesCreated}\n`
      );
    } catch (err) {
      console.error("⚠️ [Auto-Audit] Startup audit error:", err);
    }
  }, 3000);

  // Set recurring audit interval
  schedulerIntervalId = setInterval(async () => {
    console.log("⏱️  Executing scheduled automated audit cycle...");
    try {
      const result = await executeAuditPipeline({ triggeredBy: "scheduler" });
      console.log(`⏱️  Scheduled audit completed: ${result.status} (Discrepancies: ${result.discrepanciesCreated})`);
    } catch (err) {
      console.error("❌ Scheduled audit error:", err);
    }
  }, intervalMs);
}

/**
 * Stops background scheduler gracefully.
 */
export function stopAuditScheduler() {
  if (schedulerIntervalId) {
    clearInterval(schedulerIntervalId);
    schedulerIntervalId = null;
    console.log("⏱️  Audit scheduler stopped");
  }
}
