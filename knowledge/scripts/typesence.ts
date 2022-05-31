import Typesense from "typesense";

import config from "./typesenseConfig";

export const client = new Typesense.Client({
  nodes: [
    {
      host: config.host,
      port: config.port,
      protocol: config.protocol
    }
  ],
  apiKey: "xyz"
});
