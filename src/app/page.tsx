// src/app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
	return (
		<div>
			{/* ヒーローセクション */}
			<section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 rounded-lg mb-12">
				<div className="container mx-auto px-4 text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-6">
						シンプルで簡単な座席予約システム
					</h1>
					<p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
						オンラインで簡単に席を予約。好きな時間に、好きな席を確保できます。
					</p>
					<Link
						href="/reservation"
						className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-50 transition duration-300"
					>
						今すぐ予約する
					</Link>
				</div>
			</section>

			{/* 特徴セクション */}
			<section className="py-12 mb-12">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">サービスの特徴</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-white p-6 rounded-lg shadow-md">
							<div className="text-blue-500 text-5xl mb-4 flex justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2 text-center">簡単予約</h3>
							<p className="text-gray-600">
								数クリックで3ヶ月先まで予約可能。カレンダーから日時を選ぶだけの簡単操作。
							</p>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-md">
							<div className="text-blue-500 text-5xl mb-4 flex justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2 text-center">リアルタイム空き状況</h3>
							<p className="text-gray-600">
								常に最新の空き状況を確認できるので、人気の時間帯もスムーズに予約。
							</p>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-md">
							<div className="text-blue-500 text-5xl mb-4 flex justify-center">
								<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold mb-2 text-center">簡単決済</h3>
							<p className="text-gray-600">
								QRコード決済や現金など、お好みの方法で簡単に支払いが可能。
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* 座席紹介セクション */}
			<section className="py-12 bg-gray-50 rounded-lg mb-12">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">利用可能な座席</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
							<div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
								<span className="text-3xl font-bold text-gray-500">席 A</span>
							</div>
							<h3 className="text-xl font-semibold mb-2">A席 (1〜2名向け)</h3>
							<p className="text-gray-600 mb-4">
								静かな環境で集中したい方におすすめ。窓側の明るい席です。
							</p>
							<p className="text-lg font-bold text-blue-600">¥1,000 / 時間</p>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
							<div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
								<span className="text-3xl font-bold text-gray-500">席 B</span>
							</div>
							<h3 className="text-xl font-semibold mb-2">B席 (2〜4名向け)</h3>
							<p className="text-gray-600 mb-4">
								グループワークに最適なミーティングスペース。ホワイトボード付き。
							</p>
							<p className="text-lg font-bold text-blue-600">¥1,500 / 時間</p>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
							<div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center">
								<span className="text-3xl font-bold text-gray-500">席 C</span>
							</div>
							<h3 className="text-xl font-semibold mb-2">C席 (4〜6名向け)</h3>
							<p className="text-gray-600 mb-4">
								大人数でのミーティングや勉強会に最適な広々とした席。
							</p>
							<p className="text-lg font-bold text-blue-600">¥2,000 / 時間</p>
						</div>
					</div>
				</div>
			</section>

			{/* 利用案内セクション */}
			<section className="py-12 mb-12">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold text-center mb-12">ご利用案内</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h3 className="text-xl font-semibold mb-4 border-b pb-2">営業時間</h3>
							<ul className="space-y-2">
								<li className="flex justify-between">
									<span>月曜日 - 金曜日</span>
									<span>9:00 - 22:00</span>
								</li>
								<li className="flex justify-between">
									<span>土曜日・日曜日</span>
									<span>10:00 - 20:00</span>
								</li>
								<li className="flex justify-between">
									<span>祝日</span>
									<span>10:00 - 19:00</span>
								</li>
							</ul>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-md">
							<h3 className="text-xl font-semibold mb-4 border-b pb-2">ご予約について</h3>
							<ul className="list-disc pl-5 space-y-2 text-gray-600">
								<li>予約は1時間単位で、最大8時間まで連続予約可能です</li>
								<li>予約の変更・キャンセルは利用開始の24時間前まで可能です</li>
								<li>予約時間を超過した場合は、追加料金が発生します</li>
								<li>店舗での予約も可能です（空き状況による）</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* CTAセクション */}
			<section className="bg-blue-600 text-white py-12 rounded-lg text-center">
				<div className="container mx-auto px-4">
					<h2 className="text-3xl font-bold mb-6">今すぐ予約をスタート</h2>
					<p className="text-xl mb-8 max-w-2xl mx-auto">
						簡単に予約ができる、直感的な予約システムをぜひお試しください。
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link
							href="/reservation"
							className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-blue-50 transition duration-300"
						>
							予約する
						</Link>
						<Link
							href="/signup"
							className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-white hover:text-blue-600 transition duration-300"
						>
							アカウント作成
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}