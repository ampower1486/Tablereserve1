import Image from "next/image";
import Link from "next/link";
import { getRestaurant } from "@/app/actions/reservations";
import { MapPin, Phone, Clock, Star, ChevronRight } from "lucide-react";

export default async function HomePage() {
    const restaurant = await getRestaurant();

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <section className="relative h-[85vh] min-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/hero-food.png"
                        alt="Authentic Mexican cuisine at Carmelitas"
                        fill
                        priority
                        className="object-cover"
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 gradient-hero" />
                </div>

                {/* Hero content */}
                <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/30">
                        <Star className="w-3.5 h-3.5 text-carmelita-gold fill-carmelita-gold" />
                        Authentic Cuisine Since Abuela Carmelita
                    </div>

                    <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 text-balance">
                        A Taste of
                        <span className="block text-carmelita-gold">Puebla, Mexico</span>
                    </h1>

                    <p className="text-lg sm:text-xl text-white/85 mb-8 max-w-xl mx-auto leading-relaxed">
                        Every dish tells a story of love, family, and the rich flavors of
                        Mexico — just as Abuela Carmelita intended.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <Link
                            href="/book"
                            className="w-full sm:w-auto btn-primary bg-white text-carmelita-dark hover:bg-carmelita-gold text-base py-4 px-8 rounded-full font-bold shadow-xl"
                        >
                            Book a Table
                        </Link>
                        <a
                            href="#about"
                            className="w-full sm:w-auto text-white border-2 border-white/50 hover:border-white font-semibold px-8 py-4 rounded-full transition-all duration-300 text-base hover:bg-white/10"
                        >
                            Our Story
                        </a>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce">
                    <ChevronRight className="w-6 h-6 text-white/60 rotate-90" />
                </div>
            </section>

            {/* Info Strip */}
            <section className="bg-carmelita-dark text-white py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-carmelita-gold" />
                            <span>1234 Avenida de la Abuela, CA 90210</span>
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-carmelita-gold" />
                            <span>(555) 867-5309</span>
                        </div>
                        <div className="hidden sm:block w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-carmelita-gold" />
                            <span>Mon–Sun: 11:30 AM – 9:00 PM</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="animate-slide-up">
                        <p className="text-carmelita-red font-semibold text-sm uppercase tracking-widest mb-3">
                            Our Heritage
                        </p>
                        <h2 className="section-title mb-5">
                            Cooking with Love,
                            <br />
                            Just Like Abuela Did
                        </h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            {restaurant?.description ||
                                "Authentic Mexican cuisine honoring the tradition of Abuela Carmelita from Puebla. Every dish tells a story of love, family, and the rich flavors of Mexico."}
                        </p>
                        <p className="text-gray-600 leading-relaxed mb-6">
                            Our recipes have been passed down through generations, preserving
                            the authentic techniques and indigenous ingredients that make
                            Pueblan cuisine a UNESCO Intangible Cultural Heritage.
                        </p>
                        <Link href="/book" className="btn-primary inline-flex items-center gap-2">
                            Reserve Your Table
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { number: "50+", label: "Authentic Recipes" },
                            { number: "15+", label: "Years of Tradition" },
                            { number: "10K+", label: "Happy Guests" },
                            { number: "100%", label: "Family Recipes" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-carmelita-cream rounded-2xl p-6 text-center border border-carmelita-cream-dark"
                            >
                                <div className="font-display text-4xl font-bold text-carmelita-red mb-1">
                                    {stat.number}
                                </div>
                                <div className="text-sm text-gray-600 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Dishes */}
            <section className="bg-carmelita-cream py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-carmelita-red font-semibold text-sm uppercase tracking-widest mb-3">
                            Our Menu
                        </p>
                        <h2 className="section-title">Signature Dishes</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                name: "Tacos al Pastor",
                                desc: "Slow-roasted pork with pineapple, cilantro, and salsa verde on handmade corn tortillas",
                                emoji: "🌮",
                                price: "$14",
                            },
                            {
                                name: "Mole Poblano",
                                desc: "The crown jewel of Pueblan cuisine — chicken in a rich mole sauce with 30+ ingredients",
                                emoji: "🍗",
                                price: "$22",
                            },
                            {
                                name: "Enchiladas Verdes",
                                desc: "Handmade corn tortillas filled with chicken, covered in tomatillo salsa and crema",
                                emoji: "🫔",
                                price: "$18",
                            },
                        ].map((dish) => (
                            <div key={dish.name} className="card-hover p-6">
                                <div className="text-4xl mb-4">{dish.emoji}</div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-display text-lg font-bold text-carmelita-dark">
                                        {dish.name}
                                    </h3>
                                    <span className="font-bold text-carmelita-red">{dish.price}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {dish.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-carmelita-dark text-white text-center">
                <div className="max-w-xl mx-auto">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                        Ready for an Authentic Experience?
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Reserve your table today and let us take you on a culinary journey
                        to the heart of Puebla.
                    </p>
                    <Link
                        href="/book"
                        className="inline-block bg-carmelita-gold text-carmelita-dark font-bold py-4 px-10 rounded-full text-lg hover:bg-carmelita-gold-light transition-colors shadow-xl"
                    >
                        Book a Table Now
                    </Link>
                </div>
            </section>
        </div>
    );
}
