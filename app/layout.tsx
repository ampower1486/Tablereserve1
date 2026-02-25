import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
    title: "Carmelitas Mexican Restaurant | Authentic Cuisine from Puebla",
    description:
        "Experience authentic Mexican cuisine honoring the tradition of Abuela Carmelita from Puebla. Book your table online for the best Mexican food experience.",
    keywords: "Mexican restaurant, authentic Mexican food, Puebla cuisine, restaurant reservation, Carmelitas",
    openGraph: {
        title: "Carmelitas Mexican Restaurant",
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <h3 className="font-display text-xl font-bold text-carmelita-gold mb-3">
                                    Carmelitas
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Authentic Mexican cuisine honoring the tradition of Abuela
                                    Carmelita from Puebla. Every dish tells a story of love,
                                    family, and rich flavors.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-3">Hours</h4>
                                <div className="text-gray-400 text-sm space-y-1">
                                    <p>Mon–Thu: 11:30 AM – 9:00 PM</p>
                                    <p>Fri–Sat: 11:30 AM – 10:00 PM</p>
                                    <p>Sunday: 12:00 PM – 8:30 PM</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-3">Contact</h4>
                                <div className="text-gray-400 text-sm space-y-1">
                                    <p>1234 Avenida de la Abuela</p>
                                    <p>Puebla District, CA 90210</p>
                                    <p className="mt-2">(555) 867-5309</p>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                            <p>
                                © {new Date().getFullYear()} Carmelitas Mexican Restaurant. All
                                rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
