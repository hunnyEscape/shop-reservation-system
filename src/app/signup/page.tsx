// src/app/signup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

// バリデーションスキーマ
const signupSchema = z.object({
	displayName: z.string().min(2, '名前は2文字以上で入力してください'),
	email: z.string().email('有効なメールアドレスを入力してください'),
	password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
	confirmPassword: z.string().min(6, 'パスワードは6文字以上で入力してください'),
	agreeToTerms: z.boolean().refine(val => val === true, {
		message: '利用規約に同意する必要があります',
	}),
})
	.refine(data => data.password === data.confirmPassword, {
		message: 'パスワードが一致しません',
		path: ['confirmPassword'],
	});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
	const { signUp } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			displayName: '',
			email: '',
			password: '',
			confirmPassword: '',
			agreeToTerms: false,
		},
	});

	const onSubmit = async (data: SignupFormData) => {
		setIsLoading(true);
		try {
			await signUp(data.email, data.password, data.displayName);
			router.push('/');
		} catch (error) {
			// エラーハンドリングはuseAuth内で行われるため、ここでは何もしない
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto">
			<h1 className="text-3xl font-bold text-center mb-8">アカウント作成</h1>

			<div className="bg-white p-8 rounded-lg shadow-md">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div>
						<label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
							お名前
						</label>
						<input
							id="displayName"
							type="text"
							{...register('displayName')}
							className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="お名前を入力"
							disabled={isLoading}
						/>
						{errors.displayName && (
							<p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
						)}
					</div>

					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							メールアドレス
						</label>
						<input
							id="email"
							type="email"
							{...register('email')}
							className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="メールアドレスを入力"
							disabled={isLoading}
						/>
						{errors.email && (
							<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
						)}
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							パスワード
						</label>
						<input
							id="password"
							type="password"
							{...register('password')}
							className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="パスワードを入力（6文字以上）"
							disabled={isLoading}
						/>
						{errors.password && (
							<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
						)}
					</div>

					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
							パスワード（確認）
						</label>
						<input
							id="confirmPassword"
							type="password"
							{...register('confirmPassword')}
							className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="パスワードを再入力"
							disabled={isLoading}
						/>
						{errors.confirmPassword && (
							<p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
						)}
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
								<Link href="/terms" className="text-blue-600 hover:text-blue-500">
									利用規約
								</Link>
								と
								<Link href="/privacy" className="text-blue-600 hover:text-blue-500">
									プライバシーポリシー
								</Link>
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
							{isLoading ? '登録中...' : 'アカウント作成'}
						</button>
					</div>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						すでにアカウントをお持ちの方は{' '}
						<Link href="/login" className="text-blue-600 hover:text-blue-500">
							ログイン
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}