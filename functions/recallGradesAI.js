const { Storage } = require("@google-cloud/storage");

//we use this function to save the gradesLogs to the storage bucket
exports.saveGradesLogs = async (req, res) => {
  try {
    const storage = new Storage({ projectId: "visualexp-5d2c6" });
    const bucket = storage.bucket("gs://visualexp-5d2c6.appspot.com");
    const filePath = `gradesLogs/${req.body.fileName}`;
    await bucket.file(filePath).save(JSON.stringify(req.body.responseLogs));
    console.log(req.body.data);
  } catch (error) {
    console.log(error);
  }
};
