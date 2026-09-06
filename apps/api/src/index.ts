import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import { config } from "./config";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { authenticateJwt } from "./middleware/auth";
import { startAuditScheduler } from "./services/scheduler.service";

// Routers
import { authRouter } from "./modules/auth/auth.router";
import { listingsRouter } from "./modules/listings/listings.router";
import { agentsRouter } from "./modules/agents/agents.router";
import { discrepanciesRouter } from "./modules/discrepancies/discrepancies.router";
import { socialMatcherRouter } from "./modules/social-matcher/social-matcher.router";
import { usersRouter } from "./modules/users/users.router";
import { auditRouter } from "./modules/audit/audit.router";

const app: Express = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(authenticateJwt);

// ─── Health Check ─────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "real-estate-audit-api",
    version: "1.1.0",
    env: config.NODE_ENV,
    timestamp: new Date().toISOString(),
    matching: {
      confidenceThreshold: config.MATCH_CONFIDENCE_THRESHOLD,
      highConfidenceThreshold: config.MATCH_HIGH_CONFIDENCE_THRESHOLD,
    },
    scheduler: {
      enabled: config.AUDIT_SCHEDULER_ENABLED,
      interval: config.AUDIT_SCHEDULE_INTERVAL,
    },
    apify: {
      configured: !!config.APIFY_API_TOKEN,
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────
app.use("/auth", authRouter);
app.use("/listings", listingsRouter);
app.use("/agents", agentsRouter);
app.use("/discrepancies", discrepanciesRouter);
app.use("/social-matcher", socialMatcherRouter);
app.use("/users", usersRouter);
app.use("/audit", auditRouter);

// ─── 404 & Error Handlers ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.listen(config.PORT, () => {
    console.log(`\n🏠 Real Estate Audit API`);
    console.log(`   ├─ Port:      ${config.PORT}`);
    console.log(`   ├─ Env:       ${config.NODE_ENV}`);
    console.log(`   ├─ CORS:      ${config.CORS_ORIGIN}`);
    console.log(`   ├─ Threshold: ${config.MATCH_CONFIDENCE_THRESHOLD}%`);
    console.log(`   ├─ Scheduler: ${config.AUDIT_SCHEDULER_ENABLED ? config.AUDIT_SCHEDULE_INTERVAL : "Disabled"}`);
    console.log(`   └─ Apify:     ${config.APIFY_API_TOKEN ? "✓ Configured" : "⚠ Not configured (add APIFY_API_TOKEN)"}`);
    console.log(`\n   Health: http://localhost:${config.PORT}/health\n`);

    // Start background audit scheduler if enabled
    startAuditScheduler();
  });
}

export default app;
