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
Object.defineProperty(exports, "__esModule", { value: true });
const admin_1 = require("../lib/admin");
const typesence_1 = require("./typesence");
const getInstitutionsFirestore = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    // let institutions: string[] = [];
    const institutionDocs = yield admin_1.db.collection("institutions").get();
    // for (let institutionDoc of institutionDocs.docs) {
    //   const institutionData = institutionDoc.data();
    //   const tagsArr = institutionData.name;
    //   institutions = Array.from(new Set(institutions.concat(tagsArr)));
    // }
    return institutionDocs.docs.map(institutionDoc => {
      const institutionData = institutionDoc.data();
      const institutionName = institutionData.name;
      return { name: institutionName };
    });
    // const tagsObjArr = institutions.map((el: string) => ({ name: el }));
    // return tagsObjArr;
  });
const main = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    // const client = new Typesense.Client({
    //   nodes: [
    //     {
    //       host: config.host,
    //       port: config.port,
    //       protocol: config.protocol
    //     }
    //   ],
    //   apiKey: "xyz"
    // });
    const fields = [{ name: "name", type: "string" }];
    const schema = { name: "institutions", fields };
    console.log("Populating institutions index in Typesense");
    const institutions = yield getInstitutionsFirestore();
    let reindexNeeded = false;
    try {
      const collection = yield typesence_1.client.collections("institutions").retrieve();
      console.log("Found existing schema: institutions");
      if (collection.num_documents !== institutions.length) {
        console.log("Deleting existing schema");
        reindexNeeded = true;
        yield typesence_1.client.collections("institutions").delete();
      }
    } catch (e) {
      reindexNeeded = true;
    }
    if (!reindexNeeded) {
      return true;
    }
    console.log("Creating schema: ");
    console.log(JSON.stringify(schema, null, 2));
    yield typesence_1.client.collections().create(schema);
    console.log("Adding records: ");
    // Bulk Import
    try {
      const returnData = yield typesence_1.client.collections("institutions").documents().import(institutions);
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
