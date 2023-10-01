const admin = require("firebase-admin");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "../", ".env")
});

const serviceAccount = {
  type: process.env.VISUALEXPCRED_TYPE,
  project_id: process.env.VISUALEXP_PROJECT_ID,
  private_key_id: process.env.VISUALEXPCRED_PRIVATE_KEY_ID,
  private_key: process.env.VISUALEXPCRED_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.VISUALEXPCRED_CLIENT_EMAIL,
  client_id: process.env.VISUALEXPCRED_CLIENT_ID,
  auth_uri: process.env.VISUALEXPCRED_AUTH_URI,
  token_uri: process.env.VISUALEXPCRED_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.VISUALEXPCRED_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.VISUALEXPCRED_CLIENT_X509_CERT_URL
};

const app = admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://visualexp-a7d2c-default-rtdb.firebaseio.com/"
  },
  "visualexp"
);
const dbReal = app.database();

module.exports = {
  dbReal
};
