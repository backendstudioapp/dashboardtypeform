import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
    id: string;
    user: string; // Changed from name to user to match DB
    role: 'admin' | 'closer';
    name?: string; // Optional fallback
    email?: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    customLogin: (profileData: Profile) => void;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    customLogin: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for custom stored user first (priority to the user's manual system)
        const stored = localStorage.getItem('custom_auth_user');
        if (stored) {
            try {
                setProfile(JSON.parse(stored));
                setLoading(false);
            } catch (e) {
                localStorage.removeItem('custom_auth_user');
            }
        }

        // Check active sessions (Supabase fallback)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                fetchProfile(session.user.id);
            } else if (!stored) {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setSession(session);
                setUser(session.user);
                fetchProfile(session.user.id);
            } else if (!localStorage.getItem('custom_auth_user')) {
                // Only clear if no custom user
                setProfile(null);
                setSession(null);
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
        setUser(null);
        localStorage.removeItem('custom_auth_user');
    };

    const customLogin = (profileData: Profile) => {
        setProfile(profileData);
        // Persist "fake" login
        localStorage.setItem('custom_auth_user', JSON.stringify(profileData));
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut, customLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
