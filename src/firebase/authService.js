import { auth } from "./config";

// Sign up with email and password
const signUp = async(email, password, userData) => {
    try {
        //Create Firebase user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password); 
        const user = userCredential.user;

        // Update user profile with display name

        await user.updateProfile({
            displayName: userData.name
        })

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.name,
                phone: userData.phone
            }
        }
    } catch (error) {
       console.log("Signup error", error);
       
       return {
        success: false,
        error: getAuthErrorMessage(error.code)
       }
    }
}

// Sign in with email and password
const signIn = async (email, password) => {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                phone: user.phoneNumber
            }
        }
    } catch (error) {
        console.log("Signin error", error);
        
        return {
            success: false,
            error: getAuthErrorMessage(error.code)
        }
    }
}

// Sign out

const signOut = async () => {
    try {
        await auth.signOut();
        return {
            success: true
        }
    } catch (error) {
        console.log("Signout error", error);
        
        return {
            success: false,
            error: getAuthErrorMessage(error.code)
        }
    }
}

// Reset password
const resetPassword = async (email) => {
    try {
        await auth.sendPasswordResetEmail(email);
        return {
            success: true
        }
    } catch (error) {
        console.log("Reset password error", error);
        
        return {
            success: false,
            error: getAuthErrorMessage(error.code)
        }
    }
}

// Get user
const getUser =  () => {
    return auth.currentUser;
}

// Listen to authentication state changes
const onAuthStateChanged = (callback) => {
    return auth.onAuthStateChanged(callback);
}


// Convert Firebase error codes ro user-friendly messages
const getAuthErrorMessage = (errorCode) => {
    switch(errorCode) {
        case 'auth/email-already-in-use':
            return "Email already registered";
        case 'auth/invalid-email':
            return "Invalid email address";
        case 'auth/weak-password':
            return "Password must be at least 6 characters";
        case 'auth/user-not-found':
            return 'No account found with this email';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/too-many-requests':
            return 'Too many requests. Please try again later';
        case 'auth/network-request-failed':
            return "Network error. Check your connection";
        case 'auth/invalid-credentials':
            return 'Invalid email or password';
        default:
            return 'An error occurred. Please try again later';
    }
}

export {
    getUser,
    onAuthStateChanged, resetPassword, signIn,
    signOut, signUp
};

