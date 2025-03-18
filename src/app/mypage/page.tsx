// src/app/mypage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { getUserReservations, cancelReservation } from '@/lib/reservation';
import { Reservation } from '@/types';

export default function MyPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
	const [isLoading, setIsLoading] = useState(true);

	// 認証チェック
	useEffect(() => {
		if (!loading && !user) {
			router.push('/login?redirect=mypage');
		}
	}, [user, loading, router]);

	// 予約データの取得
	useEffect(() => {
		const fetchReservations = async () => {
			if (!user) return;

			setIsLoading(true);
			try {
				// 実際の実装
				// const data = await getUserReservations(user.uid);

				// モックデータ
				const mockData: Reservation[] = [
					{
						id: 'mock-1',
						userId: user.uid,
						userName: user.displayName || '',
						email: user.email || '',
						seatId: 'A',
						startTime: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 明日
						endTime: new Date(new Date().getTime() + 26 * 60 * 60 * 1000),
						duration: 2,
						price: 2000,
						isPaid: false,
						paymentMethod: null,
						reservationNumber: 'ABC123',
						source: 'web',
						status: 'confirmed',
						createdAt: new Date(),
						updatedAt: new Date()
					},
					{
						id: 'mock-2',
						userId: user.uid,
						userName: user.displayName || '',
						email: user.email || '',
						seatId: 'B',
						startTime: new Date(new Date().getTime() - 48 * 60 * 60 * 1000), // 2日前
						endTime: new Date(new Date().getTime() - 46 * 60 * 60 * 1000),
						duration: 2,
						price: 3000,
						isPaid: true,
						paymentMethod: 'qr',
						reservationNumber: 'DEF456',
						source: 'web',
						status: 'completed',
						createdAt: new Date(new Date().getTime() - 72 * 60 * 60 * 1000),
						updatedAt: new Date(new Date().getTime() - 48 * 60 * 60 * 1000)
					}
				];

				setReservations(mockData);
			} catch (error) {
				console.error('Error fetching reservations:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchReservations();
	}, [user]);

	// 予約のキャンセル
	const handleCancelReservation = async (reservationId: string) => {
		if (!window.confirm('予約をキャンセルしてもよろしいですか？')) {
			return;
		}

		try {
			// 実際の実装
			// await cancelReservation(reservationId);

			// モック実装
			setReservations(prev =>
				prev.map(res =>
					res.id === reservationId ? { ...res, status: 'cancelled' } : res
				)
			);

			alert('予約がキャンセルされました');
		} catch (error) {
			console.error('Error cancelling reservation:', error);
			alert('予約のキャンセルに失敗しました');
		}
	};

	// 予約を現在と過去で分類
	const now = new Date();
	const upcomingReservations = reservations.filter(res => {
		const endTime = res.endTime instanceof Date ? res.endTime : res.endTime.toDate();
		return endTime > now && res.status !== 'cancelled';
	});

	const pastReservations = reservations.filter(res => {
		const endTime = res.endTime instanceof Date ? res.endTime : res.endTime.toDate();
		return endTime <= now || res.status === 'cancelled';
	});

	// 予約の表示
	const renderReservation = (reservation: Reservation) => {
		const startTime = reservation.startTime instanceof Date
			? reservation.startTime
			: reservation.startTime.toDate();

		const endTime = reservation.endTime instanceof Date
			? reservation.endTime
			: reservation.endTime.toDate();

		// キャンセル可能かどうか（予約開始の24時間前まで）
		const canCancel = startTime.getTime() - now.getTime() > 24 * 60 * 60 * 1000
			&& reservation.status === 'confirmed';

		return (
			<div key={reservation.id} className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
				<div className="border-b px-4 py-3 flex justify-between items-center">
					<div>
						<span className="font-semibold">予約番号: {reservation.reservationNumber}</span>
					</div>
					<div>
						{reservation.status === 'confirmed' && (
							<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">確定</span>
						)}
						{reservation.status === 'completed' && (
							<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">完了</span>
						)}
						{reservation.status === 'cancelled' && (
							<span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">キャンセル</span>
						)}
					</div>
				</div>

				<div className="p-4">
					<div className="mb-4">
						<p className="text-lg font-semibold mb-1">{reservation.seatId}席</p>
						<p className="text-gray-600">
							{format(startTime, 'yyyy年MM月dd日 HH:mm')} 〜 {format(endTime, 'HH:mm')}
							<span className="ml-2 text-sm">({reservation.duration}時間)</span>
						</p>
					</div>

					<div className="flex justify-between items-center text-sm">
						<div>
							<p>料金: {reservation.price.toLocaleString()}円</p>
							<p>
								支払い:
								{reservation.isPaid
									? ' 済み'
									: ' 未払い（当日店舗でお支払いください）'}
							</p>
						</div>

						{canCancel && (
							<button
								onClick={() => handleCancelReservation(reservation.id)}
								className="text-red-600 hover:text-red-800 underline"
							>
								キャンセル
							</button>
						)}
					</div>
				</div>
			</div>
		);
	};

	if (loading || (!user && !loading)) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto">
			<h1 className="text-3xl font-bold mb-6">マイページ</h1>

			<div className="bg-white rounded-lg shadow-md p-6 mb-6">
				<h2 className="text-xl font-semibold mb-4">アカウント情報</h2>
				<div className="space-y-2">
					<p><span className="font-medium">名前:</span> {user?.displayName}</p>
					<p><span className="font-medium">メールアドレス:</span> {user?.email}</p>
				</div>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-4">予約履歴</h2>

				<div className="flex border-b mb-4">
					<button
						className={`py-2 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
						onClick={() => setActiveTab('upcoming')}
					>
						今後の予約
					</button>
					<button
						className={`py-2 px-4 ${activeTab === 'past' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
						onClick={() => setActiveTab('past')}
					>
						過去の予約
					</button>
				</div>

				{isLoading ? (
					<div className="flex justify-center items-center h-32">
						<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
					</div>
				) : (
					<div>
						{activeTab === 'upcoming' && (
							<>
								{upcomingReservations.length > 0 ? (
									upcomingReservations.map(renderReservation)
								) : (
									<div className="text-center py-8 bg-gray-50 rounded-lg">
										<p className="text-gray-500">今後の予約はありません</p>
										<button
											onClick={() => router.push('/reservation')}
											className="mt-4 text-blue-600 hover:text-blue-800 underline"
										>
											新しい予約をする
										</button>
									</div>
								)}
							</>
						)}

						{activeTab === 'past' && (
							<>
								{pastReservations.length > 0 ? (
									pastReservations.map(renderReservation)
								) : (
									<div className="text-center py-8 bg-gray-50 rounded-lg">
										<p className="text-gray-500">過去の予約はありません</p>
									</div>
								)}
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
}