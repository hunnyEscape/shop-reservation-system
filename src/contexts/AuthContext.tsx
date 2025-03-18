'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
	User,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut as firebaseSignOut,
	onAuthStateChanged,
	sendPasswordResetEmail,
	updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '@/lib/firebase';
import { toast } from 'react-toastify';

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signUp: (email: string, password: string, displayName: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
	user: null,
	loading: true,
	signUp: async () => { },
	signIn: async () => { },
	signOut: async () => { },
	resetPassword: async () => { },
});

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});

		return unsubscribe;
	}, []);

	// 新規ユーザー登録
	const signUp = async (email: string, password: string, displayName: string) => {
		try {
			const userCredential = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			await updateProfile(user, { displayName });

			await setDoc(doc(firestore, 'users', user.uid), {
				email,
				displayName,
				createdAt: serverTimestamp(),
				lastLoginAt: serverTimestamp(),
				reservationCount: 0,
				reservationHistory: []
			});

			toast.success('アカウントが作成されました');
		} catch (error: any) {
			console.error('Sign up error:', error);
			let errorMessage = 'アカウント作成中にエラーが発生しました';

			if (error.code === 'auth/email-already-in-use') {
				errorMessage = 'このメールアドレスは既に使用されています';
			}

			toast.error(errorMessage);
			throw error;
		}
	};

	const signIn = async (email: string, password: string) => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;

			const userRef = doc(firestore, 'users', user.uid);
			await setDoc(userRef, {
				lastLoginAt: serverTimestamp()
			}, { merge: true });

			toast.success('ログインしました');
		} catch (error: any) {
			console.error('Sign in error:', error);
			let errorMessage = 'ログイン中にエラーが発生しました';

			if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
				errorMessage = 'メールアドレスまたはパスワードが正しくありません';
			}

			toast.error(errorMessage);
			throw error;
		}
	};

	const signOut = async () => {
		try {
			await firebaseSignOut(auth);
			toast.success('ログアウトしました');
		} catch (error) {
			console.error('Sign out error:', error);
			toast.error('ログアウト中にエラーが発生しました');
			throw error;
		}
	};

	const resetPassword = async (email: string) => {
		try {
			await sendPasswordResetEmail(auth, email);
			toast.success('パスワードリセットメールを送信しました');
		} catch (error) {
			console.error('Reset password error:', error);
			toast.error('パスワードリセットメール送信中にエラーが発生しました');
			throw error;
		}
	};

	return React.createElement(AuthContext.Provider, {
		value: {
			user,
			loading,
			signUp,
			signIn,
			signOut,
			resetPassword
		}
	}, children);
}