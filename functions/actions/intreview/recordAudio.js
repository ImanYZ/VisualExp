const storage = new Storage({ projectId: "visualexp-a7d2c" });
const uploadBlobAsAudio = async (blob, filePath) => {
  const bucket = storage.bucket("gs://visualexp-a7d2c.appspot.com");
  await bucket.file(filePath).save(blob.buffer);
  await bucket.file(filePath).makePublic();
};

function convertDataURLToBlob(dataURL) {
  const base64Data = dataURL.split(",")[1];
  const bufferData = Buffer.from(base64Data, "base64");
  const mimeType = dataURL.split(":")[1].split(";")[0];
  return {
    buffer: bufferData,
    size: bufferData.length,
    type: mimeType
  };
}

module.exports = async (req, res) => {
  try {
    console.log("recordAudio called");
    console.log(req.body.audioBlob);
    const blob = convertDataURLToBlob(req.body.audioBlob);
    const meetingUrl = req.body.meetingUrl;
    let meetingId = "";
    const regex = /[a-z]{3}-[a-z]{4}-[a-z]{3}/;
    const matchResult = meetingUrl.match(regex);
    if (matchResult) {
      meetingId = matchResult[0];
    }
    console.log(blob);
    const filePath = "interviews/" + meetingId.trim() + ".webm";
    await uploadBlobAsAudio(blob, filePath);
    console.log("done");
  } catch (error) {
    console.log(error);
  }
};
