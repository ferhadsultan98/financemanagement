import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAR0AEzZVBXrycuhzCVyGru8n4YjIBoPak",
  authDomain: "financemanagement-a4157.firebaseapp.com",
  projectId: "financemanagement-a4157",
  storageBucket: "financemanagement-a4157.firebasestorage.app",
  messagingSenderId: "568773433550",
  appId: "1:568773433550:web:181c6b76416d205023989f",
  measurementId: "G-7QLF7ZCEDJ",
  databaseURL: "https://financemanagement-a4157-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);

export default app;
