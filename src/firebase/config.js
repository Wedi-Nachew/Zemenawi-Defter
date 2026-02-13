import { initializeApp } from "@react-native-firebase/app";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore } from "@react-native-firebase/firestore";


// Initialize Firebase
const app = initializeApp();

// Initialize Auth
const auth = getAuth(app);
// Initialize Firestore
const firestore = getFirestore(app);

export default app;
export { auth, firestore };

