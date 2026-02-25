import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, Users } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* ── HERO: Full-viewport entry ── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-dark.png"
                        alt="Tablereserve ambiance"
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/60" />
                    {/* Radial glow at center */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,57,43,0.15)_0%,transparent_70%)]" />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto animate-fade-in">
                    {/* Logo mark */}
                    <div className="mb-8 inline-flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-2xl">
                            <CalendarDays className="w-10 h-10 text-carmelita-gold" />
                        </div>
                        <div className="text-white/60 text-sm font-light tracking-[6px] uppercase">
                            Tablereserve
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="font-display text-5xl sm:text-7xl font-bold text-white leading-tight mb-6">
                        Reserve Your{" "}
                        <span className="text-carmelita-gold italic">Perfect</span>
                        <br />
                        Table
                    </h1>

                    {/* Subtext */}
                    <p className="text-white/75 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
                        The simplest way to book a table at{" "}
                        <span className="text-white font-medium">Carmelitas Mexican Restaurant</span>.
                        Select your date, choose your time, and arrive ready to enjoy.
                    </p>

                    {/* CTA */}
                    <Link
                        href="/book"
                        className="inline-flex items-center gap-3 bg-white text-carmelita-dark font-bold text-lg px-10 py-4 rounded-full shadow-2xl hover:bg-carmelita-gold hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-carmelita-gold/30"
                    >
                        <CalendarDays className="w-5 h-5" />
                        Book a Table
                    </Link>

                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
                    <div className="w-px h-12 bg-white/20" />
                </div>
            </section>

            {/* ── HOW IT WORKS: 3-step section ── */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <h2 className="font-display text-4xl font-bold text-center text-carmelita-dark mb-3">
                        How it works
                    </h2>
                    <p className="text-gray-500 text-center mb-16 max-w-md mx-auto">
                        From selection to confirmation in under a minute.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                icon: <CalendarDays className="w-6 h-6 text-carmelita-red" />,
                                title: "Pick a Date & Time",
                                desc: "Browse available slots up to 14 days in advance. Pick what works for you.",
                            },
                            {
                                step: "02",
                                icon: <Users className="w-6 h-6 text-carmelita-red" />,
                                title: "Add Your Details",
                                desc: "Tell us your name, contact info, and any special requests. Takes 30 seconds.",
                            },
                            {
                                step: "03",
                                icon: <Clock className="w-6 h-6 text-carmelita-red" />,
                                title: "Get Confirmed",
                                desc: "Receive a unique reservation code instantly. Show it when you arrive.",
                            },
                        ].map(({ step, icon, title, desc }) => (
                            <div
                                key={step}
                                className="relative p-8 rounded-3xl border border-gray-100 hover:border-carmelita-red/20 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className="absolute top-6 right-6 text-gray-100 font-display text-5xl font-black select-none group-hover:text-carmelita-red/10 transition-colors">
                                    {step}
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-carmelita-cream flex items-center justify-center mb-4">
                                    {icon}
                                </div>
                                <h3 className="font-display font-bold text-lg text-carmelita-dark mb-2">
                                    {title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-14">
                        <Link
                            href="/book"
                            className="inline-flex items-center gap-2 btn-primary text-base px-8 py-3.5"
                        >
                            <CalendarDays className="w-4 h-4" />
                            Book Your Table Now
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
