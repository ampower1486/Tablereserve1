"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiEffect() {
    useEffect(() => {
        // First burst — center
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#8B1A1A", "#D4A017", "#F5F0E8", "#ffffff", "#22c55e"],
        });

        // Left cannon
        setTimeout(() => {
            confetti({
                particleCount: 60,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.65 },
                colors: ["#8B1A1A", "#D4A017", "#ffffff"],
            });
        }, 200);

        // Right cannon
        setTimeout(() => {
            confetti({
                particleCount: 60,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.65 },
                colors: ["#8B1A1A", "#D4A017", "#ffffff"],
            });
        }, 400);
    }, []);

    return null;
}
