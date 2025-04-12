import app from "./firebaseConfig";
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
  child
} from "firebase/database";

const realtimeDb = getDatabase(app);

export {
  realtimeDb,
  ref,
  get,
  set,
  onValue,
  child
};
