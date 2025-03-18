// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: process.env.NEXT_PUBLIC_APP_NAME || '店舗予約システム',
	description: '簡単に座席予約ができるオンラインシステム',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja">
			<body className={inter.className}>
				<AuthProvider>
					<div className="flex flex-col min-h-screen">
						<Navbar />
						<main className="flex-grow container mx-auto px-4 py-8">
							{children}
						</main>
						<Footer />
					</div>
					<ToastContainer
						position="top-right"
						autoClose={5000}
						hideProgressBar={false}
						newestOnTop
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						draggable
						pauseOnHover
					/>
				</AuthProvider>
			</body>
		</html>
	);
}