import { UtensilsCrossed } from "lucide-react";

interface LogoProps {
    className?: string; // Container classes
    iconContainerClass?: string; // e.g. w-16 h-16 md:w-20 md:h-20
    iconClass?: string; // e.g. w-8 h-8 md:w-10 md:h-10
    textClass?: string; // e.g. text-4xl md:text-5xl
}

export function Logo({
    className = "flex items-center gap-4 justify-center pointer-events-none select-none",
    iconContainerClass = "w-16 h-16 md:w-20 md:h-20 bg-carmelita-red rounded-full flex items-center justify-center shadow-md",
    iconClass = "w-8 h-8 md:w-10 md:h-10 text-white",
    textClass = "font-display text-5xl md:text-6xl font-bold text-carmelita-dark drop-shadow-sm tracking-tight",
}: LogoProps) {
    return (
        <div className={className}>
            <div className={iconContainerClass}>
                <UtensilsCrossed className={iconClass} />
            </div>
            <span className={textClass}>
                Tablereserve
            </span>
        </div>
    );
}
