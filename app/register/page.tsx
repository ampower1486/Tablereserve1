"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UtensilsCrossed, Loader2 } from "lucide-react";
import { signUp } from "@/app/actions/auth";

export default function RegisterPage() {
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        startTransition(async () => {
            const result = await signUp(formData);
            if (result?.error) setError(result.error);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="mb-6 flex justify-center w-full">
                        <img
                            src="/logo.png"
                            alt="Tablereserve"
                            className="h-16 w-auto object-contain drop-shadow-sm pointer-events-none select-none"
                        />
                    </div>
                    <p className="text-gray-500 mt-1">Join us for a great experience</p>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                className="input-field"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
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
                                Phone Number
                            </label>
                            <input
                                name="phone"
                                type="tel"
                                className="input-field"
                                placeholder="(555) 000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                required
                                autoComplete="new-password"
                                className="input-field"
                                placeholder="Min. 6 characters"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                autoComplete="new-password"
                                className="input-field"
                                placeholder="Repeat your password"
                            />
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
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-carmelita-red hover:underline"
                        >
                            Sign in
                        </Link>
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
