import "dotenv/config";
import https from "https";
import http from "http";
import { config } from "../src/config";

async function testBrightDataAPI() {
  console.log("==========================================");
  console.log("1. TESTING BRIGHT DATA API & DATASETS");
  console.log("==========================================");
  console.log("API Token:", config.BRIGHTDATA_API_TOKEN ? `${config.BRIGHTDATA_API_TOKEN.slice(0, 8)}...` : "NOT SET");
  console.log("Zillow Dataset ID:", config.BRIGHTDATA_ZILLOW_DATASET_ID || "NOT SET");
  console.log("Realtor Dataset ID:", config.BRIGHTDATA_REALTOR_DATASET_ID || "NOT SET");

  if (!config.BRIGHTDATA_API_TOKEN) {
    console.error("❌ BRIGHTDATA_API_TOKEN is not configured.");
    return;
  }

  // Check active zones
  try {
    console.log("\n[API] Querying active zones for this API token...");
    const res = await fetch("https://api.brightdata.com/zone/get_active_zones", {
      headers: { Authorization: `Bearer ${config.BRIGHTDATA_API_TOKEN}` },
    });

    if (res.ok) {
      const zones = await res.json();
      console.log("✓ API Token is valid! Active Zones:", zones);
    } else {
      const errorText = await res.text();
      console.log(`❌ API Response (${res.status}):`, errorText);
    }
  } catch (err: any) {
    console.error("❌ Error querying Bright Data zones:", err.message);
  }

  // Check Dataset Triggers
  const datasets = [
    { name: "Zillow", id: config.BRIGHTDATA_ZILLOW_DATASET_ID },
    { name: "Realtor", id: config.BRIGHTDATA_REALTOR_DATASET_ID },
  ];

  for (const { name, id } of datasets) {
    if (!id) continue;
    try {
      console.log(`\n[API] Testing Dataset Endpoint for '${name}' (ID: ${id})...`);
      const res = await fetch(`https://api.brightdata.com/datasets/v3/trigger?dataset_id=${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.BRIGHTDATA_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([]),
      });

      const text = await res.text();
      console.log(`ℹ Dataset '${name}' response (${res.status}): ${text}`);
    } catch (err: any) {
      console.error(`❌ Error verifying dataset '${name}':`, err.message);
    }
  }
}

async function testBrightDataProxy() {
  console.log("\n==========================================");
  console.log("2. TESTING BRIGHT DATA PROXY / WEB UNLOCKER");
  console.log("==========================================");
  console.log("Proxy Host:", config.BRIGHTDATA_PROXY_HOST || "NOT SET");
  console.log("Proxy Username:", config.BRIGHTDATA_PROXY_USERNAME || "NOT SET");
  console.log("Proxy Password:", config.BRIGHTDATA_PROXY_PASSWORD ? "******" : "NOT SET");

  if (!config.BRIGHTDATA_PROXY_HOST || !config.BRIGHTDATA_PROXY_USERNAME || !config.BRIGHTDATA_PROXY_PASSWORD) {
    console.error("❌ Bright Data Proxy credentials incomplete.");
    return;
  }

  const [host, portStr] = config.BRIGHTDATA_PROXY_HOST.split(":");
  const port = parseInt(portStr, 10) || 44445;
  const auth = `${config.BRIGHTDATA_PROXY_USERNAME}:${config.BRIGHTDATA_PROXY_PASSWORD}`;

  console.log("\n[Proxy] Sending test request to lumtest.com via proxy...");
  await new Promise<void>((resolve) => {
    const req = http.request(
      {
        host,
        port,
        path: "http://lumtest.com/myip.json",
        headers: {
          Host: "lumtest.com",
          "Proxy-Authorization": `Basic ${Buffer.from(auth).toString("base64")}`,
        },
        timeout: 20000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(`✓ Proxy Connection Successful! Status: ${res.statusCode} ${res.statusMessage}`);
          try {
            const json = JSON.parse(data);
            console.log("✓ Routed Proxy IP Details:", json);
          } catch {
            console.log("✓ Body:", data);
          }
          resolve();
        });
      }
    );

    req.on("error", (err) => {
      console.error("❌ Proxy connection error:", err.message);
      resolve();
    });

    req.on("timeout", () => {
      console.error("❌ Proxy connection timed out");
      req.destroy();
      resolve();
    });

    req.end();
  });
}

async function main() {
  await testBrightDataAPI();
  await testBrightDataProxy();
}

main().catch(console.error);
