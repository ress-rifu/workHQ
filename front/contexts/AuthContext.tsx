import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface UserProfile {
	id: string;
	email: string;
	fullName: string;
	role: "ADMIN" | "HR" | "EMPLOYEE";
	avatarUrl: string | null;
	employee?: {
		id: string;
		employeeCode: string;
		department: string | null;
		designation: string | null;
		joinDate: string;
		salary: number | null;
	};
}

interface AuthContextType {
	session: Session | null;
	user: User | null;
	profile: UserProfile | null;
	loading: boolean;
	signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
	signOut: () => Promise<void>;
	signUp: (
		email: string,
		password: string,
		fullName: string
	) => Promise<{ error: Error | null }>;
	resetPassword: (email: string) => Promise<{ error: Error | null }>;
	fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Get initial session with timeout
		const initAuth = async () => {
			console.log('🔐 Initializing auth...');
			try {
				// Set a timeout to prevent infinite loading
				const timeoutId = setTimeout(() => {
					console.warn('⚠️ Auth initialization timeout - continuing without session');
					setLoading(false);
				}, 3000);

				const { data: { session }, error } = await supabase.auth.getSession();

				clearTimeout(timeoutId);

				if (error) {
					console.error('❌ Auth error:', error.message);
					setLoading(false);
					return;
				}

				console.log('✅ Session loaded:', session ? 'Authenticated' : 'Not authenticated');
				setSession(session);
				setUser(session?.user ?? null);
				
				if (session) {
					await fetchProfile();
				} else {
					setLoading(false);
				}
			} catch (error: any) {
				console.error('❌ Auth initialization error:', error.message);
				setLoading(false);
			}
		};

		initAuth();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setUser(session?.user ?? null);
			if (session) {
				fetchProfile();
			} else {
				setProfile(null);
				setLoading(false);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const fetchProfile = async () => {
		console.log('👤 Fetching profile...');
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				console.log('❌ No session available');
				setProfile(null);
				setLoading(false);
				return;
			}

			// Check if backend API is configured
			if (!process.env.EXPO_PUBLIC_BACKEND_API_URL) {
				console.warn("⚠️ Backend API URL not configured - skipping profile");
				setLoading(false);
				return;
			}

			console.log('📡 Fetching profile from backend...');

			const response = await fetch(
				`${process.env.EXPO_PUBLIC_BACKEND_API_URL}/api/auth/profile`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.ok) {
				const data = await response.json();
				console.log('✅ Profile loaded:', data.user?.email);
				setProfile(data.user);
			} else {
				const errorText = await response.text();
				console.error("❌ Failed to fetch profile:", response.status, errorText);

				// Don't block auth if profile fetch fails
				// User is still authenticated via Supabase
			}
		} catch (error: any) {
			console.error("❌ Error fetching profile:", error.message);
			// Don't block auth if profile fetch fails
		} finally {
			console.log('✅ Setting loading to false');
			setLoading(false);
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			console.log('🔐 Starting sign in...');
			console.log('📧 Email:', email);
			console.log('🔑 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
			console.log('🔑 Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
			console.log('🔑 Supabase Key preview:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
			
			const { error, data } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			console.log('✅ Sign in response:', { error: error?.message, hasUser: !!data?.user });

			if (error) throw error;

			return { error: null };
		} catch (error: any) {
			console.error('❌ Sign in error:', error.message);
			console.error('❌ Full error:', JSON.stringify(error, null, 2));
			return { error };
		}
	};

	const signOut = async () => {
		await supabase.auth.signOut();
		setProfile(null);
	};

	const signUp = async (email: string, password: string, fullName: string) => {
		try {
			// Note: This is a simplified signup. In production, you'd call your backend
			// to create the user with proper employee setup
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						full_name: fullName,
					},
				},
			});

			if (error) throw error;

			return { error: null };
		} catch (error: any) {
			return { error };
		}
	};

	const resetPassword = async (email: string) => {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: "workhq://reset-password",
			});

			if (error) throw error;

			return { error: null };
		} catch (error: any) {
			return { error };
		}
	};

	const value = {
		session,
		user,
		profile,
		loading,
		signIn,
		signOut,
		signUp,
		resetPassword,
		fetchProfile,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
