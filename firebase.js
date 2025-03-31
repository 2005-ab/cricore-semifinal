import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6KfOUS6N_9ZBtTHoDUP14oxT3cRC26FU",
  authDomain: "cricore-1b189.firebaseapp.com",
  databaseURL: "https://cricore-1b189-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cricore-1b189",
  storageBucket: "cricore-1b189.appspot.com",
  messagingSenderId: "785333796414",
  appId: "1:785333796414:web:f28ed7ea85e1077527db6f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { database, ref, child, get, onValue, auth, db };
