"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signIn } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";

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
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="mb-6 flex justify-center w-full transform scale-[0.85] md:scale-95">
                        <Logo />
                    </div>
                    <p className="text-gray-500 mt-2">Sign in to your account</p>
                </div>

                <div className="card p-8">
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
