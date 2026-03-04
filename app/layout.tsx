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
                <footer className="bg-[#0f172a] text-white py-4 mt-auto">
                    <div className="max-w-7xl mx-auto px-4 w-full flex flex-wrap items-center justify-center gap-4 text-sm text-gray-200">
                        <div className="flex items-center gap-3">
                            <span>Powered by</span>
                            <div className="bg-white rounded flex items-center justify-center px-1.5 py-0.5 h-7">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/conect-r-footer.png"
                                    alt="Conect-R"
                                    className="h-4 w-auto object-contain"
                                />
                            </div>
                        </div>

                        <span className="text-gray-600 hidden sm:inline">|</span>

                        <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 relative overflow-hidden flex items-center justify-center rounded-md bg-transparent">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/nextup-logo.png"
                                    alt="Nextup"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <span className="font-medium text-[13px] tracking-wide text-gray-100">
                                Nextup is a product of Conect-R LLC
                            </span>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
