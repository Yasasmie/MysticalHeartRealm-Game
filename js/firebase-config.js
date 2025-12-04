// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB9uKJQpT4yeQOG2bSF4M28cIuedAwg8sE",
  authDomain: "heartgame-1ef8d.firebaseapp.com",
  projectId: "heartgame-1ef8d",
  storageBucket: "heartgame-1ef8d.firebasestorage.app",
  messagingSenderId: "782776662947",
  appId: "1:782776662947:web:39c5e43f7dd59556be3816"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
