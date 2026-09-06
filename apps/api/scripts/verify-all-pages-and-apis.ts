import http from "http";

function fetchUrl(url: string, options: any = {}): Promise<{ status: number; body: string; json?: any }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = http.request(
      {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let json;
          try {
            json = JSON.parse(data);
          } catch {}
          resolve({ status: res.statusCode || 0, body: data, json });
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function verifyAll() {
  console.log("🔍 Verifying Full Stack Frontend Pages and API Endpoints...\n");

  const results: { target: string; type: "PAGE" | "API"; status: number; ok: boolean; info?: string }[] = [];

  // 1. API Endpoints
  const apiEndpoints = [
    { url: "http://localhost:4000/health", method: "GET" },
    { url: "http://localhost:4000/listings", method: "GET" },
    { url: "http://localhost:4000/agents", method: "GET" },
    { url: "http://localhost:4000/discrepancies?includeResolved=true", method: "GET" },
    { url: "http://localhost:4000/audit/runs", method: "GET" },
    { url: "http://localhost:4000/users", method: "GET" },
    {
      url: "http://localhost:4000/social-matcher",
      method: "POST",
      body: { city: "Covington", price: 500000 },
    },
  ];

  for (const ep of apiEndpoints) {
    try {
      const res = await fetchUrl(ep.url, { method: ep.method, body: ep.body });
      const ok = res.status >= 200 && res.status < 300;
      let info = "";
      if (Array.isArray(res.json)) {
        info = `${res.json.length} items`;
      } else if (res.json && typeof res.json === "object") {
        info = Object.keys(res.json).join(", ");
      }
      results.push({ target: `${ep.method} ${ep.url}`, type: "API", status: res.status, ok, info });
    } catch (err: any) {
      results.push({ target: `${ep.method} ${ep.url}`, type: "API", status: 0, ok: false, info: err.message });
    }
  }

  // 2. Next.js Frontend Pages
  const frontendPages = [
    "http://localhost:3000/",
    "http://localhost:3000/listings",
    "http://localhost:3000/listings/new",
    "http://localhost:3000/social-matcher",
    "http://localhost:3000/agents",
    "http://localhost:3000/employees",
    "http://localhost:3000/settings",
    "http://localhost:3000/profile",
    "http://localhost:3000/login",
  ];

  // Also check single listing detail page if we got listings
  const listingsRes = await fetchUrl("http://localhost:4000/listings");
  if (Array.isArray(listingsRes.json) && listingsRes.json.length > 0) {
    const firstListingId = listingsRes.json[0].id;
    frontendPages.push(`http://localhost:3000/listings/${firstListingId}`);
  }

  for (const pageUrl of frontendPages) {
    try {
      const res = await fetchUrl(pageUrl);
      const ok = res.status >= 200 && res.status < 300;
      results.push({ target: pageUrl, type: "PAGE", status: res.status, ok, info: `${res.body.length} bytes` });
    } catch (err: any) {
      results.push({ target: pageUrl, type: "PAGE", status: 0, ok: false, info: err.message });
    }
  }

  console.table(results);

  const failed = results.filter((r) => !r.ok);
  if (failed.length === 0) {
    console.log("\n🎉 ALL 17 FRONTEND PAGES AND BACKEND API ENDPOINTS PASSED WITH 200 OK!");
  } else {
    console.error(`\n❌ ${failed.length} endpoints failed verification.`);
  }
}

verifyAll().catch(console.error);
