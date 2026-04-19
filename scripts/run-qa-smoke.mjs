import { runSmokeChecks } from "../lib/qa-smoke.ts";

const baseUrl = process.argv[2] || process.env.QA_BASE_URL || "https://www.ratstudios.ai";

const result = await runSmokeChecks(baseUrl);
console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}
