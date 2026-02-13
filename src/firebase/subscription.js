import { doc, getDoc, setDoc, updateDoc } from "@react-native-firebase/firestore";
import { firestore } from "./config";

// Create trial subscription for new user
const createTrialSubscription = async (uid) => {
    try {
        const subscriptionRef = doc(firestore, 'subscriptions', uid);
        const now = new Date();
        const trialEndDate = new Date(now.getTime() + (14 *24 * 60 * 60 * 1000)); // 14 days

        await setDoc(subscriptionRef, {
            plan: 'trial',
            licenseActive: true,
            cloudActive: true,
            startedAt: now,
            trialEndsAt: trialEndDate,
            licenseExpiresAt: trialEndDate,
            cloudExpiresAt: trialEndDate,
            lifetime: false,
            createdAt: now,
            updatedAt: now,
        })
       
        return {
            success: true
        }
    } catch (error) {
       console.log("Create trial subscription error", error) 
       return {
           success: false,
           error: "Failed to create trial subscription"
       }
    }
}

// Get subscription details
const getSubscription = async (uid) => {
    try {
        const subscriptionRef = doc(firestore, 'subscriptions', uid);
        const subscriptionDoc = await getDoc(subscriptionRef);

        if(subscriptionDoc.exists) {
            return {
                success: true,
                data: subscriptionDoc.data()
            }
        } else {
            return {
                success: false,
                error: "Subscription not found"
            }
        }
    } catch (error) {
        console.log("Get subscription error", error)
        return {
            success: false,
            error: "Failed to get subscription"
        }
    }
}

// Update subscription (admin only)
const updateSubscription = async (uid, updateData) => {
    try {
        const subscriptionRef = doc(firestore, 'subscriptions', uid);
        
        await updateDoc(subscriptionRef, {
            ...updateData,
            updatedAt: new Date()
        })

        return {
            success: true
        }
    } catch (error) {
        console.log("Update subscription error", error)
        return {
            success: false,
            error: "Failed to update subscription"
        }
    }
}

export { createTrialSubscription, getSubscription, updateSubscription };
