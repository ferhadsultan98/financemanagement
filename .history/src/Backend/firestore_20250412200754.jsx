import app from "./Firebase";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  addDoc,
  collection,
  getDocs,
  updateDoc
} from "firebase/firestore";

const db = getFirestore(app);

export {
  db,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  addDoc,
  collection,
  getDocs,
  updateDoc
};
