"use client";

/**
 * User Menu Component
 * Displays user info and logout button
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

interface UserMenuProps {
    user: User;
}

export function UserMenu({ user }: UserMenuProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center gap-2 md:gap-4">
            <div className="text-sm text-[#666] hidden md:block">

                <span className="font-medium">{user.email}</span>
            </div>
            <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="rounded-full border-[#e4e4e0] text-[#444] bg-white hover:bg-gray-50 hover:text-[#1a1a1a] hover:border-[#d0ddd3] px-4 font-medium"
            >
                {isLoading ? "Logging out..." : "Logout"}
            </Button>
        </div>

    );
}
