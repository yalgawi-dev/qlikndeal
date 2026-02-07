"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Save, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateUserProfileImage } from "@/app/actions";
import { useRouter } from "next/navigation";

interface ProfileImageEditorProps {
    currentImage: string | null | undefined;
}

export function ProfileImageEditor({ currentImage }: ProfileImageEditorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [mode, setMode] = useState<"view" | "camera" | "upload">("view");
    const [loading, setLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const router = useRouter();

    const startCamera = async () => {
        setMode("camera");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("לא הצלחנו לפתוח את המצלמה. אנא בדוק הרשאות.");
            setMode("view");
        }
    };

    const takePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPreview(dataUrl);
        stopCamera();
        setMode("view");
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!preview) return;
        setLoading(true);
        try {
            const res = await updateUserProfileImage(preview);
            if (res.success) {
                setIsOpen(false);
                setPreview(null);
                router.refresh(); // Refresh page to show new image
            } else {
                alert("שגיאה בשמירת התמונה");
            }
        } catch (error) {
            console.error(error);
            alert("שגיאה בלתי צפויה");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                stopCamera();
                setPreview(null);
                setMode("view");
            }
        }}>
            <DialogTrigger asChild>
                <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-lg hover:bg-primary/90 transition-all" title="ערוך תמונה">
                    <Camera className="h-4 w-4" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">עריכת תמונת פרופיל</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center gap-6 py-4">
                    {/* Preview Area */}
                    <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-muted shadow-xl bg-black/5">
                        {mode === "camera" ? (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                        ) : (
                            <img
                                src={preview || currentImage || "/placeholder-user.png"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 w-full justify-center">
                        {mode === "camera" ? (
                            <Button onClick={takePhoto} className="w-full bg-red-500 hover:bg-red-600 animate-pulse">
                                <Camera className="mr-2 h-4 w-4" /> צלם
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()} className="flex-1">
                                    <Upload className="mr-2 h-4 w-4" /> העלאה
                                    <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </Button>
                                <Button variant="outline" onClick={startCamera} className="flex-1">
                                    <Camera className="mr-2 h-4 w-4" /> מצלמה
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Save Actions */}
                    {preview && mode !== "camera" && (
                        <div className="flex gap-2 w-full animate-in fade-in slide-in-from-bottom-2">
                            <Button onClick={handleSave} disabled={loading} className="flex-1">
                                {loading ? "שומר..." : <><Save className="mr-2 h-4 w-4" /> שמור שינויים</>}
                            </Button>
                            <Button variant="ghost" onClick={() => setPreview(null)} disabled={loading}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
