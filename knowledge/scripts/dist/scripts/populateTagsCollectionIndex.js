"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const typesense_1 = __importDefault(require("typesense"));
const admin_1 = require("../lib/admin");
const typesenseConfig_1 = __importDefault(require("./typesenseConfig"));
const getTagsFirestore = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    let tags = [];
    const tagDocs = yield admin_1.db.collection("tags").get();
    for (let tagDoc of tagDocs.docs) {
      const tagData = tagDoc.data();
      const tagsArr = tagData.tags;
      tags = Array.from(new Set(tags.concat(tagsArr)));
    }
    const tagsObjArr = tags.map(el => ({ name: el }));
    return tagsObjArr;
  });
const main = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const client = new typesense_1.default.Client({
      nodes: [
        {
          host: typesenseConfig_1.default.host,
          port: typesenseConfig_1.default.port,
          protocol: typesenseConfig_1.default.protocol
        }
      ],
      apiKey: "xyz"
    });
    const fields = [{ name: "name", type: "string" }];
    const schema = {
      name: "tags",
      fields
    };
    console.log("Populating tags index in Typesense");
    const tags = yield getTagsFirestore();
    let reindexNeeded = false;
    try {
      const collection = yield client.collections("tags").retrieve();
      console.log("Found existing schema: Tags");
      if (collection.num_documents !== tags.length) {
        console.log("Deleting existing schema");
        reindexNeeded = true;
        yield client.collections("tags").delete();
      }
    } catch (e) {
      reindexNeeded = true;
    }
    if (!reindexNeeded) {
      return true;
    }
    console.log("Creating schema: ");
    console.log(JSON.stringify(schema, null, 2));
    yield client.collections().create(schema);
    console.log("Adding records: ");
    // Bulk Import
    try {
      const returnData = yield client.collections("tags").documents().import(tags);
      console.log(returnData);
      console.log("Done indexing.");
      const failedItems = returnData.filter(item => item.success === false);
      if (failedItems.length > 0) {
        throw new Error(`Error indexing items ${JSON.stringify(failedItems, null, 2)}`);
      }
      return returnData;
    } catch (error) {
      console.log(error);
    }
  });
main();
