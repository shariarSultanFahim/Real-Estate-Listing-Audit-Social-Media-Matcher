const { spawn } = require("child_process");
const path = require("path");

function startServer() {
  console.log("[Supervisor] Starting Next.js production server on port 3000...");
  const nextBin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");
  const child = spawn("node", [nextBin, "start", "-p", "3000"], {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, PORT: "3000" },
  });

  child.on("exit", (code, signal) => {
    console.log(`[Supervisor] Next.js exited with code ${code}, signal ${signal}. Auto-restarting in 1s...`);
    setTimeout(startServer, 1000);
  });
}

startServer();
