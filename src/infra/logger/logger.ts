import pino from "pino";

export const logger = pino({
  name: "rinha-node",
  level: "info",
});
