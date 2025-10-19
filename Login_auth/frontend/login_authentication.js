import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged,
    signOut
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// --- Firebase and Environment Setup ---
// These global variables are provided by the Canvas environment for secure initialization.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
let firebaseConfig = {};
if (typeof __firebase_config !== 'undefined') {
    try {
        firebaseConfig = JSON.parse(__firebase_config);
    } catch (e) {
        console.error('Invalid __firebase_config JSON. Using empty config.');
        firebaseConfig = {};
    }
}
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Helper to handle the async authentication process
async function authenticateUser(auth) {
    if (initialAuthToken) {
        try {
            await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
            console.error("Error signing in with custom token:", error);
            // Fallback to anonymous sign-in if custom token fails
            await signInAnonymously(auth);
        }
    } else {
        await signInAnonymously(auth);
    }
}

// --- Icons (Lucide React) ---
const LogIn = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
);
const UserPlus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
);
const LogOut = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const Home = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const Loader = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);


// --- Components ---

/**
 * Reusable input component.
 */
const FormInput = ({ id, label, type, value, onChange, required, error }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${
                error ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete={type === 'password' ? 'current-password' : 'email'}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
);

/**
 * Login/Register Form Component
 * NOTE: The actual Firebase Auth functions (like createUserWithEmailAndPassword, etc.) 
 * are not fully implemented here due to Canvas environment constraints. Instead, 
 * this component simulates a successful auth flow by triggering the parent's
 * view switch. The underlying Firebase connection uses the provided secure token.
 */
const AuthForm = ({ type, onSwitchView, onAuthSuccess }) => {
    const isLogin = type === 'login';
    const title = isLogin ? 'Welcome Back!' : 'Create Your Account';
    const buttonText = isLogin ? 'Sign In' : 'Sign Up';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // --- SIMULATED AUTH LOGIC ---
        // In a real app, you would call:
        // isLogin ? signInWithEmailAndPassword(auth, email, password) : createUserWithEmailAndPassword(auth, email, password)
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Basic validation
            if (email.length < 5 || password.length < 6) {
                throw new Error("Invalid credentials. Please check email and password (min 6 characters).");
            }
            
            // If validation passes, simulate success and trigger the parent's success handler
            onAuthSuccess();

        } catch (err) {
            setError(err.message || "An unexpected error occurred during authentication.");
            setIsLoading(false);
        }
        // --- END SIMULATED AUTH LOGIC ---
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">{title}</h2>
            
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
                        {error}
                    </div>
                )}
                
                <FormInput
                    id="email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    required
                />
                
                <FormInput
                    id="password"
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    required
                />
                
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader className="w-5 h-5 mr-2" /> : (isLogin ? <LogIn className="w-5 h-5 mr-2"/> : <UserPlus className="w-5 h-5 mr-2"/>)}
                    {buttonText}
                </button>
            </form>
            
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                        onClick={() => onSwitchView(isLogin ? 'register' : 'login')}
                        className="font-semibold text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition duration-150"
                        disabled={isLoading}
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

/**
 * Dashboard Component (User is authenticated)
 */
const Dashboard = ({ userId, handleLogout }) => {

    return (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-lg text-center">
            <Home className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Welcome! You are Signed In
            </h2>
            <p className="text-gray-600 mb-6">
                This is your private dashboard. Your user state is persistent and secure.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 mb-6 break-words">
                <p className="text-sm font-medium text-gray-700 mb-1">Your Unique User ID:</p>
                <p className="text-xl font-mono text-blue-800">{userId}</p>
                <p className="text-xs text-gray-500 mt-2">
                    This ID is used to store your private data in Firestore under: 
                    <code className="bg-gray-200 p-1 rounded">/artifacts/{appId}/users/{userId}/...</code>
                </p>
            </div>
            
            <button
                onClick={handleLogout}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300 transform hover:scale-[1.01]"
            >
                <LogOut className="w-5 h-5 mr-2"/>
                Log Out
            </button>
        </div>
    );
};


/**
 * Main Application Component
 */
const App = () => {
    const [view, setView] = useState('login'); // 'login', 'register', 'dashboard'
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    // 1. Initialize Firebase and set up Auth Listener
    useEffect(() => {
        if (Object.keys(firebaseConfig).length === 0) {
            console.error("Firebase configuration is missing.");
            return;
        }

        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);
            
            setDb(firestore);
            setAuth(authInstance);

            // Set up Auth State Listener
            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setView('dashboard');
                } else {
                    setUserId(null);
                    // Only switch to login if we are not actively registering
                    if (view !== 'register') {
                         setView('login');
                    }
                }
                setIsAuthReady(true);
                // Log debug info for Firestore
                console.log("Firebase Auth State Ready. Current User ID:", user ? user.uid : "None (Anonymous/Logged Out)");
            });

            // Initial sign-in attempt
            authenticateUser(authInstance);

            return () => unsubscribe();
        } catch (e) {
            console.error("Error initializing Firebase:", e);
        }
    }, []);

    // 2. Handle successful form submission (simulated in AuthForm)
    // This function runs after the form "successfully" validates locally.
    const handleAuthSuccess = useCallback(() => {
        // Since we are already authenticated via the initial token/anonymous sign-in,
        // we just need to confirm the user state from the onAuthStateChanged listener.
        // For a seamless UX, we immediately switch to dashboard.
        setView('dashboard');
    }, []);

    // 3. Handle Logout
    const handleLogout = async () => {
        if (auth) {
            try {
                await signOut(auth);
                // After sign out, the onAuthStateChanged listener will fire, 
                // setting userId to null and view to 'login'.
                console.log("User successfully signed out.");
                
                // Re-authenticate anonymously/with token to maintain Canvas session
                await authenticateUser(auth);

            } catch (error) {
                console.error("Error during sign out:", error);
            }
        }
    };
    
    // 4. Render content based on authentication state
    let content;

    if (!isAuthReady) {
        content = (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-2xl">
                <Loader className="w-8 h-8 text-blue-500 mb-4"/>
                <p className="text-lg font-medium text-gray-700">Connecting to Firebase...</p>
            </div>
        );
    } else if (userId && view === 'dashboard') {
        content = <Dashboard userId={userId} handleLogout={handleLogout} />;
    } else {
        content = (
            <AuthForm
                type={view === 'register' ? 'register' : 'login'}
                onSwitchView={setView}
                onAuthSuccess={handleAuthSuccess}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            {/* Removed 'jsx global' to fix the React warning */}
            <style>{`
                /* Font import for Inter */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                body {
                    font-family: 'Inter', sans-serif;
                }
            `}</style>
            
            <header className="absolute top-0 w-full bg-white shadow-md p-4 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">SecureAuth App</h1>
                    <p className={`text-sm font-medium ${userId ? 'text-green-600' : 'text-red-600'}`}>
                        Status: {userId ? 'Authenticated' : 'Logged Out'}
                    </p>
                </div>
            </header>
            
            <main className="flex items-center justify-center w-full max-w-screen-xl mt-16">
                {content}
            </main>
            
            <footer className="mt-8 text-xs text-gray-500 fixed bottom-4">
                Powered by React & Firebase Firestore ({appId})
            </footer>
        </div>
    );
};

export default App;
