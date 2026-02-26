"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UtensilsCrossed, Loader2 } from "lucide-react";
import { signIn } from "@/app/actions/auth";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await signIn(formData);
            if (result?.error) setError(result.error);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-carmelita-dark rounded-full mb-4">
                        <UtensilsCrossed className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-carmelita-dark">
                        Welcome Back
                    </h1>
                    <p className="text-gray-500 mt-1">Sign in to your account</p>
                </div>

                <div className="card p-8">
                    <GoogleSignInButton text="Sign in with Google" />

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                autoComplete="email"
                                className="input-field"
                                placeholder="your@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="flex items-center justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-xs text-carmelita-red hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 space-y-2 text-center text-sm text-gray-500">
                        <div>
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="font-semibold text-carmelita-red hover:underline"
                            >
                                Create one
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-sm text-gray-500 hover:text-carmelita-dark">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
