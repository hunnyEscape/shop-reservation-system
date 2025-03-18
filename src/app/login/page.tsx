// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';

// バリデーションスキーマ
const loginSchema = z.object({
	email: z.string().email('有効なメールアドレスを入力してください'),
	password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
	const { signIn } = useAuth();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		try {
			await signIn(data.email, data.password);
			router.push('/');
		} catch (error) {
			// エラーハンドリングはuseAuth内で行われるため、ここでは何もしない
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto">
			<h1 className="text-3xl font-bold text-center mb-8">ログイン</h1>

			<div className="bg-white p-8 rounded-lg shadow-md">
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
							placeholder="パスワードを入力"
							disabled={isLoading}
						/>
						{errors.password && (
							<p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
						)}
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
								ログイン状態を保持
							</label>
						</div>

						<div className="text-sm">
							<Link href="/forgot-password" className="text-blue-600 hover:text-blue-500">
								パスワードをお忘れですか？
							</Link>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? 'ログイン中...' : 'ログイン'}
						</button>
					</div>
				</form>

				<div className="mt-6 text-center">
					<p className="text-sm text-gray-600">
						アカウントをお持ちでない方は{' '}
						<Link href="/signup" className="text-blue-600 hover:text-blue-500">
							新規登録
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}