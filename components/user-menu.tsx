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
        <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{user.email}</span>
            </div>
            <Button
                onClick={handleLogout}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="border-gray-300 dark:border-gray-600"
            >
                {isLoading ? "Logging out..." : "Logout"}
            </Button>
        </div>
    );
}
