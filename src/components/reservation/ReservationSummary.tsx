// src/components/reservation/ReservationSummary.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Reservation } from '@/types';
import { getReservation } from '@/lib/reservation';

interface ReservationSummaryProps {
	reservationNumber: string;
	onStartNewReservation?: () => void;
}

export default function ReservationSummary({
	reservationNumber,
	onStartNewReservation
}: ReservationSummaryProps) {
	const [reservation, setReservation] = useState<Reservation | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// モック用の予約データ
	const mockReservation = {
		seatId: 'A',
		startTime: new Date(),
		endTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2時間後
		price: 2000,
		isPaid: false
	};

	// 実装段階では、実際の予約データを取得する
	useEffect(() => {
		// 開発段階ではモックデータを使用
		setReservation(mockReservation as any);
		setIsLoading(false);

		// 実際の実装
		/*
		const fetchReservation = async () => {
		  setIsLoading(true);
		  try {
			const data = await getReservation(reservationId);
			setReservation(data);
		  } catch (error) {
			console.error('Error fetching reservation:', error);
		  } finally {
			setIsLoading(false);
		  }
		};
	    
		if (reservationId) {
		  fetchReservation();
		}
		*/
	}, [reservationNumber]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden">
			<div className="bg-green-500 p-4 text-white text-center">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-16 w-16 mx-auto mb-2"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M5 13l4 4L19 7"
					/>
				</svg>
				<h3 className="text-2xl font-bold">予約が確定しました</h3>
			</div>

			<div className="p-6">
				<div className="mb-6">
					<div className="text-center mb-4">
						<div className="text-sm text-gray-500">予約番号</div>
						<div className="text-3xl font-bold">{reservationNumber}</div>
					</div>

					<div className="bg-gray-50 p-4 rounded-md mb-4">
						<h4 className="font-semibold mb-2">予約内容</h4>
						{reservation && (
							<div className="space-y-1">
								<p><span className="font-medium">席:</span> {reservation.seatId}席</p>
								<p>
									<span className="font-medium">日時:</span>
									{format(reservation.startTime instanceof Date ? reservation.startTime : reservation.startTime.toDate(), 'yyyy年MM月dd日 HH:mm')} 〜
									{format(reservation.endTime instanceof Date ? reservation.endTime : reservation.endTime.toDate(), ' HH:mm')}
								</p>
								<p><span className="font-medium">料金:</span> {reservation.price.toLocaleString()}円</p>
								<p>
									<span className="font-medium">支払い状況:</span>
									{reservation.isPaid ? '支払い済み' : '未払い（当日店舗でお支払いください）'}
								</p>
							</div>
						)}
					</div>

					<div className="bg-yellow-50 p-4 rounded-md mb-6">
						<h4 className="font-semibold mb-2">ご利用案内</h4>
						<ul className="list-disc pl-5 space-y-1 text-sm">
							<li>予約時間の10分前から入店可能です</li>
							<li>予約番号は店舗スタッフにお伝えください</li>
							<li>キャンセルは予約時間の24時間前まで可能です</li>
							<li>料金は店舗でお支払いください（QRコード決済または現金）</li>
						</ul>
					</div>

					<div className="text-sm text-gray-600 mb-6">
						予約確認メールを{reservation?.email || 'ご登録のメールアドレス'}へ送信しました。
						メールが届かない場合は、お手数ですがお問い合わせください。
					</div>
				</div>

				<div className="flex flex-col space-y-3">
					<Link
						href="/mypage"
						className="block w-full text-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
					>
						予約履歴を確認する
					</Link>

					{onStartNewReservation && (
						<button
							onClick={onStartNewReservation}
							className="w-full text-blue-600 py-2 rounded-md border border-blue-600 hover:bg-blue-50 transition"
						>
							新しい予約をする
						</button>
					)}
				</div>
			</div>
		</div>
	);
}