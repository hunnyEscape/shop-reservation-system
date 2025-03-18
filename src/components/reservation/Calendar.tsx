// src/components/reservation/Calendar.tsx
'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, isBefore, isSameDay, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DateAvailability } from '@/types';
import { getDateAvailability } from '@/lib/reservation';

interface CalendarProps {
	onDateSelect: (date: Date) => void;
}

export default function Calendar({ onDateSelect }: CalendarProps) {
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [availabilityData, setAvailabilityData] = useState<DateAvailability[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const today = startOfDay(new Date());
	const maxDate = addMonths(today, 3); // 3ヶ月先まで予約可能

	// 当月の日付を生成
	const daysInMonth = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		// 前月の日付を追加（1日目が日曜日でない場合）
		const startDay = firstDay.getDay(); // 0: 日曜日, 1: 月曜日, ...
		const daysFromPrevMonth = startDay;

		// 次月の日付を追加（最終日が土曜日でない場合）
		const endDay = lastDay.getDay();
		const daysFromNextMonth = 6 - endDay;

		// カレンダー全体の日付配列
		const allDays: { date: Date; isCurrentMonth: boolean }[] = [];

		// 前月の日付
		for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
			const date = new Date(year, month, -i);
			allDays.push({ date, isCurrentMonth: false });
		}

		// 当月の日付
		for (let i = 1; i <= lastDay.getDate(); i++) {
			const date = new Date(year, month, i);
			allDays.push({ date, isCurrentMonth: true });
		}

		// 次月の日付
		for (let i = 1; i <= daysFromNextMonth; i++) {
			const date = new Date(year, month + 1, i);
			allDays.push({ date, isCurrentMonth: false });
		}

		return allDays;
	};

	// 前月へ
	const goToPrevMonth = () => {
		if (isBefore(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1), today)) {
			return; // 今日より前の月には戻れない
		}
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};

	// 次月へ
	const goToNextMonth = () => {
		if (isBefore(addMonths(today, 3), new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))) {
			return; // 3ヶ月先を超える月には進めない
		}
		setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};

	// 空き状況データの取得
	useEffect(() => {
		const fetchAvailabilityData = async () => {
			setIsLoading(true);
			try {
				const year = currentMonth.getFullYear();
				const month = currentMonth.getMonth();
				const firstDay = new Date(year, month, 1);
				const lastDay = new Date(year, month + 1, 0);

				const data = await getDateAvailability(firstDay, lastDay);
				setAvailabilityData(data);
			} catch (error) {
				console.error('Failed to fetch availability data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAvailabilityData();
	}, [currentMonth]);

	// 特定の日付の空き状況を取得
	const getStatusForDate = (date: Date): DateAvailability['status'] => {
		if (isLoading) return 'available'; // ローディング中はとりあえず空きとして表示

		const dateStr = format(date, 'yyyy-MM-dd');
		const dateData = availabilityData.find(d => d.date === dateStr);

		return dateData?.status || 'available';
	};

	// 日付のスタイルを取得
	const getDateStyles = (day: { date: Date; isCurrentMonth: boolean }) => {
		const { date, isCurrentMonth } = day;
		const isToday = isSameDay(date, today);
		const isPast = isBefore(date, today) && !isToday;
		const isFuture = !isPast && !isToday;
		const isSelectable = isCurrentMonth && !isPast && isBefore(date, maxDate);

		let bgColor = 'bg-white';
		let textColor = 'text-gray-800';
		let borderColor = 'border-transparent';

		if (!isCurrentMonth) {
			textColor = 'text-gray-300';
		} else if (isPast) {
			textColor = 'text-gray-400';
			bgColor = 'bg-gray-50';
		} else if (isToday) {
			borderColor = 'border-blue-500';
			bgColor = 'bg-blue-50';
		}

		// 空き状況による色分け（過去日以外）
		if (isCurrentMonth && !isPast) {
			const status = getStatusForDate(date);
			if (status === 'limited') {
				bgColor = 'bg-yellow-50';
			} else if (status === 'full') {
				bgColor = 'bg-red-50';
				textColor = 'text-red-700';
			}
		}

		return {
			div: `
        w-10 h-10 mx-auto rounded-full flex items-center justify-center
        ${bgColor} ${textColor} border ${borderColor}
        ${isSelectable ? 'cursor-pointer hover:bg-blue-100' : 'cursor-default'}
      `,
			isSelectable
		};
	};

	// 週の日付ヘッダー
	const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

	return (
		<div className="max-w-md mx-auto bg-white rounded-lg shadow p-4">
			{/* カレンダーヘッダー */}
			<div className="flex items-center justify-between mb-4">
				<button
					onClick={goToPrevMonth}
					className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
					disabled={isBefore(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1), today)}
				>
					<svg
						className="h-6 w-6 text-gray-600"
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
				</button>
				<h2 className="text-xl font-semibold">
					{format(currentMonth, 'yyyy年 MM月', { locale: ja })}
				</h2>
				<button
					onClick={goToNextMonth}
					className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
					disabled={isBefore(addMonths(today, 3), new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
				>
					<svg
						className="h-6 w-6 text-gray-600"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			</div>

			{/* 曜日ヘッダー */}
			<div className="grid grid-cols-7 gap-1 mb-2">
				{weekdays.map((weekday, index) => (
					<div
						key={weekday}
						className={`text-center text-sm font-medium ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
							}`}
					>
						{weekday}
					</div>
				))}
			</div>

			{/* カレンダー日付グリッド */}
			<div className="grid grid-cols-7 gap-1">
				{daysInMonth().map((day, i) => {
					const { div: dateStyle, isSelectable } = getDateStyles(day);

					return (
						<div key={i} className="text-center py-1">
							<div
								className={dateStyle}
								onClick={() => {
									if (isSelectable) {
										onDateSelect(day.date);
									}
								}}
							>
								{day.date.getDate()}
							</div>
						</div>
					);
				})}
			</div>

			{/* 凡例 */}
			<div className="mt-4 flex items-center justify-center space-x-4 text-sm">
				<div className="flex items-center">
					<div className="w-3 h-3 bg-white border rounded-full mr-1"></div>
					<span>空き</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 bg-yellow-50 border rounded-full mr-1"></div>
					<span>残りわずか</span>
				</div>
				<div className="flex items-center">
					<div className="w-3 h-3 bg-red-50 border rounded-full mr-1"></div>
					<span>満席</span>
				</div>
			</div>

			{isLoading && (
				<div className="text-center mt-2 text-gray-500 text-sm">読み込み中...</div>
			)}
		</div>
	);
}