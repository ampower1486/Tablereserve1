"use client";

import { useState, useTransition } from "react";
import { UtensilsCrossed, Loader2, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (password !== confirm) {
            setError("Passwords don't match.");
            return;
        }

        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            const result = await updatePassword(formData);
            if (result?.error) setError(result.error);
            // On success, updatePassword redirects to "/"
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
                        New Password
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Choose a strong new password
                    </p>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="input-field pr-10"
                                    placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    name="confirm"
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    value={confirm}
                                    onChange={(e) =>
                                        setConfirm(e.target.value)
                                    }
                                    className={`input-field pr-10 ${confirm && confirm !== password
                                            ? "border-red-300 focus:ring-red-200"
                                            : ""
                                        }`}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirm ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                            {confirm && confirm !== password && (
                                <p className="text-xs text-red-500 mt-1">
                                    Passwords don&apos;t match
                                </p>
                            )}
                        </div>

                        {/* Strength hint */}
                        {password && (
                            <div className="flex gap-1">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors ${i < Math.min(4, Math.floor(password.length / 3))
                                                ? password.length < 6
                                                    ? "bg-red-400"
                                                    : password.length < 10
                                                        ? "bg-yellow-400"
                                                        : "bg-green-400"
                                                : "bg-gray-100"
                                            }`}
                                    />
                                ))}
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending || password !== confirm || password.length < 6}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                "Set New Password"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
