"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteMarketplaceListing } from "@/app/admin/actions";
import { toast } from "sonner";

export default function ListingDeleteButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("האם אתה בטוח שברצונך למחוק מודעה זו? לא ניתן לבטל פעולה זו.")) return;

        setIsDeleting(true);
        const res = await deleteMarketplaceListing(id);

        if (res.success) {
            toast.success("המודעה נמחקה בהצלחה");
        } else {
            toast.error("שגיאה במחיקת המודעה: " + res.error);
        }
        setIsDeleting(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-xl transition-all ${isDeleting ? "opacity-50 cursor-not-allowed" : "text-gray-400 hover:text-red-400 hover:bg-red-500/10"}`}
            title="מחק מודעה לצמיתות"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
