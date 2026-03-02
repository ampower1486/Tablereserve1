"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { Logo } from "@/components/ui/Logo";

interface HeaderProps {
    user?: { email?: string } | null;
    isAdmin?: boolean;
}

export function Header({ user, isAdmin }: HeaderProps) {
    return null;
}
