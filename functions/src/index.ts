// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { nanoid } from 'nanoid';
import * as sgMail from '@sendgrid/mail';

// Firebase Admin初期化
admin.initializeApp();
const db = admin.firestore();

// SendGrid APIキーの設定
sgMail.setApiKey(functions.config().sendgrid.key);

// 予約作成関数
export const createReservation = functions.https.onCall(async (data, context) => {
	// 認証チェック
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'認証が必要です'
		);
	}

	const userId = context.auth.uid;

	try {
		// データバリデーション
		const { seatId, startTime, endTime, duration, price, email, userName, phoneNumber } = data;

		if (!seatId || !startTime || !endTime || !duration || price === undefined || !email || !userName) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'必要なデータが不足しています'
			);
		}

		// 予約可能かチェック
		const isAvailable = await checkTimeSlotAvailability(seatId, startTime, endTime);

		if (!isAvailable) {
			throw new functions.https.HttpsError(
				'failed-precondition',
				'指定された時間枠は既に予約されています'
			);
		}

		// 予約番号生成
		const reservationNumber = nanoid(6).toUpperCase();

		// トランザクションで予約処理
		const result = await db.runTransaction(async (transaction) => {
			// 予約ドキュメント作成
			const reservationRef = db.collection('reservations').doc();
			const now = admin.firestore.Timestamp.now();

			const reservationData = {
				userId,
				userName,
				email,
				phoneNumber: phoneNumber || '',
				seatId,
				startTime: admin.firestore.Timestamp.fromDate(new Date(startTime)),
				endTime: admin.firestore.Timestamp.fromDate(new Date(endTime)),
				duration,
				price,
				isPaid: false,
				paymentMethod: null,
				reservationNumber,
				source: data.source || 'web',
				status: 'confirmed',
				createdAt: now,
				updatedAt: now
			};

			// 予約ドキュメント保存
			transaction.set(reservationRef, reservationData);

			// タイムスロットを更新
			const startDate = new Date(startTime);
			const endDate = new Date(endTime);
			const currentHour = new Date(startDate);

			while (currentHour < endDate) {
				const slotId = `${seatId}-${currentHour.toISOString().split('.')[0]}`;
				const slotRef = db.collection('seats').doc(seatId).collection('timeSlots').doc(slotId);

				transaction.set(slotRef, {
					isReserved: true,
					userId,
					reservationId: reservationRef.id,
					status: 'reserved'
				});

				// 1時間進める
				currentHour.setHours(currentHour.getHours() + 1);
			}

			// ユーザーの予約履歴を更新
			const userRef = db.collection('users').doc(userId);
			const userDoc = await transaction.get(userRef);

			if (userDoc.exists) {
				const userData = userDoc.data() || {};
				const reservationHistory = userData.reservationHistory || [];
				const reservationCount = userData.reservationCount || 0;

				transaction.update(userRef, {
					reservationHistory: [...reservationHistory, reservationRef.id],
					reservationCount: reservationCount + 1,
					updatedAt: now
				});
			}

			return {
				reservationId: reservationRef.id,
				reservationNumber
			};
		});

		// 予約確認メール送信
		await sendConfirmationEmail(result.reservationId);

		return result;
	} catch (error) {
		console.error('Error creating reservation:', error);
		throw new functions.https.HttpsError(
			'internal',
			'reservation creation, internal server error'
		);
	}
});

// タイムスロットの空き状況チェック
async function checkTimeSlotAvailability(seatId: string, startTime: string, endTime: string): Promise<boolean> {
	const startDate = new Date(startTime);
	const endDate = new Date(endTime);
	const currentHour = new Date(startDate);

	while (currentHour < endDate) {
		const slotId = `${seatId}-${currentHour.toISOString().split('.')[0]}`;
		const slotRef = db.collection('seats').doc(seatId).collection('timeSlots').doc(slotId);

		const slotDoc = await slotRef.get();

		if (slotDoc.exists && slotDoc.data()?.isReserved) {
			return false;
		}

		// 1時間進める
		currentHour.setHours(currentHour.getHours() + 1);
	}

	return true;
}

// 予約確認メール送信
export const sendConfirmationEmail = functions.https.onCall(async (data, context) => {
	// 認証チェック
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'認証が必要です'
		);
	}

	try {
		const reservationId = data.reservationId;

		// 予約データ取得
		const reservationDoc = await db.collection('reservations').doc(reservationId).get();

		if (!reservationDoc.exists) {
			throw new functions.https.HttpsError(
				'not-found',
				'予約が見つかりません'
			);
		}

		const reservation = reservationDoc.data()!;

		// メール送信
		const startTime = reservation.startTime.toDate();
		const endTime = reservation.endTime.toDate();

		const msg = {
			to: reservation.email,
			from: 'noreply@example.com', // 送信元メールアドレス
			subject: `【店舗予約システム】ご予約確定のお知らせ (#${reservation.reservationNumber})`,
			text: `
${reservation.userName} 様

この度はご予約いただき、ありがとうございます。
以下の内容で予約が確定しました。

■ 予約番号
${reservation.reservationNumber}

■ 予約内容
日時: ${startTime.toLocaleString('ja-JP')} 〜 ${endTime.toLocaleString('ja-JP')}
席: ${reservation.seatId}席
料金: ${reservation.price}円

■ お支払い
店舗にてQRコード決済または現金でお支払いください。

■ キャンセルポリシー
ご予約のキャンセルは利用開始時間の24時間前まで可能です。
キャンセルは予約履歴ページから行うことができます。

ご不明な点がございましたら、お気軽にお問い合わせください。
      `,
			html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .reservation-details { background-color: #F3F4F6; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ご予約確定のお知らせ</h1>
    </div>
    <div class="content">
      <p>${reservation.userName} 様</p>
      <p>この度はご予約いただき、ありがとうございます。以下の内容で予約が確定しました。</p>
      
      <h2>予約番号</h2>
      <p style="font-size: 24px; font-weight: bold;">${reservation.reservationNumber}</p>
      
      <div class="reservation-details">
        <h3>予約内容</h3>
        <p><strong>日時:</strong> ${startTime.toLocaleString('ja-JP')} 〜 ${endTime.toLocaleString('ja-JP')}</p>
        <p><strong>席:</strong> ${reservation.seatId}席</p>
        <p><strong>料金:</strong> ${reservation.price}円</p>
      </div>
      
      <h3>お支払い</h3>
      <p>店舗にてQRコード決済または現金でお支払いください。</p>
      
      <h3>キャンセルポリシー</h3>
      <p>ご予約のキャンセルは利用開始時間の24時間前まで可能です。キャンセルは予約履歴ページから行うことができます。</p>
      
      <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
    </div>
    <div class="footer">
      <p>© 2025 店舗予約システム</p>
    </div>
  </div>
</body>
</html>
      `
		};

		await sgMail.send(msg);

		return { success: true };
	} catch (error) {
		console.error('Error sending confirmation email:', error);
		throw new functions.https.HttpsError(
			'internal',
			'email sending failed'
		);
	}
});

// 空き状況チェック関数
export const checkAvailability = functions.https.onCall(async (data, context) => {
	try {
		const { seatId, date, startTime, duration } = data;

		if (!seatId || !date || !startTime || !duration) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'必要なデータが不足しています'
			);
		}

		// 開始時間と終了時間の計算
		const startDateTime = new Date(`${date}T${startTime}`);
		const endDateTime = new Date(startDateTime);
		endDateTime.setHours(endDateTime.getHours() + duration);

		// 空き状況チェック
		const isAvailable = await checkTimeSlotAvailability(
			seatId,
			startDateTime.toISOString(),
			endDateTime.toISOString()
		);

		return { isAvailable };
	} catch (error) {
		console.error('Error checking availability:', error);
		throw new functions.https.HttpsError(
			'internal',
			'availability check failed'
		);
	}
});

// 日付ごとの予約状況を生成
export const generateReservationStats = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
	try {
		const today = new Date();
		const threeMothsLater = new Date();
		threeMothsLater.setMonth(today.getMonth() + 3);

		// 日付ごとの予約状況を集計
		const currentDate = new Date(today);
		currentDate.setHours(0, 0, 0, 0);

		while (currentDate <= threeMothsLater) {
			const dateString = currentDate.toISOString().split('T')[0];
			const startOfDay = new Date(currentDate);
			const endOfDay = new Date(currentDate);
			endOfDay.setHours(23, 59, 59, 999);

			// 席ごとの予約状況を取得
			const seats = ['A', 'B', 'C'];
			let totalAvailableSeats = seats.length;

			for (const seatId of seats) {
				const reservationsQuery = await db.collection('reservations')
					.where('seatId', '==', seatId)
					.where('status', '==', 'confirmed')
					.where('startTime', '<=', admin.firestore.Timestamp.fromDate(endOfDay))
					.where('endTime', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
					.get();

				if (!reservationsQuery.empty) {
					totalAvailableSeats--;
				}
			}

			// 日付の予約状況を更新
			const status =
				totalAvailableSeats === 0 ? 'full' :
					totalAvailableSeats < seats.length ? 'limited' :
						'available';

			await db.collection('dateAvailability').doc(dateString).set({
				date: dateString,
				status,
				availableSeats: totalAvailableSeats,
				updatedAt: admin.firestore.Timestamp.now()
			});

			// 次の日へ
			currentDate.setDate(currentDate.getDate() + 1);
		}

		return null;
	} catch (error) {
		console.error('Error generating reservation stats:', error);
		return null;
	}
});

// 特定の日付範囲の空き状況取得
export const getDateAvailability = functions.https.onCall(async (data, context) => {
	try {
		const { startDate, endDate } = data;

		if (!startDate || !endDate) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'開始日と終了日が必要です'
			);
		}

		const start = new Date(startDate);
		const end = new Date(endDate);

		// 開始日 >= 終了日 のチェック
		if (start >= end) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'終了日は開始日より後である必要があります'
			);
		}

		// 日付の空き状況を取得
		const snapshot = await db.collection('dateAvailability')
			.where('date', '>=', start.toISOString().split('T')[0])
			.where('date', '<=', end.toISOString().split('T')[0])
			.orderBy('date')
			.get();

		const availabilityData = snapshot.docs.map(doc => doc.data());

		return { availabilityData };
	} catch (error) {
		console.error('Error getting date availability:', error);
		throw new functions.https.HttpsError(
			'internal',
			'failed to get availability data'
		);
	}
});

// 予約キャンセル
export const cancelReservation = functions.https.onCall(async (data, context) => {
	// 認証チェック
	if (!context.auth) {
		throw new functions.https.HttpsError(
			'unauthenticated',
			'認証が必要です'
		);
	}

	const userId = context.auth.uid;

	try {
		const { reservationId } = data;

		if (!reservationId) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'予約IDが必要です'
			);
		}

		// 予約データ取得
		const reservationRef = db.collection('reservations').doc(reservationId);
		const reservationDoc = await reservationRef.get();

		if (!reservationDoc.exists) {
			throw new functions.https.HttpsError(
				'not-found',
				'予約が見つかりません'
			);
		}

		const reservation = reservationDoc.data()!;

		// 予約者本人のみキャンセル可能
		if (reservation.userId !== userId) {
			throw new functions.https.HttpsError(
				'permission-denied',
				'この予約をキャンセルする権限がありません'
			);
		}

		// 予約開始24時間前までのみキャンセル可能
		const startTime = reservation.startTime.toDate();
		const now = new Date();
		const timeUntilStart = startTime.getTime() - now.getTime();

		if (timeUntilStart < 24 * 60 * 60 * 1000) {
			throw new functions.https.HttpsError(
				'failed-precondition',
				'予約開始の24時間前を過ぎているため、キャンセルできません'
			);
		}

		// トランザクションでキャンセル処理
		await db.runTransaction(async (transaction) => {
			// 予約ステータスを更新
			transaction.update(reservationRef, {
				status: 'cancelled',
				updatedAt: admin.firestore.Timestamp.now()
			});

			// タイムスロットの予約状態を解除
			const startDate = startTime;
			const endDate = reservation.endTime.toDate();
			const currentHour = new Date(startDate);

			while (currentHour < endDate) {
				const slotId = `${reservation.seatId}-${currentHour.toISOString().split('.')[0]}`;
				const slotRef = db.collection('seats').doc(reservation.seatId).collection('timeSlots').doc(slotId);

				transaction.update(slotRef, {
					isReserved: false,
					userId: null,
					reservationId: null,
					status: 'available'
				});

				// 1時間進める
				currentHour.setHours(currentHour.getHours() + 1);
			}
		});

		// キャンセル確認メール送信
		const msg = {
			to: reservation.email,
			from: 'noreply@example.com',
			subject: `【店舗予約システム】ご予約キャンセルのお知らせ (#${reservation.reservationNumber})`,
			text: `
${reservation.userName} 様

以下の予約がキャンセルされました。

■ 予約番号
${reservation.reservationNumber}

■ キャンセルした予約内容
日時: ${startTime.toLocaleString('ja-JP')} 〜 ${reservation.endTime.toDate().toLocaleString('ja-JP')}
席: ${reservation.seatId}席

またのご利用をお待ちしております。
      `,
			html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .reservation-details { background-color: #F3F4F6; padding: 15px; margin: 15px 0; border-radius: 5px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6B7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ご予約キャンセルのお知らせ</h1>
    </div>
    <div class="content">
      <p>${reservation.userName} 様</p>
      <p>以下の予約がキャンセルされました。</p>
      
      <h2>予約番号</h2>
      <p style="font-size: 24px; font-weight: bold;">${reservation.reservationNumber}</p>
      
      <div class="reservation-details">
        <h3>キャンセルした予約内容</h3>
        <p><strong>日時:</strong> ${startTime.toLocaleString('ja-JP')} 〜 ${reservation.endTime.toDate().toLocaleString('ja-JP')}</p>
        <p><strong>席:</strong> ${reservation.seatId}席</p>
      </div>
      
      <p>またのご利用をお待ちしております。</p>
    </div>
    <div class="footer">
      <p>© 2025 店舗予約システム</p>
    </div>
  </div>
</body>
</html>
      `
		};

		await sgMail.send(msg);

		return { success: true };
	} catch (error) {
		console.error('Error cancelling reservation:', error);
		throw new functions.https.HttpsError(
			'internal',
			'reservation cancellation failed'
		);
	}
});