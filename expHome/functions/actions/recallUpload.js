const { db, storage } = require("../admin");

module.exports = async (req, res) => {
  try {
    const { rawFileContent } = req.body;
    console.log(rawFileContent, "rawFileContent")
    const bucket = "visualexp-a7d2c.appspot.com";
    const filePath = `recalls/${rawFileContent.docId}-${rawFileContent.session}-${rawFileContent.conditionIndex}.json`;
    const file = bucket.file(filePath);
    await file.save(JSON.stringify(rawFileContent), {
      contentType: 'text/plain'
    });
    return res.status(200).send({
      message: filePath
    });
  } catch(e) {
    console.log(e);
    return res.status(500).send({
      message: "error occurred"
    });
  }
}