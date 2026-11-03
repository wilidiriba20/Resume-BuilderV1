
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerSpecPath = path.resolve(
  __dirname,
  "../../docs/swagger-output.json"
);

const swaggerSpec = JSON.parse(
  fs.readFileSync(swaggerSpecPath, "utf8")
);

export default swaggerSpec;
