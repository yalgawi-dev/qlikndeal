"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Mic, MicOff, Image as ImageIcon, Sparkles, Wand2, X } from "lucide-react";

interface SmartListingInputProps {
    onAnalyze: (text: string) => Promise<void>;
    isAnalyzing: boolean;
}

export function SmartListingInput({ onAnalyze, isAnalyzing }: SmartListingInputProps) {
    const [text, setText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState("");
    const [recordingError, setRecordingError] = useState("");
    const [showVoiceUI, setShowVoiceUI] = useState(false);
    const recognitionRef = useRef<any>(null);
    const userStoppedRef = useRef(false);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        await onAnalyze(text);
    };

    // --- Voice Recording ---
    const startRecording = () => {
        setRecordingError("");
        setVoiceTranscript("");
        userStoppedRef.current = false;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setRecordingError("הדפדפן שלך לא תומך בהקלטת קול. נסה Chrome או Safari עדכני.");
            return;
        }

        const createAndStart = (): any => {
            const recognition = new SpeechRecognition();
            recognition.lang = "he-IL";
            recognition.continuous = false; // iOS compatible
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: any) => {
                let finalTranscript = "";
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + " ";
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript || interimTranscript) {
                    setVoiceTranscript(prev => {
                        const base = prev.split("|||INTERIM")[0];
                        const newFinal = base + finalTranscript;
                        return interimTranscript ? newFinal + "|||INTERIM" + interimTranscript : newFinal;
                    });
                }
            };

            recognition.onerror = (event: any) => {
                if (event.error === "no-speech" || event.error === "aborted") return;
                if (event.error === "not-allowed") {
                    setRecordingError("אין הרשאה למיקרופון. אשר גישה בהגדרות הדפדפן.");
                    userStoppedRef.current = true;
                    setIsRecording(false);
                    return;
                }
                if (event.error === "network") {
                    setRecordingError("שגיאת רשת. בדוק חיבור לאינטרנט.");
                    userStoppedRef.current = true;
                    setIsRecording(false);
                    return;
                }
                setRecordingError("שגיאה: " + event.error);
            };

            recognition.onend = () => {
                if (!userStoppedRef.current) {
                    try {
                        const next = createAndStart();
                        recognitionRef.current = next;
                    } catch {
                        setIsRecording(false);
                    }
                } else {
                    setIsRecording(false);
                }
            };

            try { recognition.start(); } catch { /* already started */ }
            return recognition;
        };

        recognitionRef.current = createAndStart();
        setIsRecording(true);
    };

    const stopRecording = () => {
        userStoppedRef.current = true;
        recognitionRef.current?.stop();
        setIsRecording(false);
        setVoiceTranscript(prev => prev.split("|||INTERIM")[0]);
    };

    const handleVoiceConfirm = () => {
        const clean = voiceTranscript.split("|||INTERIM")[0].trim();
        if (!clean) return;
        setText(clean);
        setShowVoiceUI(false);
        setVoiceTranscript("");
    };

    const openVoice = () => {
        setVoiceTranscript("");
        setRecordingError("");
        setShowVoiceUI(true);
    };

    const closeVoice = () => {
        stopRecording();
        setShowVoiceUI(false);
        setVoiceTranscript("");
    };

    const displayText = voiceTranscript.split("|||INTERIM")[0];
    const interimText = voiceTranscript.includes("|||INTERIM") ? voiceTranscript.split("|||INTERIM")[1] : "";

    return (
        <div className="w-full space-y-6">

            {/* Voice UI Overlay */}
            {showVoiceUI && (
                <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-6 space-y-5 shadow-2xl">
                    {/* Close */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">🎙️ הקלטת קול</h3>
                        <button onClick={closeVoice} className="p-1 text-gray-400 hover:text-white rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mic Button */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            {isRecording && (
                                <>
                                    <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                                    <span className="absolute inset-3 rounded-full bg-red-500/15 animate-ping" style={{ animationDelay: "0.2s" }} />
                                </>
                            )}
                            <button
                                type="button"
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording
                                        ? "bg-red-600 hover:bg-red-700 shadow-red-500/40"
                                        : "bg-purple-600 hover:bg-purple-700 shadow-purple-500/40"
                                    }`}
                            >
                                {isRecording ? <MicOff size={34} className="text-white" /> : <Mic size={34} className="text-white" />}
                            </button>
                        </div>
                        <p className="text-sm text-gray-400">
                            {isRecording ? "🔴 מקליט... לחץ שוב לעצור" : "לחץ כדי להתחיל להקליט"}
                        </p>
                    </div>

                    {/* Live Transcript */}
                    {(displayText || interimText) && (
                        <div className="bg-slate-800 rounded-xl p-4 text-right min-h-[60px]">
                            <p className="text-xs text-gray-500 mb-1">מה שנאמר:</p>
                            <p className="text-white leading-relaxed">
                                {displayText}
                                {interimText && <span className="text-gray-500 italic">{interimText}</span>}
                            </p>
                        </div>
                    )}

                    {recordingError && (
                        <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-800/50 rounded-lg p-3">
                            {recordingError}
                        </p>
                    )}

                    {/* Use Text Button */}
                    {displayText && !isRecording && (
                        <button
                            onClick={handleVoiceConfirm}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            <Sparkles size={18} />
                            השתמש בטקסט הזה
                        </button>
                    )}
                </div>
            )}

            {/* Text Area */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="לדוגמה: מוכר אייפון 14 פרו שחור 256 גיגה, מצב חדש עם קופסה ומגן מסך, ב-3500 ש״ח..."
                        className="w-full h-48 p-6 text-lg text-white placeholder:text-gray-500 bg-slate-900 border border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all shadow-xl"
                        disabled={isAnalyzing}
                    />

                    {/* Input Actions */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <button title="העלה תמונה (בקרוב)" className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all" disabled>
                            <ImageIcon size={20} />
                        </button>
                        <button
                            type="button"
                            title="הקלטת קול"
                            onClick={openVoice}
                            className={`p-2.5 rounded-full transition-all ${showVoiceUI || isRecording
                                    ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                        >
                            <Mic size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                disabled={!text.trim() || isAnalyzing}
                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg overflow-hidden relative group
                    ${!text.trim() || isAnalyzing
                        ? "bg-slate-800 text-gray-500 cursor-not-allowed border border-slate-700"
                        : "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
                    }`}
            >
                {/* Button Glow Effect */}
                {!isAnalyzing && text.trim() && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                )}

                {isAnalyzing ? (
                    <>
                        <Loader2 className="animate-spin text-purple-600" size={24} />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            מעבד נתונים...
                        </span>
                    </>
                ) : (
                    <>
                        <Wand2 size={24} className={text.trim() ? "text-purple-600" : ""} />
                        <span>צור מודעה קסומה</span>
                    </>
                )}
            </button>
        </div>
    );
}
