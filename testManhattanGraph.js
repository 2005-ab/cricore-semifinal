// testManhattanGraph.js
import { database, ref, child, get } from './firebase.js';

const matchId = "1354"; // Replace with an actual match ID from your Firebase data

// Build a reference to the ManhattanGraph data
const dbRef = ref(database);
get(child(dbRef, `matches/${matchId}/innings1/Innings1/ManhattanGraph`))
  .then((snapshot) => {
    if (snapshot.exists()) {
      console.log("ManhattanGraph data:", snapshot.val());
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
