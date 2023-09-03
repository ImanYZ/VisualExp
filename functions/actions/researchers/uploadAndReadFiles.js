const { storage } = require("../../admin");

module.exports = async (req, res) => {
  try {
    const { operation, newData, fileName } = req.body;

    console.log(" operation, newData, fileName", {
      operation,
      newData,
      fileName
    });
    const bucket = storage.bucket("gs://visualexp-a7d2c.appspot.com");
    if (operation === "read") {
      const file = bucket.file(fileName);

      const [exists] = await file.exists();
      if (exists) {
        const [content] = await file.download();
        console.log("File downloaded successfuly");
        return res.status(200).send({ response: JSON.parse(content.toString()) });
      } else {
        return res.status(200).send({ response: JSON.parse({}.toString()) });
      }
    }
    if (operation === "write") {
      if (Object.values(newData).length > 0) {
        await bucket.file(fileName).save(JSON.stringify(newData));
        return res.status(200).send("updaed Successfully");
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "error", data: error });
  }
};
