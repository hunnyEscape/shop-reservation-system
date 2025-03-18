// src/app/reservation/page.tsx
'use client';

import { useState } from 'react';
import Calendar from '@/components/reservation/Calendar';
import TimeSlotsGrid from '@/components/reservation/TimeSlotsGrid';
import ReservationForm from '@/components/reservation/ReservationForm';
import ReservationSummary from '@/components/reservation/ReservationSummary';
import { SeatId } from '@/types';

// 予約ステップ
type ReservationStep = 'date-selection' | 'time-selection' | 'form-submission' | 'confirmation';

export default function ReservationPage() {
	// 現在の予約ステップ
	const [currentStep, setCurrentStep] = useState<ReservationStep>('date-selection');

	// 選択された日付
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);

	// 選択された席・時間枠
	const [selectedSeat, setSelectedSeat] = useState<SeatId | null>(null);
	const [selectedStartTime, setSelectedStartTime] = useState<string | null>(null);
	const [selectedDuration, setSelectedDuration] = useState<number>(1); // デフォルト1時間

	// 予約番号（予約完了時に設定）
	const [reservationNumber, setReservationNumber] = useState<string | null>(null);

	// 日付選択のハンドラー
	const handleDateSelect = (date: Date) => {
		setSelectedDate(date);
		setCurrentStep('time-selection');
	};

	// 時間枠選択のハンドラー
	const handleTimeSlotSelect = (seat: SeatId, startTime: string, duration: number) => {
		setSelectedSeat(seat);
		setSelectedStartTime(startTime);
		setSelectedDuration(duration);
		setCurrentStep('form-submission');
	};

	// 予約フォーム送信のハンドラー
	const handleFormSubmit = (reservationId: string) => {
		setReservationNumber(reservationId);
		setCurrentStep('confirmation');
	};

	// ステップの戻るボタンのハンドラー
	const handleGoBack = () => {
		if (currentStep === 'time-selection') {
			setCurrentStep('date-selection');
		} else if (currentStep === 'form-submission') {
			setCurrentStep('time-selection');
		}
	};

	// 新規予約へのリセット
	const handleStartNewReservation = () => {
		setSelectedDate(null);
		setSelectedSeat(null);
		setSelectedStartTime(null);
		setSelectedDuration(1);
		setReservationNumber(null);
		setCurrentStep('date-selection');
	};

	// ステッププログレスバー
	const renderStepProgress = () => {
		return (
			<div className="mb-8">
				<div className="flex justify-between">
					<div className={`flex-1 text-center ${currentStep === 'date-selection' ? 'text-blue-600 font-semibold' : ''}`}>
						<div className={`h-2 w-2 mx-auto rounded-full mb-2 ${currentStep === 'date-selection' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
						日付選択
					</div>
					<div className={`flex-1 text-center ${currentStep === 'time-selection' ? 'text-blue-600 font-semibold' : ''}`}>
						<div className={`h-2 w-2 mx-auto rounded-full mb-2 ${currentStep === 'time-selection' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
						席・時間選択
					</div>
					<div className={`flex-1 text-center ${currentStep === 'form-submission' ? 'text-blue-600 font-semibold' : ''}`}>
						<div className={`h-2 w-2 mx-auto rounded-full mb-2 ${currentStep === 'form-submission' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
						予約情報入力
					</div>
					<div className={`flex-1 text-center ${currentStep === 'confirmation' ? 'text-blue-600 font-semibold' : ''}`}>
						<div className={`h-2 w-2 mx-auto rounded-full mb-2 ${currentStep === 'confirmation' ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
						予約完了
					</div>
				</div>
				<div className="relative h-1 bg-gray-200 mt-4">
					<div
						className="absolute top-0 left-0 h-1 bg-blue-600"
						style={{
							width: currentStep === 'date-selection' ? '25%'
								: currentStep === 'time-selection' ? '50%'
									: currentStep === 'form-submission' ? '75%'
										: '100%'
						}}
					></div>
				</div>
			</div>
		);
	};

	return (
		<div className="max-w-4xl mx-auto">
			<h1 className="text-3xl font-bold mb-4">座席予約</h1>

			{renderStepProgress()}

			{/* 戻るボタン */}
			{currentStep !== 'date-selection' && currentStep !== 'confirmation' && (
				<button
					onClick={handleGoBack}
					className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5 mr-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					戻る
				</button>
			)}

			{/* ステップごとのコンテンツ */}
			{currentStep === 'date-selection' && (
				<div>
					<h2 className="text-xl font-semibold mb-4">予約日を選択してください</h2>
					<Calendar onDateSelect={handleDateSelect} />
				</div>
			)}

			{currentStep === 'time-selection' && selectedDate && (
				<div>
					<h2 className="text-xl font-semibold mb-4">
						席と時間を選択してください（{selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}）
					</h2>
					<TimeSlotsGrid
						date={selectedDate}
						onTimeSlotSelect={handleTimeSlotSelect}
					/>
				</div>
			)}

			{currentStep === 'form-submission' && selectedDate && selectedSeat && selectedStartTime && (
				<div>
					<h2 className="text-xl font-semibold mb-4">予約情報を入力してください</h2>
					<ReservationForm
						date={selectedDate}
						seatId={selectedSeat}
						startTime={selectedStartTime}
						duration={selectedDuration}
						onSubmit={handleFormSubmit}
					/>
				</div>
			)}

			{currentStep === 'confirmation' && reservationNumber && (
				<div>
					<h2 className="text-xl font-semibold mb-4">予約が完了しました</h2>
					<ReservationSummary
						reservationNumber={reservationNumber}
						onStartNewReservation={handleStartNewReservation}
					/>
				</div>
			)}
		</div>
	);