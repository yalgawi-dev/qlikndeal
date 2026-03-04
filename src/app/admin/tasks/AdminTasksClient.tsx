"use client";

import { useState } from "react";
import { createAdminTask, toggleAdminTask, addTaskComment, deleteAdminTask } from "../collaboration-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MessageSquare, Send, User, Clock, CheckCircle2 } from "lucide-react";
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
        <div className="max-w-4xl mx-auto space-y-10" dir="rtl">
            {/* New Task Entry Card */}
            <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden ring-1 ring-black/5">
                <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50/50 to-white/50 border-b border-indigo-100/30">
                    <CardTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-200">
                            <Plus className="h-6 w-6 text-white" />
                        </div>
                        משימה חדשה
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-8 px-6 md:px-10 pb-10">
                    <form onSubmit={handleAddTask} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-500 mr-1">כותרת המשימה</label>
                            <Input
                                placeholder="מה צריך לעשות?"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                className="text-xl font-bold border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 py-7 rounded-2xl bg-slate-50/50 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-slate-500 mr-1">תוכן המשימה (פירוט)</label>
                            <Textarea
                                placeholder="כאן אפשר למלא את כל הפרטים..."
                                value={newTaskDesc}
                                onChange={(e) => setNewTaskDesc(e.target.value)}
                                className="min-h-[120px] text-lg font-medium border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 py-4 rounded-2xl bg-slate-50/50 resize-none transition-all"
                            />
                        </div>
                        <div className="flex justify-start">
                            <Button 
                                type="submit" 
                                disabled={isAdding} 
                                className="w-full md:w-auto px-10 py-8 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-black rounded-3xl shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                {isAdding ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6 transform rotate-180" />}
                                צור משימה עכשיו
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Tasks Feed Header */}
            <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-4">
                    <div className="h-2 w-10 bg-indigo-500 rounded-full"></div>
                    משימות פעילות
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-black backdrop-blur-md">
                        {tasks.filter(t => !t.completed).length}
                    </span>
                </h2>
                <div className="h-px flex-1 bg-white/10 mx-6 hidden md:block"></div>
            </div>

            {/* Task Cards Grid */}
            <div className="grid gap-8">
                {tasks.length === 0 && (
                    <div className="bg-white/5 backdrop-blur-md border-2 border-dashed border-white/10 rounded-[3rem] py-32 flex flex-col items-center justify-center text-slate-400">
                        <CheckCircle2 className="h-20 w-20 mb-6 opacity-10 text-emerald-400" />
                        <p className="text-2xl font-black opacity-30">הכל נקי! אין משימות פתוחות</p>
                    </div>
                )}

                {tasks.map((task) => (
                    <Card key={task.id} className={`group border-none shadow-2xl transition-all duration-700 hover:translate-y-[-4px] overflow-hidden ${task.completed ? 'opacity-40 grayscale blur-[0.5px] scale-[0.98]' : 'bg-white/95 backdrop-blur-xl ring-1 ring-black/5'}`}>
                        <CardHeader className="pb-4 pt-10 px-8 md:px-12 relative">
                            {task.completed && (
                                <div className="absolute top-8 left-12 px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3" />
                                    המשימה בוצעה
                                </div>
                            )}
                            <div className="flex items-start justify-between gap-8">
                                <div className="flex items-start gap-6 flex-1 text-right">
                                    <div className="pt-2 shrink-0">
                                        <Checkbox
                                            checked={task.completed}
                                            onCheckedChange={() => handleToggle(task.id, task.completed)}
                                            className="h-9 w-9 rounded-2xl border-2 border-slate-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-transparent transition-all shadow-lg shadow-emerald-100"
                                        />
                                    </div>
                                    <div className="space-y-4 flex-1">
                                        <CardTitle className={`text-3xl font-black tracking-tight leading-[1.1] transition-all duration-700 ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                                            {task.title}
                                        </CardTitle>
                                        
                                        {task.description && (
                                            <div className="relative group/desc">
                                                <div className="absolute -right-4 top-2 bottom-2 w-1.5 bg-indigo-500/20 rounded-full group-hover/desc:bg-indigo-500/40 transition-all"></div>
                                                <p className={`text-xl text-slate-600 font-medium leading-relaxed whitespace-pre-wrap pr-2 ${task.completed ? 'italic' : ''}`}>
                                                    {task.description}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-5 mt-6 pt-6 border-t border-slate-100/50">
                                            <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm text-indigo-700">
                                                <div className="p-1 bg-white rounded-lg shadow-sm">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <span className="text-[12px] font-black">נוצר ע"י: {task.createdBy?.firstName || "אדמין"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shadow-sm text-slate-500">
                                                <Clock className="h-4 w-4" />
                                                <span className="text-[12px] font-black uppercase">{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true, locale: he })}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDelete(task.id)} 
                                    className="text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0 group-hover:opacity-100 opacity-0 md:h-12 md:w-12 rounded-2xl"
                                >
                                    <Trash2 className="h-7 w-7" />
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="px-8 md:px-12 pb-12 pt-4">
                            {/* Chat Section */}
                            <div className="mt-8 pt-10 border-t-2 border-slate-50 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-100">
                                            <MessageSquare className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-lg font-black text-slate-800 tracking-tight">עדכונים וצ'אט צוות ({task.comments?.length || 0})</span>
                                    </div>
                                    {!task.completed && (
                                        <span className="text-[10px] font-black text-indigo-500 animate-pulse uppercase tracking-[0.2em]">Live Channel</span>
                                    )}
                                </div>

                                {/* Comments list */}
                                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 pl-2 -mr-4 custom-scrollbar">
                                    {task.comments?.map((comment: any) => {
                                        const name = comment.author?.firstName || "אדמין";
                                        const hash = name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                                        const themeColors = [
                                            { main: "text-indigo-700", bg: "bg-indigo-50/70", border: "border-indigo-100", dot: "bg-indigo-500" },
                                            { main: "text-emerald-700", bg: "bg-emerald-50/70", border: "border-emerald-100", dot: "bg-emerald-500" },
                                            { main: "text-rose-700", bg: "bg-rose-50/70", border: "border-rose-100", dot: "bg-rose-500" },
                                            { main: "text-amber-700", bg: "bg-amber-50/70", border: "border-amber-100", dot: "bg-amber-500" },
                                            { main: "text-violet-700", bg: "bg-violet-50/70", border: "border-violet-100", dot: "bg-violet-500" }
                                        ];
                                        const theme = themeColors[Math.abs(hash) % themeColors.length];

                                        return (
                                            <div key={comment.id} className="flex flex-col gap-3 group/comment items-start animate-in fade-in slide-in-from-right-4 duration-500">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-2.5 w-2.5 rounded-full ${theme.dot} shadow-[0_0_10px_rgba(0,0,0,0.1)] group-hover/comment:scale-125 transition-transform`}></div>
                                                    <span className={`text-xs font-black uppercase tracking-wider ${theme.main}`}>
                                                        {name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-300 font-bold">
                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: he })}
                                                    </span>
                                                </div>
                                                <div className={`relative ${theme.bg} ${theme.border} border-2 rounded-[2rem] rounded-tr-none px-7 py-4 shadow-sm group-hover/comment:shadow-md group-hover/comment:translate-x-[-2px] transition-all duration-300`}>
                                                    <p className={`text-base font-bold leading-relaxed ${theme.main}`}>
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    
                                    {(!task.comments || task.comments.length === 0) && (
                                        <div className="py-12 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center">
                                            <p className="text-slate-400 font-black italic">אין עדכונים עדיין. צריך לדבר על זה?</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add comment form */}
                                {!task.completed && (
                                    <div className="flex gap-4 mt-10 p-3 bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border-2 border-indigo-50 transition-all focus-within:border-indigo-500/20 group/input">
                                        <Input
                                            placeholder="כתוב כאן תגובה או שאלה..."
                                            value={commentTexts[task.id] || ""}
                                            onChange={(e) => setCommentTexts(prev => ({ ...prev, [task.id]: e.target.value }))}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAddComment(task.id);
                                                }
                                            }}
                                            className="flex-1 bg-transparent border-none py-8 text-lg font-black text-slate-800 placeholder:text-slate-300 focus-visible:ring-0"
                                        />
                                        <Button 
                                            size="icon" 
                                            onClick={() => handleAddComment(task.id)}
                                            disabled={!commentTexts[task.id]?.trim()}
                                            className="shrink-0 h-16 w-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.8rem] shadow-xl shadow-indigo-200 transition-all hover:scale-110 active:scale-95 group-hover/input:scale-105"
                                        >
                                            <Send className="h-7 w-7 transform rotate-180" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}
