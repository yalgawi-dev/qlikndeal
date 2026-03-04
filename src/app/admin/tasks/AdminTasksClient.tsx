"use client";

import { useState } from "react";
import { createAdminTask, toggleAdminTask, addTaskComment, deleteAdminTask } from "../collaboration-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MessageSquare, Send, User, Clock, CheckCircle2, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";

interface AdminTasksClientProps {
    initialTasks: any[];
}

export default function AdminTasksClient({ initialTasks }: AdminTasksClientProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setIsAdding(true);
        const result = await createAdminTask(newTaskTitle, newTaskDesc);
        setIsAdding(false);

        if (result.success) {
            setNewTaskTitle("");
            setNewTaskDesc("");
            toast.success("המשימה נוספה בהצלחה");
            window.location.reload();
        } else {
            toast.error(result.error || "נכשל בתוספת משימה");
        }
    };

    const handleToggle = async (taskId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        const result = await toggleAdminTask(taskId, newStatus);
        if (result.success) {
            setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));
            toast.success(newStatus ? "המשימה סומנה כבוצעה" : "המשימה נפתחה מחדש");
        }
    };

    const handleAddComment = async (taskId: string) => {
        const content = commentTexts[taskId];
        if (!content || !content.trim()) return;

        const result = await addTaskComment(taskId, content);
        if (result.success) {
            setCommentTexts(prev => ({ ...prev, [taskId]: "" }));
            toast.success("תגובה נוספה");
            window.location.reload();
        } else {
            toast.error("נכשל בהוספת תגובה");
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm("האם אתה בטוח שברצונך למחוק משימה זו?")) return;
        const result = await deleteAdminTask(taskId);
        if (result.success) {
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.success("המשימה נמחקה");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20 px-4" dir="rtl">
            {/* New Task Entry Card - Cyber Neon Style */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative border-none bg-slate-900/90 backdrop-blur-2xl overflow-hidden rounded-[2.2rem] ring-1 ring-white/10 shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)]">
                    <CardHeader className="pb-4 border-b border-white/5 bg-white/[0.02]">
                        <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.5)]">
                                <Plus className="h-6 w-6 text-white" />
                            </div>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">צור משימה חדשה</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 md:px-12 pb-12">
                        <form onSubmit={handleAddTask} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-sm font-black text-indigo-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                                    <Zap className="h-3 w-3" /> כותרת המשימה
                                </label>
                                <Input
                                    placeholder="מה היעד הבא שלנו?"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className="text-xl font-bold bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 py-7 rounded-2xl transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-black text-purple-400 uppercase tracking-widest mr-2">תוכן המשימה והנחיות</label>
                                <Textarea
                                    placeholder="פרט כאן את כל מה שצריך לדעת..."
                                    value={newTaskDesc}
                                    onChange={(e) => setNewTaskDesc(e.target.value)}
                                    className="min-h-[140px] text-lg font-medium bg-white/[0.03] border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 py-5 rounded-2xl resize-none transition-all shadow-inner"
                                />
                            </div>
                            <div className="flex justify-start pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={isAdding} 
                                    className="w-full md:w-auto px-12 py-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xl font-black rounded-3xl shadow-[0_10px_30px_-5px_rgba(79,70,229,0.4)] transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-4"
                                >
                                    {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 transform rotate-180" />}
                                    צאי לדרך!
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Tasks Feed Header */}
            <div className="flex items-center justify-between px-6">
                <h2 className="text-3xl font-black text-white flex items-center gap-5">
                    <div className="h-3 w-12 bg-gradient-to-r from-indigo-500 to-transparent rounded-full"></div>
                    דופק הפרויקט
                    <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1 rounded-full text-sm font-black ring-1 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        {tasks.filter(t => !t.completed).length} פעילות
                    </span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-8 hidden md:block"></div>
            </div>

            {/* Task Cards Grid */}
            <div className="grid gap-10">
                {tasks.length === 0 && (
                    <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] py-40 flex flex-col items-center justify-center text-slate-500">
                        <CheckCircle2 className="h-24 w-24 mb-6 opacity-5 text-indigo-500" />
                        <p className="text-2xl font-black opacity-20 italic">הכל רגוע כרגע...</p>
                    </div>
                )}

                {tasks.map((task) => (
                    <div key={task.id} className="relative group">
                        {/* Task Neon Glow when active */}
                        {!task.completed && (
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                        )}
                        
                        <Card className={`relative border-none transition-all duration-700 overflow-hidden rounded-[2.5rem] ${task.completed ? 'bg-slate-900/40 opacity-50 grayscale scale-[0.97]' : 'bg-slate-900/80 ring-1 ring-white/10 shadow-2xl shadow-black/50'}`}>
                            <CardHeader className="pb-4 pt-12 px-10 md:px-14 relative">
                                {task.completed && (
                                    <div className="absolute top-8 left-14 px-5 py-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <CheckCircle2 className="h-4 w-4" />
                                        המשימה הושלמה
                                    </div>
                                )}
                                <div className="flex items-start justify-between gap-10">
                                    <div className="flex items-start gap-8 flex-1 text-right">
                                        <div className="pt-2 shrink-0">
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={() => handleToggle(task.id, task.completed)}
                                                className="h-10 w-10 rounded-2xl border-2 border-slate-700 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-transparent transition-all shadow-[0_0_20px_rgba(0,0,0,0.3)] data-[state=checked]:shadow-emerald-500/30"
                                            />
                                        </div>
                                        <div className="space-y-5 flex-1">
                                            <CardTitle className={`text-3xl font-black tracking-tight leading-[1.2] transition-all duration-700 ${task.completed ? 'line-through text-slate-500' : 'text-white drop-shadow-sm group-hover:text-indigo-400'}`}>
                                                {task.title}
                                            </CardTitle>
                                            
                                            {task.description && (
                                                <div className="relative pl-2">
                                                    <div className="absolute -right-5 top-1 bottom-1 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full opacity-30 group-hover:opacity-100 transition-all"></div>
                                                    <p className={`text-xl text-slate-300 font-medium leading-relaxed whitespace-pre-wrap ${task.completed ? 'text-slate-500' : ''}`}>
                                                        {task.description}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-white/5">
                                                <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner text-indigo-400">
                                                    <User className="h-4 w-4" />
                                                    <span className="text-[13px] font-black tracking-wide">נוצר ע"י: <span className="text-white">{task.createdBy?.firstName || "אדמין"}</span></span>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner text-slate-400">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-[13px] font-black uppercase tracking-tight">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: he })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDelete(task.id)} 
                                        className="text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all shrink-0 group-hover:opacity-100 opacity-0 md:h-14 md:w-14 rounded-2xl"
                                    >
                                        <Trash2 className="h-8 w-8" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="px-10 md:px-14 pb-14 pt-6">
                                {/* Chat Section - Floating Neon Box */}
                                <div className="mt-10 pt-12 border-t-2 border-white/5 space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                                                <MessageSquare className="h-6 w-6 text-indigo-400" />
                                            </div>
                                            <span className="text-xl font-black text-white tracking-tight">שיח צוות פתוח (<span className="text-indigo-400">{task.comments?.length || 0}</span>)</span>
                                        </div>
                                        {!task.completed && (
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></div>
                                                <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em]">לייב</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments list */}
                                    <div className="space-y-8 max-h-[550px] overflow-y-auto pr-6 pl-2 -mr-6 custom-scrollbar scroll-smooth">
                                        {task.comments?.map((comment: any) => {
                                            const name = comment.author?.firstName || "אדמין";
                                            const hash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                                            const themes = [
                                                { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20", glow: "shadow-indigo-500/5" },
                                                { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/5" },
                                                { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "shadow-cyan-500/5" },
                                                { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-rose-500/5" },
                                                { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-amber-500/5" }
                                            ];
                                            const theme = themes[Math.abs(hash) % themes.length];

                                            return (
                                                <div key={comment.id} className="flex flex-col gap-4 group/comment items-start animate-in fade-in slide-in-from-right-6 duration-700">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-3 w-3 rounded-full bg-current ${theme.text} shadow-[0_0_15px_currentColor]`}></div>
                                                        <span className={`text-[12px] font-black uppercase tracking-widest ${theme.text}`}>
                                                            {name}
                                                        </span>
                                                        <div className="h-1 w-1 rounded-full bg-white/10"></div>
                                                        <span className="text-[11px] text-slate-500 font-bold">
                                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: he })}
                                                        </span>
                                                    </div>
                                                    <div className={`relative ${theme.bg} ${theme.border} border rounded-[2.2rem] rounded-tr-none px-8 py-5 shadow-2xl ${theme.glow} group-hover/comment:translate-x-[-4px] transition-all duration-500`}>
                                                        <p className="text-lg font-bold leading-relaxed text-slate-200">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        
                                        {(!task.comments || task.comments.length === 0) && (
                                            <div className="py-16 bg-white/[0.01] rounded-[3rem] border border-white/5 text-center shadow-inner">
                                                <p className="text-slate-600 font-black italic tracking-wide">זה המקום להתכתב על המשימה. תהיו הראשונים!</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Add comment form - Cyber Input */}
                                    {!task.completed && (
                                        <div className="relative mt-12 p-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[2.8rem] shadow-2xl focus-within:shadow-indigo-500/10 transition-all border border-white/10 group/input-box overflow-hidden">
                                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-focus-within/input-box:opacity-100 transition-opacity"></div>
                                            <div className="bg-slate-900 rounded-[2.5rem] flex gap-4 p-2">
                                                <Input
                                                    placeholder="כתוב כאן תובנה, שאלה או עדכון..."
                                                    value={commentTexts[task.id] || ""}
                                                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [task.id]: e.target.value }))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddComment(task.id);
                                                        }
                                                    }}
                                                    className="flex-1 bg-transparent border-none py-9 px-8 text-xl font-black text-white placeholder:text-slate-600 focus-visible:ring-0"
                                                />
                                                <Button 
                                                    size="icon" 
                                                    onClick={() => handleAddComment(task.id)}
                                                    disabled={!commentTexts[task.id]?.trim()}
                                                    className="shrink-0 h-16 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[2rem] shadow-xl transition-all hover:scale-110 active:scale-90 flex items-center justify-center"
                                                >
                                                    <Send className="h-8 w-8 transform rotate-180" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.2);
                    border-radius: 20px;
                    border: 2px solid rgba(15, 23, 42, 0.9);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.4);
                }
            `}</style>
        </div>
    );
}
