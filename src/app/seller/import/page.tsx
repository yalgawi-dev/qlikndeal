"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { parseDealText, ParsedDeal } from "@/lib/parsing/dealParser";
import { parseLinkAction } from "@/app/actions/parsing"; // Import Server Action
import { Loader2, Wand2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function SellerImportPage() {
    const router = useRouter();
    const [inputMode, setInputMode] = useState<"text" | "link">("text");
    const [rawInput, setRawInput] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Extended state to hold images
    const [parsedData, setParsedData] = useState<(ParsedDeal & { images?: string[] }) | null>(null);

    const handleAnalyze = async () => {
        if (!rawInput.trim()) return;
        setIsAnalyzing(true);
        setErrorMsg(null);
        setParsedData(null);

        // MODE: TEXT
        if (inputMode === "text") {
            // Simulate processing time
            setTimeout(() => {
                const result = parseDealText(rawInput);
                setParsedData(result);
                setIsAnalyzing(false);
            }, 600);
            return;
        }

        // MODE: LINK
        if (inputMode === "link") {
            try {
                const result = await parseLinkAction(rawInput);

                if (result.success && result.data) {
                    setParsedData({
                        itemName: result.data.itemName || "",
                        price: result.data.price,
                        condition: result.data.condition,
                        description: result.data.description,
                        images: result.data.images
                    });
                } else {
                    setErrorMsg(result.error || "לא הצלחנו למשוך נתונים מהלינק הזה.");
                }
            } catch (err) {
                setErrorMsg("שגיאה בניתוח הלינק.");
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const handleCreateShipment = async () => {
        if (!parsedData) return;

        // Redirect to Dashboard with params
        const params = new URLSearchParams();
        params.set("create", "true");
        if (parsedData.itemName) params.set("itemName", parsedData.itemName);
        if (parsedData.price) params.set("value", parsedData.price.toString());
        if (parsedData.condition) params.set("condition", parsedData.condition || "Used");
        if (parsedData.description) params.set("description", parsedData.description || "");

        // Pass images as JSON string
        if (parsedData.images && parsedData.images.length > 0) {
            params.set("images", JSON.stringify(parsedData.images));
        }

        router.push(`/dashboard?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">

                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        מכירה מהירה
                    </h1>
                    <p className="text-gray-400">
                        הדבק את פרטי המכירה (או לינק לפוסט) ואנחנו נמלא את הפרטים בשבילך
                    </p>
                </div>

                <Card className="bg-gray-900 border-gray-800 shadow-2xl shadow-purple-900/10">
                    <CardHeader>
                        <div className="flex space-x-2 rtl:space-x-reverse justify-center mb-4">
                            <Button
                                variant={inputMode === "text" ? "default" : "ghost"}
                                onClick={() => { setInputMode("text"); setErrorMsg(null); }}
                                className={inputMode === "text" ? "bg-purple-600 hover:bg-purple-700" : ""}
                            >
                                טקסט חופשי
                            </Button>
                            <Button
                                variant={inputMode === "link" ? "default" : "ghost"}
                                onClick={() => { setInputMode("link"); setErrorMsg(null); }}
                                className={inputMode === "link" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                לינק לפוסט
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {inputMode === "text" ? (
                            <Textarea
                                placeholder="למשל: למכירה אייפון 14 פרו, 256 ג'יגה, שמור בקנאות. מחיר 3500 שח. נמצא בתל אביב."
                                className="min-h-[150px] bg-gray-950 border-gray-700 text-lg resize-none focus:ring-purple-500"
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                            />
                        ) : (
                            <div className="space-y-2">
                                <Input
                                    placeholder="https://facebook.com/groups/..."
                                    className="bg-gray-950 border-gray-700 text-lg h-12 focus:ring-blue-500"
                                    value={rawInput}
                                    onChange={(e) => setRawInput(e.target.value)}
                                />
                                <p className="text-xs text-gray-500">
                                    * תומך בפוסטים ציבוריים. לפוסטים פרטיים בפייסבוק, מומלץ להשתמש בתוסף הכרום שלנו.
                                </p>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {errorMsg}
                            </div>
                        )}

                        <Button
                            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all"
                            onClick={handleAnalyze}
                            disabled={!rawInput || isAnalyzing}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    מנתח נתונים...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-5 w-5" />
                                    בצע &quot;יבוא קסם&quot;
                                </>
                            )}
                        </Button>

                    </CardContent>
                </Card>

                {parsedData && (
                    <Card className="bg-gray-900/50 border-gray-800 animate-in fade-in slide-in-from-bottom-4">
                        <CardHeader>
                            <CardTitle className="flex items-center text-green-400">
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                נמצאו הפרטים הבאים
                            </CardTitle>
                            <CardDescription>
                                האם זה נראה נכון? תוכל לערוך בשלב הבא
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">שם מוצר</label>
                                    <div className="font-medium text-lg">{parsedData.itemName}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">מחיר משוער</label>
                                    <div className="font-medium text-lg text-green-400">
                                        {parsedData.price ? `₪${parsedData.price}` : "לא זוהה"}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">מצב</label>
                                    <div className="font-medium">{parsedData.condition}</div>
                                </div>
                            </div>

                            {parsedData.images && parsedData.images.length > 0 && (
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">תמונות שזוהו ({parsedData.images.length})</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {parsedData.images.map((img, idx) => (
                                            <img key={idx} src={img} className="w-16 h-16 rounded object-cover border border-gray-700" alt="Preview" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 flex justify-end">
                                <Button
                                    onClick={handleCreateShipment}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    המשך ליצירת לינק
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}
