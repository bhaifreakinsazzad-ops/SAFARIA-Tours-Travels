// Keep Next's optional global telemetry/config writer out of this workspace.
process.env.NEXT_TELEMETRY_DISABLED = "1";
if (!process.env.PORT) process.env.PORT = "3000";
if (!process.env.HOSTNAME) process.env.HOSTNAME = "0.0.0.0";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("../node_modules/next/dist/bin/next");

