"use client";
import { useState } from "react";
import Link from "next/link";

export default function TestSmsPage() {
    const [phone, setPhone] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTest = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch("/api/test-sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            setResult(JSON.stringify(data, null, 2));
        } catch (e) {
            setResult(String(e));
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-lg card p-8">
                <Link href="/admin" className="text-sm text-gray-400 hover:text-carmelita-dark block mb-6">
                    ← Back to Dashboard
                </Link>
                <h1 className="font-display text-2xl font-bold text-carmelita-dark mb-2">SMS Test</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Tests your Twilio credentials live and shows the full API response.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone number to test
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9165792417"
                            className="input-field w-full"
                        />
                        <p className="text-xs text-gray-400 mt-1">Enter a 10-digit US number (we'll add +1 automatically)</p>
                    </div>
                    <button
                        onClick={handleTest}
                        disabled={loading || !phone}
                        className="btn-primary w-full py-3 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Test SMS"}
                    </button>
                    {result && (
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Twilio Response:</p>
                            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs overflow-auto max-h-64 whitespace-pre-wrap">
                                {result}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
