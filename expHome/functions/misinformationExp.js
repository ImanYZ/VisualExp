const { admin, db, storage } = require("./admin");

require("dotenv").config();

exports.card = (req, res) => {
  switch (req.method) {
    case "GET":
      let html_content = `
<!DOCTYPE html>
    <html>
    <head>
    <title>FakeNewsFighters</title>
        `;
      html_content += `
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@Iman1Web">
        <meta name="twitter:creator" content="@Iman1Web">
        <meta name="twitter:title" content="Fake News Fighters!">
        <meta name="twitter:description" content="Help us fight misinformation and fake news by rating the accuracy of articles about topics that you are knowledgeable about.">
        <meta name="twitter:image" content="https://us-central1-visualexp-a7d2c.cloudfunctions.net/FakeNewsFighters/image.png">
        `;
      html_content += `
    </head>
    <body>
        <p>Help us fight misinformation and fake news by rating the accuracy of articles about topics that you are knowledgeable about.</p>
    </body>
</html>
        `;
      res.writeHeader(200, { "Content-Type": "text/html" });
      res.write(html_content);
      res.end();
      break;
    case "PUT":
      res.status(403).send("Forbidden!");
      break;
    default:
      res.status(405).send({ error: "Something blew up!" });
      break;
  }
};

const misinformationExpRec = async (reqHeaders) => {
  const misinformationExp = db.collection("misinformationExp").doc();
  await misinformationExp.set({
    time: new Date(),
    reqHeaders,
  });
};

exports.image = (req, res) => {
  switch (req.method) {
    case "GET":
      console.log("Opened direct message at :" + new Date());
      console.log({ headers: req.headers });
      misinformationExpRec(req.headers);

      const file = storage
        .bucket("visualexp-a7d2c.appspot.com")
        .file("fakenews.png");
      let readStream = file.createReadStream();

      res.setHeader("content-type", "image/png");
      readStream.pipe(res);
      break;
    case "PUT":
      res.status(403).send("Forbidden!");
      break;
    default:
      res.status(405).send({ error: "Something blew up!" });
      break;
  }
};
