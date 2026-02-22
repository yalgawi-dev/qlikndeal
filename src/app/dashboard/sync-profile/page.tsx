"use plain";
import { updateUserProfileImage } from "@/app/actions";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function SyncProfilePage({ searchParams }: { searchParams: { imageUrl?: string } }) {
    const user = await currentUser();
    const imageUrl = searchParams.imageUrl;
    let status: "success" | "error" | "missing" = "missing";
    let message = "";

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">לא מחובר</h1>
                <p className="text-muted-foreground mb-6">עליך להתחבר למערכת כדי לסנכרן תמונה.</p>
                <Link href="/sign-in"><Button>התחברות</Button></Link>
            </div>
        );
    }

    if (imageUrl) {
        try {
            // Validate URL (basic)
            if (!imageUrl.startsWith("http")) throw new Error("Invalid URL");

            // Update user profile
            const res = await updateUserProfileImage(imageUrl);

            if (res.success) {
                status = "success";
                message = "תמונת הפרופיל עודכנה בהצלחה!";
            } else {
                status = "error";
                message = "שגיאה בעדכון התמונה: " + res.error;
            }
        } catch (e: any) {
            status = "error";
            message = "שגיאה: " + e.message;
        }
    }
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4 text-center">
            {status === "success" ? (
                <div className="bg-card p-8 rounded-3xl shadow-lg border border-green-500/20 max-w-sm w-full animate-in zoom-in">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">הושלם!</h1>
                    <p className="text-muted-foreground mb-6">{message}</p>
                    <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-green-500/20">
                        <Image src={imageUrl || ""} alt="New Profile" className="w-full h-full object-cover" width={400} height={400} />
                    </div>
                    <Link href="/dashboard">
                        <Button className="w-full font-bold">חזרה לדשבורד</Button>
                    </Link>
                </div>
            ) : status === "error" ? (
                <div className="bg-card p-8 rounded-3xl shadow-lg border border-destructive/20 max-w-sm w-full">
                    <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-foreground mb-2">שגיאה</h1>
                    <p className="text-muted-foreground mb-6">{message}</p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full">ביטול</Button>
                    </Link>
                </div>
            ) : (
                <div className="bg-card p-8 rounded-3xl shadow-lg max-w-sm w-full">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">מעבד תמונה...</h1>
                    <p className="text-muted-foreground text-sm">אנא המתן</p>
                </div>
            )}
        </div>
    );
}
