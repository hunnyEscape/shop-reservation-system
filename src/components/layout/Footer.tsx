// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-gray-800 text-white py-8">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div>
						<h3 className="text-lg font-semibold mb-4">
							{process.env.NEXT_PUBLIC_APP_NAME || '店舗予約システム'}
						</h3>
						<p className="text-gray-300">
							簡単に座席予約ができるオンラインシステム
						</p>
					</div>

					<div>
						<h3 className="text-lg font-semibold mb-4">リンク</h3>
						<ul className="space-y-2">
							<li>
								<Link href="/" className="text-gray-300 hover:text-white">
									ホーム
								</Link>
							</li>
							<li>
								<Link href="/reservation" className="text-gray-300 hover:text-white">
									予約
								</Link>
							</li>
							<li>
								<Link href="/login" className="text-gray-300 hover:text-white">
									ログイン
								</Link>
							</li>
							<li>
								<Link href="/signup" className="text-gray-300 hover:text-white">
									新規登録
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h3 className="text-lg font-semibold mb-4">お問い合わせ</h3>
						<address className="not-italic text-gray-300">
							<p>〒XXX-XXXX</p>
							<p>東京都〇〇区〇〇町1-1-1</p>
							<p className="mt-2">メール: info@example.com</p>
							<p>電話: 03-XXXX-XXXX</p>
						</address>
					</div>
				</div>

				<div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
					<p>&copy; {currentYear} {process.env.NEXT_PUBLIC_APP_NAME || '店舗予約システム'} All Rights Reserved.</p>
				</div>
			</div>
		</footer>
	);
}