import { doc, getDoc, setDoc, updateDoc } from "@react-native-firebase/firestore";
import { firestore } from "./config";

// Create user profile in FireStore
const createUserProfile = async (uid, userData) => {
    try {
        const userRef = doc(firestore(), 'users', uid);
        const now = new Date();
        
        await setDoc(userRef, {
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            createdAt: now,
            updatedAt: now,
        })

        return {success: true}
    } catch (error) {
        console.log("Create user profile error", error)
        return {
            success: false,
            error: "Failed to create user profile"
        }
    }
}

// Get user profile
const getUserProfile = async (uid) => {
    try {
        const userRef = doc(firestore, 'users', uid);
        const userDoc = await getDoc(userRef);

        if(userDoc.exists) {
            return {
                success: true,
                data: userDoc.data()
            }
        } else {
            return {
                success: false,
                error: "User profile not found"
            }
        }
        
    } catch (error) {
        console.log("Get user profile error", error)
        return {
            success: false,
            error: "Failed to get user profile"
        }
    }
}

// Update user profile
const updateUserProfile = async(uid, updateData) => {
    try {
        const userRef = doc(firestore, 'users', uid);

        await updateDoc(userRef, {
            ...updateData,
            updatedAt: new Date()
        })
    
        return {
            success: true   
        }
    } catch (error) {
        console.log("Update user profile error", error)
        return {
            success: false,
            error: "Failed to update user profile"
        }
    }
}

export { createUserProfile, getUserProfile, updateUserProfile };

