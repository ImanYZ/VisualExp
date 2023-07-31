const { Storage } = require("@google-cloud/storage");

//we use this function to save the gradesLogs to the storage bucket
exports.saveGradesLogs = async (req, res) => {
  try {
    const storage = new Storage({ projectId: "visualexp-a7d2c" });
    const bucket = storage.bucket("gs://visualexp-a7d2c.appspot.com");
    const filePath = `gradesLogs/${req.body.fileName}`;
    await bucket.file(filePath).save(JSON.stringify(req.body.responseLogs));
    return res.status(200).send("success");
  } catch (error) {
    console.log(error);
    return res.status(500).send("error");
  }
};

exports.updateASA = async (req, res) => {
  try {
    const storage = new Storage({ projectId: "visualexp-a7d2c" });
    const bucket = storage.bucket("gs://visualexp-a7d2c.appspot.com");
    const { operation, newData, fileName } = req.body;
    console.log(operation, newData, fileName);
    if (operation === "read") {
      console.log(operation);
      const file = bucket.file(fileName);
      const [content] = await file.download();
      console.log("File content:", content.toString());
      return res.status(200).send(content);
    }
    if (operation === "write") {
      if (Object.values(newData).length > 0) {
        await bucket.file(fileName).save(JSON.stringify(newData));
      }
    }
    return res.status(200).send("success");
  } catch (error) {
    console.log(error);
    return res.status(500).send("error");
  }
};
