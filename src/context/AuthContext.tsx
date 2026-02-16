import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type UserRole = 'member';

interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signup: (name: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>((() => {
        const saved = localStorage.getItem('forsee_user');
        return saved ? JSON.parse(saved) : null;
    })());

    const [isLoading, setIsLoading] = useState(true);

    const syncUserWithDb = async (userData: User) => {
        try {
            await fetch('http://localhost:5000/api/users/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid: userData.id,
                    name: userData.name,
                    email: userData.email,
                    avatarUrl: userData.avatarUrl
                })
            });
        } catch (error) {
            console.error("Failed to sync user with MongoDB:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                const mappedUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    avatarUrl: firebaseUser.photoURL || undefined
                };
                setUserState(mappedUser);
                localStorage.setItem('forsee_user', JSON.stringify(mappedUser));
                // Sync with DB
                await syncUserWithDb(mappedUser);
            } else {
                setUserState(null);
                localStorage.removeItem('forsee_user');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signup = async (name: string, email: string, password: string) => {
        const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(firebaseUser, { displayName: name });
        const mappedUser: User = {
            id: firebaseUser.uid,
            name,
            email,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
        };
        setUserState(mappedUser);
        localStorage.setItem('forsee_user', JSON.stringify(mappedUser));
        await syncUserWithDb(mappedUser);
    };

    const login = async (email: string, password: string) => {
        const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
        const mappedUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || undefined
        };
        setUserState(mappedUser);
        localStorage.setItem('forsee_user', JSON.stringify(mappedUser));
        await syncUserWithDb(mappedUser);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const { user: firebaseUser } = await signInWithPopup(auth, provider);
        const mappedUser: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            avatarUrl: firebaseUser.photoURL || undefined
        };
        setUserState(mappedUser);
        localStorage.setItem('forsee_user', JSON.stringify(mappedUser));
        await syncUserWithDb(mappedUser);
    };

    const logout = async () => {
        await signOut(auth);
        setUserState(null);
        localStorage.removeItem('forsee_user');
        localStorage.removeItem('forsee_access_token');
        localStorage.removeItem('forsee_role');
    };

    const setUser = (user: User) => {
        setUserState(user);
        localStorage.setItem('forsee_user', JSON.stringify(user));
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            signup,
            login,
            loginWithGoogle,
            logout,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
