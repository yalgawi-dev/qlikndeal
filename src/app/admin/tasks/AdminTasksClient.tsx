"use client";

import { useState } from "react";
import { createAdminTask, toggleAdminTask, updateAdminTaskNotes, deleteAdminTask } from "../collaboration-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, MessageSquare, User } from "lucide-react";

interface AdminTasksClientProps {
    initialTasks: any[];
}

export default function AdminTasksClient({ initialTasks }: AdminTasksClientProps) {
    const [tasks, setTasks] = useState(initialTasks);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        setIsAdding(true);
        const result = await createAdminTask(newTaskTitle);
        setIsAdding(false);

        if (result.success) {
            setNewTaskTitle("");
            toast.success("Task added");
            // Reload page to get fresh data (simple way)
            window.location.reload();
        } else {
            toast.error(result.error || "Failed to add task");
        }
    };

    const handleToggle = async (taskId: string, currentStatus: boolean) => {
        const newStatus = !currentStatus;
        const result = await toggleAdminTask(taskId, newStatus);
        if (result.success) {
            setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: newStatus } : t));
            toast.success(newStatus ? "Task completed" : "Task reopened");
        }
    };

    const handleUpdateNotes = async (taskId: string, notes: string) => {
        const result = await updateAdminTaskNotes(taskId, notes);
        if (result.success) {
            toast.success("Notes updated");
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm("Are you sure?")) return;
        const result = await deleteAdminTask(taskId);
        if (result.success) {
            setTasks(tasks.filter(t => t.id !== taskId));
            toast.success("Task deleted");
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <form onSubmit={handleAddTask} className="flex gap-2">
                <Input
                    placeholder="משימה חדשה..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 bg-white/5 border-white/10"
                />
                <Button type="submit" disabled={isAdding} className="bg-indigo-600 hover:bg-indigo-700">
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 ml-1" />}
                    הוסף
                </Button>
            </form>

            <div className="grid gap-4">
                {tasks.length === 0 && (
                    <p className="text-center text-slate-400 py-12 border-2 border-dashed border-white/5 rounded-lg">
                        אין משימות כרגע. יום נפלא!
                    </p>
                )}
                {tasks.map((task) => (
                    <Card key={task.id} className={`${task.completed ? 'opacity-60 bg-white/5 border-white/5' : 'bg-white/10 border-white/10 shadow-lg backdrop-blur-sm'} transition-all duration-300`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={task.completed}
                                    onCheckedChange={() => handleToggle(task.id, task.completed)}
                                    className="border-indigo-500/50 data-[state=checked]:bg-indigo-500"
                                />
                                <CardTitle className={`text-lg transition-all ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                                    {task.title}
                                </CardTitle>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-400/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2 text-xs text-indigo-400/70 mb-1 font-medium">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>הערות ושיתוף:</span>
                                </div>
                                <Textarea
                                    placeholder="הוסף הערות לקולגות..."
                                    defaultValue={task.notes || ""}
                                    onBlur={(e) => handleUpdateNotes(task.id, e.target.value)}
                                    className="text-sm min-h-[80px] bg-black/20 border-white/5 text-gray-300 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 placeholder:text-gray-600"
                                />
                                <div className="flex justify-between items-center text-[10px] text-gray-500 mt-3 pt-2 border-t border-white/5">
                                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {task.createdBy?.firstName || "אדמין"}</span>
                                    <span>{new Date(task.createdAt).toLocaleDateString("he-IL")}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
