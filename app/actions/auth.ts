"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { data: authData, error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return { error: error.message };
    }

    if (authData.user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        if (profile?.role === "admin" || profile?.role === "super_admin") {
            revalidatePath("/", "layout");
            redirect("/admin");
        }
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Route through /auth/callback which exchanges the PKCE code,
        // then redirects to /reset-password with an active session
        redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });

    if (error) return { error: error.message };
    return { success: true };
}



export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signUp(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                phone,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Create profile
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        await supabase.from("profiles").upsert({
            id: user.id,
            full_name: fullName,
            phone,
            role: "customer",
        });
    }

    revalidatePath("/", "layout");
    redirect("/");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

export async function getUser() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user;
}
