import { getApp, getApps, initializeApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp();

const authInstance = getAuth(app);
const firestoreInstance = getFirestore(app);

export default app;
export { authInstance as auth, firestoreInstance as firestore };
