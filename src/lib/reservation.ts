// src/lib/reservation.ts
import { format, addHours, parseISO } from 'date-fns';
import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	doc,
	setDoc,
	updateDoc,
	deleteDoc,
	Timestamp,
	runTransaction,
	documentId
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { nanoid } from 'nanoid';
import { firestore, functions } from './firebase';
import { DateAvailability, Reservation, SeatId, TimeSlot } from '@/types';

// 日付の空き状況を取得
export async function getDateAvailability(startDate: Date, endDate: Date): Promise<DateAvailability[]> {
	// 開発段階では、モックデータを返す
	// 実装段階では、Cloud Functionsを使用して効率的に取得する
	return mockDateAvailability(startDate, endDate);
}

// モックの日付空き状況データを生成（開発用）
function mockDateAvailability(startDate: Date, endDate: Date): DateAvailability[] {
	const result: DateAvailability[] = [];
	const currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		// 平日は比較的空いていて、週末は混雑しているというモックデータ
		const day = currentDate.getDay(); // 0: 日曜日, 6: 土曜日
		let status: DateAvailability['status'] = 'available';
		let availableSeats = 3;

		if (day === 0 || day === 6) {
			// 週末
			const random = Math.random();
			if (random < 0.3) {
				status = 'available';
				availableSeats = 3;
			} else if (random < 0.7) {
				status = 'limited';
				availableSeats = 1;
			} else {
				status = 'full';
				availableSeats = 0;
			}
		} else {
			// 平日
			const random = Math.random();
			if (random < 0.7) {
				status = 'available';
				availableSeats = 3;
			} else if (random < 0.9) {
				status = 'limited';
				availableSeats = 2;
			} else {
				status = 'limited';
				availableSeats = 1;
			}
		}

		result.push({
			date: format(currentDate, 'yyyy-MM-dd'),
			status,
			availableSeats,
		});

		// 次の日へ
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return result;
}

// 特定の日付のタイムスロットデータを取得
export async function getTimeSlotsForDate(date: Date, seatId?: SeatId): Promise<TimeSlot[]> {
	// 開発段階では、モックデータを返す
	// 実装段階では、Firestoreからデータを取得する
	return mockTimeSlots(date, seatId);
}

// モックのタイムスロットデータを生成（開発用）
function mockTimeSlots(date: Date, seatId?: SeatId): TimeSlot[] {
	const result: TimeSlot[] = [];
	const dateStr = format(date, 'yyyy-MM-dd');

	// 営業時間: 9:00 - 22:00
	const openingHour = 9;
	const closingHour = 22;

	// 時間単位のスロットを生成
	for (let hour = openingHour; hour < closingHour; hour++) {
		const time = `${hour.toString().padStart(2, '0')}:00`;
		const timeSlotId = `${dateStr}T${time}:00`;

		// 席ごとに異なる予約状況を生成
		const seats: SeatId[] = seatId ? [seatId] : ['A', 'B', 'C'];

		for (const seat of seats) {
			// ランダムに予約状況を設定（実装段階では実際のデータを使用）
			const random = Math.random();
			const isReserved = random < 0.3; // 30%の確率で予約済み

			result.push({
				id: `${seat}-${timeSlotId}`,
				isReserved,
				userId: isReserved ? 'mock-user-id' : null,
				reservationId: isReserved ? 'mock-reservation-id' : null,
				status: isReserved ? 'reserved' : 'available',
			});
		}
	}

	return result;
}

// 予約を作成
export async function createReservation(reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'reservationNumber'>): Promise<string> {
	try {
		// 実際の実装では、Cloud Functionsを使ってトランザクションで処理する
		// 開発段階ではモックの予約番号を返す
		const reservationNumber = nanoid(6).toUpperCase();

		// 実際のFirebase実装（コメントアウト）
		/*
		const createReservationFunction = httpsCallable(functions, 'createReservation');
		const result = await createReservationFunction({
		  ...reservationData,
		});
	    
		return result.data.reservationNumber;
		*/

		// モック実装
		console.log('予約データ:', reservationData);
		return reservationNumber;
	} catch (error) {
		console.error('Error creating reservation:', error);
		throw error;
	}
}

// 予約を取得
export async function getReservation(reservationId: string): Promise<Reservation | null> {
	try {
		const reservationDoc = await getDoc(doc(firestore, 'reservations', reservationId));

		if (reservationDoc.exists()) {
			return reservationDoc.data() as Reservation;
		}

		return null;
	} catch (error) {
		console.error('Error fetching reservation:', error);
		throw error;
	}
}

// ユーザーの予約を取得
export async function getUserReservations(userId: string): Promise<Reservation[]> {
	try {
		const reservationsQuery = query(
			collection(firestore, 'reservations'),
			where('userId', '==', userId),
			where('status', 'in', ['confirmed', 'completed'])
		);

		const querySnapshot = await getDocs(reservationsQuery);
		const reservations: Reservation[] = [];

		querySnapshot.forEach((doc) => {
			reservations.push({
				id: doc.id,
				...doc.data()
			} as Reservation);
		});

		return reservations;
	} catch (error) {
		console.error('Error fetching user reservations:', error);
		throw error;
	}
}

// 予約をキャンセル
export async function cancelReservation(reservationId: string): Promise<void> {
	try {
		// 実際の実装では、Cloud Functionsを使ってトランザクションで処理する
		// 開発段階では単純な更新を行う
		await updateDoc(doc(firestore, 'reservations', reservationId), {
			status: 'cancelled',
			updatedAt: Timestamp.now()
		});
	} catch (error) {
		console.error('Error cancelling reservation:', error);
		throw error;
	}
}

// 支払い状態の更新
export async function updatePaymentStatus(reservationId: string, isPaid: boolean, paymentMethod: string): Promise<void> {
	try {
		await updateDoc(doc(firestore, 'reservations', reservationId), {
			isPaid,
			paymentMethod,
			updatedAt: Timestamp.now()
		});
	} catch (error) {
		console.error('Error updating payment status:', error);
		throw error;
	}
}

// 座席情報の取得
export async function getSeatInfo(seatId: SeatId) {
	// モック実装
	const seatInfo = {
		A: { capacity: 2, pricePerHour: 1000, description: '窓側の静かな個人席' },
		B: { capacity: 4, pricePerHour: 1500, description: 'ミーティングに最適な中規模席' },
		C: { capacity: 6, pricePerHour: 2000, description: '大人数でのディスカッションに向いた大きな席' }
	};

	return seatInfo[seatId];
}

// 予約可能かどうかをチェック
export async function checkAvailability(seatId: SeatId, date: Date, startTime: string, duration: number): Promise<boolean> {
	try {
		// モック実装 - 常に予約可能と返す
		// 実際の実装ではCloud Functionsを呼び出す
		return true;

		/*
		const checkAvailabilityFunction = httpsCallable(functions, 'checkAvailability');
		const result = await checkAvailabilityFunction({
		  seatId,
		  date: format(date, 'yyyy-MM-dd'),
		  startTime,
		  duration
		});
	    
		return result.data.isAvailable;
		*/
	} catch (error) {
		console.error('Error checking availability:', error);
		throw error;
	}
}

// タイムスロットから開始時間と終了時間を計算
export function calculateTimeRange(date: Date, startTime: string, duration: number) {
	const dateStr = format(date, 'yyyy-MM-dd');
	const startDateTime = parseISO(`${dateStr}T${startTime}`);
	const endDateTime = addHours(startDateTime, duration);

	return {
		startTime: Timestamp.fromDate(startDateTime),
		endTime: Timestamp.fromDate(endDateTime)
	};
}

// 座席ごとの価格計算
export function calculatePrice(seatId: SeatId, duration: number): number {
	const pricePerHour = {
		'A': 1000,
		'B': 1500,
		'C': 2000
	};

	return pricePerHour[seatId] * duration;
}