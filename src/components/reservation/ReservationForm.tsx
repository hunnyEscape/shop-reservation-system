// src/components/reservation/ReservationForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { ReservationFormData, SeatId } from '@/types';
import { createReservation, calculateTimeRange, calculatePrice, getSeatInfo } from '@/lib/reservation';
import { Timestamp } from 'firebase/firestore';

interface ReservationFormProps {
	date: Date;
	seatId: SeatId;
	startTime: string;
	duration: number;
	onSubmit: (reservationId: string) => void;
}

// バリデーションスキーマ
const reservationSchema = z.object({
	userName: z.string().min(1, '名前を入力してください'),
	email: z.string().email('有効なメールアドレスを入力してください'),
	phoneNumber: z.string().optional(),
	agreeToTerms: z.boolean().refine(val => val === true, {
		message: '利用規約に同意する必要があります',
	}),
});

export default function ReservationForm({ date, seatId, startTime, duration, onSubmit }: ReservationFormProps) {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [price, setPrice] = useState(0);
	const [seatInfo, setSeatInfo] = useState<any>(null);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<z.infer<typeof reservationSchema>>({
		resolver: zodResolver(reservationSchema),
		defaultValues: {
			userName: '',
			email: '',
			phoneNumber: '',
			agreeToTerms: false,
		},
	});

	// 席情報と料金の取得
	useEffect(() => {
		const fetchSeatInfo = async () => {
			try {
				const info = await getSeatInfo(seatId);
				setSeatInfo(info);

				// 料金計算
				const calculatedPrice = calculatePrice(seatId, duration);
				setPrice(calculatedPrice);
			} catch (error) {
				console.error('Error fetching seat info:', error);
			}
		};

		fetchSeatInfo();
	}, [seatId, duration]);

	// ユーザー情報の自動入力
	useEffect(() => {
		if (user) {
			setValue('userName', user.displayName || '');
			setValue('email', user.email || '');
		}
	}, [user, setValue]);

	// フォーム送信ハンドラー
	const handleFormSubmit = async (data: z.infer<typeof reservationSchema>) => {
		if (!user) {
			alert('予約にはログインが必要です');
			return;
		}

		setIsLoading(true);

		try {
			// 時間の計算
			const { startTime: startDateTime, endTime: endDateTime } = calculateTimeRange(date, startTime, duration);

			// 予約データの作成
			const reservationData = {
				userId: user.uid,
				userName: data.userName,
				email: data.email,
				phoneNumber: data.phoneNumber || '',
				seatId,
				startTime: startDateTime,
				endTime: endDateTime,
				duration,
				price,
				isPaid: false,
				paymentMethod: null,
				source: 'web' as const,
				status: 'confirmed' as const,
				createdAt: Timestamp.now(),
				updatedAt: Timestamp.now(),
			};

			// 予約の作成
			const reservationId = await createReservation(reservationData);

			// 予約完了ハンドラー呼び出し
			onSubmit(reservationId);
		} catch (error) {
			console.error('Error submitting reservation:', error);
			alert('予約の作成中にエラーが発生しました。もう一度お試しください。');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="bg-white p-6 rounded-lg shadow-md mb-6">
			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-2">予約内容</h3>
				<div className="bg-gray-50 p-4 rounded-md">
					<p className="mb-1"><span className="font-medium">日付:</span> {format(date, 'yyyy年MM月dd日')}</p>
					<p className="mb-1"><span className="font-medium">席:</span> {seatId}席</p>
					<p className="mb-1"><span className="font-medium">時間:</span> {startTime} 〜 {format(new Date(`2000-01-01T${startTime}`), 'HH:mm')} ({duration}時間)</p>
					<p className="font-medium">
						料金: {price.toLocaleString()}円
						<span className="text-sm font-normal ml-2">
							({seatInfo?.pricePerHour.toLocaleString()}円 × {duration}時間)
						</span>
					</p>
				</div>
			</div>

			<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
				<div>
					<label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
						お名前 <span className="text-red-500">*</span>
					</label>
					<input
						id="userName"
						type="text"
						{...register('userName')}
						className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
					/>
					{errors.userName && (
						<p className="mt-1 text-sm text-red-600">{errors.userName.message}</p>
					)}
				</div>

				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
						メールアドレス <span className="text-red-500">*</span>
					</label>
					<input
						id="email"
						type="email"
						{...register('email')}
						className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
					/>
					{errors.email && (
						<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
					)}
				</div>

				<div>
					<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
						電話番号 (任意)
					</label>
					<input
						id="phoneNumber"
						type="tel"
						{...register('phoneNumber')}
						className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						placeholder="例: 090-1234-5678"
						disabled={isLoading}
					/>
				</div>

				<div className="bg-yellow-50 p-4 rounded-md">
					<h4 className="font-medium mb-2">支払い方法</h4>
					<p className="text-sm text-gray-700">
						お支払いは当日店舗にて承ります。以下の支払い方法がご利用いただけます。
					</p>
					<ul className="text-sm text-gray-700 list-disc pl-5 mt-2">
						<li>QRコード決済 (PayPay, LINE Pay等)</li>
						<li>現金</li>
					</ul>
				</div>

				<div className="flex items-start">
					<div className="flex items-center h-5">
						<input
							id="agreeToTerms"
							type="checkbox"
							{...register('agreeToTerms')}
							className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							disabled={isLoading}
						/>
					</div>
					<div className="ml-3 text-sm">
						<label htmlFor="agreeToTerms" className="text-gray-700">
							<a href="/terms" className="text-blue-600 hover:text-blue-500">
								利用規約
							</a>
							と
							<a href="/privacy" className="text-blue-600 hover:text-blue-500">
								キャンセルポリシー
							</a>
							に同意します
						</label>
						{errors.agreeToTerms && (
							<p className="mt-1 text-sm text-red-600">{errors.agreeToTerms.message}</p>
						)}
					</div>
				</div>

				<div>
					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? '予約処理中...' : '予約を確定する'}
					</button>
				</div>
			</form>
		</div>
	);
}