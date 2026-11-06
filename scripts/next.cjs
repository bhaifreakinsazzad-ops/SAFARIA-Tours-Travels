// Keep Next's optional global telemetry/config writer out of this Windows workspace.
process.env.NEXT_TELEMETRY_DISABLED = "1";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("../node_modules/next/dist/bin/next");
