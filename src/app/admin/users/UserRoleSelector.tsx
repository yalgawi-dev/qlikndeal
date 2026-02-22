"use client";

import { useState } from "react";
import { updateUserRole } from "@/app/admin/actions";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";

export default function UserRoleSelector({ userId, currentRoles }: { userId: string, currentRoles: UserRole[] }) {
    const [isLoading, setIsLoading] = useState(false);

    const toggleRole = async (role: UserRole) => {
        setIsLoading(true);
        const action = currentRoles.includes(role) ? "remove" : "add";
        const res = await updateUserRole(userId, role, action);

        if (res.success) {
            toast.success(`הרשאת ${role} עודכנה בהצלחה`);
        } else {
            toast.error("שגיאה בעדכון ההרשאה: " + res.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="flex gap-2">
            {(["ADMIN", "PROVIDER"] as const).map(role => {
                const isActive = currentRoles.includes(role as UserRole);
                return (
                    <button
                        key={role}
                        onClick={() => toggleRole(role as UserRole)}
                        disabled={isLoading}
                        className={`text-xs px-3 py-1.5 rounded-full transition-all border ${isActive
                                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {role === "ADMIN" ? "מנהל" : "ספק שירות"}
                        {isActive && " ✓"}
                    </button>
                );
            })}
        </div>
    );
}
