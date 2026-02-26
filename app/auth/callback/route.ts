import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // `next` lets us redirect to a specific page after auth
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const response = NextResponse.redirect(`${origin}${next}`);

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
                        });
                    },
                },
            }
        );

        const { error, data } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.user) {
            // Check if profile exists
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

            let targetUrl = `${origin}${next}`;

            if (!profile) {
                // Auto-create customer profile for OAuth sign-ups
                await supabase.from("profiles").upsert({
                    id: data.user.id,
                    full_name: data.user.user_metadata.full_name || data.user.email?.split("@")[0] || "Guest",
                    role: "customer",
                });
            } else if ((profile.role === "admin" || profile.role === "super_admin") && next === "/") {
                targetUrl = `${origin}/admin`;
            }

            const redirectResponse = NextResponse.redirect(targetUrl);

            // Reapply the cookies to the new target URL response
            const cookiesToSet = request.cookies.getAll();
            cookiesToSet.forEach(({ name, value }) => {
                redirectResponse.cookies.set(name, value);
            });
            // We also need to copy the cookies that were set by `exchangeCodeForSession`
            // Instead of doing it manually, we can just use the supabase client to set them 
            // on the new response

            const newSupabase = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                {
                    cookies: {
                        getAll() {
                            return request.cookies.getAll();
                        },
                        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                redirectResponse.cookies.set(name, value, options as Parameters<typeof redirectResponse.cookies.set>[2]);
                            });
                        },
                    },
                }
            );

            // This will push the session cookies onto `redirectResponse`
            await newSupabase.auth.getSession();

            return redirectResponse;
        }
    }

    // Code missing or exchange failed — send back to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
