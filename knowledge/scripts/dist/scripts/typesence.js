"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const typesense_1 = __importDefault(require("typesense"));
const typesenseConfig_1 = __importDefault(require("./typesenseConfig"));
exports.client = new typesense_1.default.Client({
  nodes: [
    {
      host: typesenseConfig_1.default.host,
      port: typesenseConfig_1.default.port,
      protocol: typesenseConfig_1.default.protocol
    }
  ],
  apiKey: "xyz"
});
