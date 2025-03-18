// src/types/index.ts
import { Timestamp } from 'firebase/firestore';

// 座席タイプ
export type SeatId = 'A' | 'B' | 'C';

// 予約ステータス
export type ReservationStatus = 'confirmed' | 'cancelled' | 'completed';

// 予約元
export type ReservationSource = 'web' | 'tablet';

// 支払い方法
export type PaymentMethod = 'qr' | 'cash' | 'online' | null;

// タイムスロットステータス
export type TimeSlotStatus = 'available' | 'reserved' | 'occupied' | 'maintenance';

// 座席情報
export interface Seat {
	id: SeatId;
	capacity: number;
	pricePerHour: number;
	description: string;
}

// タイムスロット
export interface TimeSlot {
	id: string; // YYYY-MM-DDThh:mm:ss形式
	isReserved: boolean;
	userId: string | null;
	reservationId: string | null;
	status: TimeSlotStatus;
}

// 予約情報
export interface Reservation {
	id: string;
	userId: string;
	userName: string;
	email: string;
	phoneNumber?: string;
	seatId: SeatId;
	startTime: Timestamp;
	endTime: Timestamp;
	duration: number;
	price: number;
	isPaid: boolean;
	paymentMethod: PaymentMethod;
	reservationNumber: string;
	source: ReservationSource;
	status: ReservationStatus;
	createdAt: Timestamp;
	updatedAt: Timestamp;
}

// ユーザー情報
export interface User {
	id: string;
	email: string;
	displayName: string;
	phoneNumber?: string;
	createdAt: Timestamp;
	lastLoginAt: Timestamp;
	reservationCount: number;
	reservationHistory: string[]; // 予約IDの配列
}

// カレンダー日付の予約状況
export interface DateAvailability {
	date: string; // YYYY-MM-DD形式
	status: 'available' | 'limited' | 'full';
	availableSeats: number;
}

// 予約フォーム入力データ
export interface ReservationFormData {
	userName: string;
	email: string;
	phoneNumber?: string;
	seatId: SeatId;
	date: Date;
	startTime: string; // HH:MM形式
	duration: number;
	agreeToTerms: boolean;
}