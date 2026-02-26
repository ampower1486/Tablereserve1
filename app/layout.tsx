import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
    title: "Tablereserve | Carmelitas Mexican Restaurant",
    description:
        "Experience authentic Mexican cuisine honoring the tradition of Abuela Carmelita from Puebla. Book your table online for the best Mexican food experience.",
    keywords: "Mexican restaurant, authentic Mexican food, Puebla cuisine, restaurant reservation, Carmelitas",
    openGraph: {
        title: "Tablereserve — Carmelitas Mexican Restaurant",
        description: "Authentic Mexican cuisine honoring the tradition of Abuela Carmelita from Puebla.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-white text-carmelita-dark antialiased">
                <Header />
                <main className="min-h-screen">{children}</main>
                <footer className="bg-carmelita-dark text-white py-12 mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                {/* Conect-R Logo */}
                                <div className="mb-6">
                                    <div className="relative h-[80px] w-[290px] overflow-hidden rounded-xl bg-white shadow-md flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src="/conect-r-logo.png"
                                            alt="Conect R LLC"
                                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[240px] w-auto max-w-none mix-blend-multiply"
                                        />
                                    </div>
                                </div>
                                <h3 className="font-display text-xl font-bold text-carmelita-gold mb-3">
                                    Conect R LLC
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Tablereserve is a product of Conect R LLC — simple, beautiful
                                    restaurant reservations.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-3">Contact</h4>
                                <div className="text-gray-400 text-sm space-y-1">
                                    <p>For more information contact Conect R</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                            <p>© {new Date().getFullYear()} Conect R LLC · Tablereserve. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
