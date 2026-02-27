"use client";

import { useState } from "react";
import { saveAdminNote, deleteAdminNote } from "../collaboration-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, FileText, User } from "lucide-react";

interface AdminNotesClientProps {
    initialNotes: any[];
}

export default function AdminNotesClient({ initialNotes }: AdminNotesClientProps) {
    const [notes, setNotes] = useState(initialNotes);
    const [editingNote, setEditingNote] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form states for new/edit
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error("Content is required");
            return;
        }

        setIsSaving(true);
        const result = await saveAdminNote(content, editingNote?.id, title);
        setIsSaving(false);

        if (result.success) {
            toast.success(editingNote ? "Note updated" : "Note created");
            window.location.reload(); // Refresh to see changes
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this note?")) return;
        const result = await deleteAdminNote(id);
        if (result.success) {
            setNotes(notes.filter(n => n.id !== id));
            toast.success("Note deleted");
        }
    };

    const startEditing = (note: any) => {
        setEditingNote(note);
        setTitle(note.title || "");
        setContent(note.content || "");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingNote(null);
        setTitle("");
        setContent("");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Editor Sidebar/Panel */}
            <div className="md:col-span-1">
                <Card className="sticky top-6 border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <FileText className="h-5 w-5 text-indigo-400" />
                            {editingNote ? "עריכת הערה" : "הערה משותפת חדשה"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">כותרת (אופציונלי)</label>
                            <Input
                                placeholder="סיכומי פגישה, תוכניות API..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-black/20 border-white/5 text-white focus:border-indigo-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">תוכן</label>
                            <Textarea
                                placeholder="כתוב משהו..."
                                className="min-h-[250px] bg-black/20 border-white/5 text-white focus:border-indigo-500/50"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2 border-t border-white/5 pt-4">
                        {editingNote && (
                            <Button variant="ghost" onClick={resetForm} className="text-gray-400">ביטול</Button>
                        )}
                        <Button
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {editingNote ? "עדכן" : "שמור הערה"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Notes Grid */}
            <div className="md:col-span-2 space-y-4">
                {notes.length === 0 && (
                    <div className="text-center py-24 bg-white/5 rounded-2xl border-2 border-dashed border-white/5 italic text-gray-500">
                        אין עדיין הערות משותפות.
                    </div>
                )}
                <div className="grid grid-cols-1 gap-4">
                    {notes.map((note) => (
                        <Card key={note.id} className="group bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <CardTitle className="text-lg font-semibold text-white">
                                    {note.title || "הערה ללא כותרת"}
                                </CardTitle>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => startEditing(note)} className="text-gray-400 hover:text-white">
                                        <FileText className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)} className="text-gray-400 hover:text-red-400">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300 whitespace-pre-wrap text-sm line-clamp-6 leading-relaxed">
                                    {note.content}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center border-t border-white/5 pt-3 text-[11px] text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <User className="h-3 w-3 text-indigo-400" />
                                    <span>{note.author?.firstName || "מערכת"}</span>
                                </div>
                                <span className="italic">עודכן ב-{new Date(note.updatedAt).toLocaleString("he-IL")}</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
