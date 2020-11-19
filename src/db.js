require("dotenv").config();

const firebase = require("firebase");
var FIREBASE_CONFIG = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DB_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE,
  messagingSenderId: process.env.MSG_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.M_ID,
};

firebase.initializeApp(FIREBASE_CONFIG);

const db = firebase.firestore();
db.settings({ timestampsInSnapshots: true });

teamRegister = async (teamName, teamId) => {
  const resp = await db
    .collection("teams")
    .where("teamname", "==", teamName)
    .get();
  if (resp.empty) {
    db.collection("teams")
      .add({
        teamname: teamName,
        teamid: teamId,
      })
      .then((res) => {
        console.log("Team added with ID: ", res.id);
      });
  } else {
    resp.forEach((document) => {
      console.log("Team Already Registered");
      db.collection("teams")
        .doc(document.id)
        .set({
          teamname: teamName,
          teamid: teamId,
        })
        .then((res) => {
          console.log("Team updated with ID: ");
        });
    });
  }
};

getTeamId = async (teamName) => {
  const resp = await db
    .collection("teams")
    .where("teamname", "==", teamName)
    .get();
  if (resp.empty) {
    console.log("Team not registered!");
    return null;
  } else {
    let teamId = null;
    await resp.forEach((doc) => {
      console.log("Team");
      teamId = doc.data().teamid;
    });

    console.log(teamId);
    return teamId;
  }
};

module.exports = { teamRegister, getTeamId };
