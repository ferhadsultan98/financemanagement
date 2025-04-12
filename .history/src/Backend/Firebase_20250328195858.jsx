import { initializeApp } from "firebase/app";

// Firestore importları - username, password verilerini burada saklayabilirsiniz.
import { getFirestore, addDoc } from "firebase/firestore";

// Realtime Database importları - diğer veriler burada saklanabilir.
import { getDatabase, ref, get, set, onValue, doc, getDoc, setDoc, onSnapshot, c, collection, getDocs } from "firebase/database"; 

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

// Firestore ve Realtime Database bağlantıları
const db = getFirestore(app); // Firestore için
const realtimeDb = getDatabase(app); // Realtime Database için

export { db, doc, getDoc, setDoc, onSnapshot, addDoc, collection, getDocs, realtimeDb, ref, get, set, onValue };
