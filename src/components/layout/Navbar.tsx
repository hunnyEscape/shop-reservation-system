// src/components/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const pathname = usePathname();
	const { user, signOut } = useAuth();

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	const closeMenu = () => {
		setIsMenuOpen(false);
	};

	return (
		<nav className="bg-white shadow-md">
			<div className="container mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/" className="text-xl font-bold text-gray-800">
								{process.env.NEXT_PUBLIC_APP_NAME || '店舗予約システム'}
							</Link>
						</div>
					</div>

					{/* デスクトップメニュー */}
					<div className="hidden md:flex md:items-center md:space-x-4">
						<Link
							href="/"
							className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/'
									? 'text-blue-600'
									: 'text-gray-600 hover:text-blue-600'
								}`}
						>
							ホーム
						</Link>
						<Link
							href="/reservation"
							className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/reservation')
									? 'text-blue-600'
									: 'text-gray-600 hover:text-blue-600'
								}`}
						>
							予約
						</Link>
						{user ? (
							<>
								<Link
									href="/mypage"
									className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/mypage')
											? 'text-blue-600'
											: 'text-gray-600 hover:text-blue-600'
										}`}
								>
									マイページ
								</Link>
								<button
									onClick={signOut}
									className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600"
								>
									ログアウト
								</button>
							</>
						) : (
							<>
								<Link
									href="/login"
									className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/login'
											? 'text-blue-600'
											: 'text-gray-600 hover:text-blue-600'
										}`}
								>
									ログイン
								</Link>
								<Link
									href="/signup"
									className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
								>
									新規登録
								</Link>
							</>
						)}
					</div>

					{/* モバイルメニューボタン */}
					<div className="md:hidden flex items-center">
						<button
							onClick={toggleMenu}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-blue-600 focus:outline-none"
							aria-expanded="false"
						>
							<span className="sr-only">メニューを開く</span>
							<svg
								className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
							<svg
								className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* モバイルメニュー */}
			<div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
				<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
					<Link
						href="/"
						className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/'
								? 'text-blue-600'
								: 'text-gray-600 hover:text-blue-600'
							}`}
						onClick={closeMenu}
					>
						ホーム
					</Link>
					<Link
						href="/reservation"
						className={`block px-3 py-2 rounded-md text-base font-medium ${pathname.startsWith('/reservation')
								? 'text-blue-600'
								: 'text-gray-600 hover:text-blue-600'
							}`}
						onClick={closeMenu}
					>
						予約
					</Link>
					{user ? (
						<>
							<Link
								href="/mypage"
								className={`block px-3 py-2 rounded-md text-base font-medium ${pathname.startsWith('/mypage')
										? 'text-blue-600'
										: 'text-gray-600 hover:text-blue-600'
									}`}
								onClick={closeMenu}
							>
								マイページ
							</Link>
							<button
								onClick={() => {
									signOut();
									closeMenu();
								}}
								className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600"
							>
								ログアウト
							</button>
						</>
					) : (
						<>
							<Link
								href="/login"
								className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === '/login'
										? 'text-blue-600'
										: 'text-gray-600 hover:text-blue-600'
									}`}
								onClick={closeMenu}
							>
								ログイン
							</Link>
							<Link
								href="/signup"
								className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
								onClick={closeMenu}
							>
								新規登録
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}