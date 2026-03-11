const admin = require("firebase-admin");
const serviceAccount = require("./ovanju---sytems-firebase-adminsdk-fbsvc-f3a7da6ead.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore
module.exports = db;
