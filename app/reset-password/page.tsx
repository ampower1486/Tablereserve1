"use client";

import { useState, useEffect, useTransition } from "react";
import { UtensilsCrossed, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

function getSupabase() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

type Status = "loading" | "ready" | "error" | "success";

export default function ResetPasswordPage() {
    const [status, setStatus] = useState<Status>("loading");
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const router = useRouter();

    useEffect(() => {
        const supabase = getSupabase();

        // Supabase PKCE flow: ?code=... in query string
        const code = new URLSearchParams(window.location.search).get("code");

        // Supabase implicit flow: #access_token=...&type=recovery in hash
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        const type = hashParams.get("type");

        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
                if (error) {
                    setTokenError("This reset link has expired or already been used. Please request a new one.");
                    setStatus("error");
                } else {
                    setStatus("ready");
                }
            });
        } else if (accessToken && type === "recovery") {
            // Implicit flow — set the session from the hash tokens
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: hashParams.get("refresh_token") ?? "",
            }).then(({ error }) => {
                if (error) {
                    setTokenError("This reset link has expired. Please request a new one.");
                    setStatus("error");
                } else {
                    setStatus("ready");
                }
            });
        } else {
            setTokenError("No reset token found. Please request a password reset email again.");
            setStatus("error");
        }
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormError(null);
        if (password.length < 6) { setFormError("Password must be at least 6 characters."); return; }
        if (password !== confirm) { setFormError("Passwords don't match."); return; }

        startTransition(async () => {
            const supabase = getSupabase();
            const { error } = await supabase.auth.updateUser({ password });
            if (error) {
                setFormError(error.message);
            } else {
                setStatus("success");
                setTimeout(() => router.push("/login"), 2500);
            }
        });
    };

    // ── Loading state ────────────────────────────────────────────────────
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-carmelita-red" />
            </div>
        );
    }

    // ── Error state ──────────────────────────────────────────────────────
    if (status === "error") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md text-center animate-slide-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h1 className="font-display text-2xl font-bold text-carmelita-dark mb-2">Link Expired</h1>
                    <p className="text-gray-500 mb-6">{tokenError}</p>
                    <Link href="/forgot-password" className="btn-primary px-6 py-3 inline-block">
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        );
    }

    // ── Success state ────────────────────────────────────────────────────
    if (status === "success") {
        return (
            <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md text-center animate-slide-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-carmelita-dark mb-2">Password Updated!</h1>
                    <p className="text-gray-500">Redirecting you to sign in…</p>
                </div>
            </div>
        );
    }

    // ── Ready — show the form ────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-carmelita-dark rounded-full mb-4">
                        <UtensilsCrossed className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-carmelita-dark">New Password</h1>
                    <p className="text-gray-500 mt-1">Choose a strong new password</p>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pr-10"
                                    placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className={`input-field pr-10 ${confirm && confirm !== password ? "border-red-300 focus:ring-red-200" : ""}`}
                                    placeholder="Repeat your password"
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirm && confirm !== password && (
                                <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>
                            )}
                        </div>

                        {/* Strength bars */}
                        {password && (
                            <div className="flex gap-1">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < Math.min(4, Math.floor(password.length / 3))
                                            ? password.length < 6 ? "bg-red-400" : password.length < 10 ? "bg-yellow-400" : "bg-green-400"
                                            : "bg-gray-100"
                                        }`} />
                                ))}
                            </div>
                        )}

                        {formError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">{formError}</div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending || password !== confirm || password.length < 6}
                            className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Updating…</> : "Set New Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
