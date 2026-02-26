"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { UtensilsCrossed, Loader2, Mail, CheckCircle } from "lucide-react";
import { resetPassword } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await resetPassword(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setSent(true);
            }
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
                        Reset Password
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {sent
                            ? "Check your inbox"
                            : "Enter your email to receive a reset link"}
                    </p>
                </div>

                <div className="card p-8">
                    {sent ? (
                        /* Success state */
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 rounded-full mb-4">
                                <CheckCircle className="w-7 h-7 text-green-500" />
                            </div>
                            <h2 className="font-semibold text-carmelita-dark text-lg mb-2">
                                Email sent!
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                We sent a password reset link to{" "}
                                <span className="font-medium text-carmelita-dark">
                                    {email}
                                </span>
                                . Check your inbox and click the link to reset
                                your password.
                            </p>
                            <p className="text-xs text-gray-400">
                                Didn&apos;t get it? Check your spam folder or{" "}
                                <button
                                    onClick={() => setSent(false)}
                                    className="text-carmelita-red hover:underline font-medium"
                                >
                                    try again
                                </button>
                                .
                            </p>
                        </div>
                    ) : (
                        /* Form state */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="input-field pl-9"
                                        placeholder="your@email.com"
                                    />
                                </div>
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
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Remember your password?{" "}
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
