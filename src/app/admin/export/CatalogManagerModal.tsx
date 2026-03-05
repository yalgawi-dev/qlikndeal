"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Pencil, Check, X, ChevronLeft, ChevronRight, Search, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getCatalogRecords, deleteCatalogRecords, updateCatalogRecord, CatalogType } from "../catalog-actions";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface Props {
    type: CatalogType;
    title: string;
    open: boolean;
    onClose: () => void;
}

const PAGE_SIZE = 30;

// Fields to hide in the table
const HIDDEN_FIELDS = ["importBatchId", "id"];
const READONLY_FIELDS = ["id", "createdAt", "updatedAt", "importBatchId"];

export default function CatalogManagerModal({ type, title, open, onClose }: Props) {
    const [records, setRecords] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Record<string, any>>({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCatalogRecords(type, { skip: page * PAGE_SIZE, take: PAGE_SIZE, search });
            setRecords(res.records);
            setTotal(res.total);
            setSelected(new Set());
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }, [type, page, search]);

    useEffect(() => {
        if (open) fetchRecords();
    }, [open, fetchRecords]);

    const doSearch = () => {
        setSearch(searchInput);
        setPage(0);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === records.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(records.map(r => r.id)));
        }
    };

    const startEdit = (record: any) => {
        setEditingId(record.id);
        setEditData({ ...record });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setSaving(true);
        try {
            await updateCatalogRecord(type, editingId, editData);
            toast.success("הרשומה עודכנה בהצלחה");
            setEditingId(null);
            fetchRecords();
        } catch (e: any) {
            toast.error("שגיאה בעדכון: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (selected.size === 0) return;
        setDeleting(true);
        try {
            const res = await deleteCatalogRecords(type, Array.from(selected));
            toast.success(`נמחקו ${res.deleted} רשומות בהצלחה`);
            setDeleteConfirm(false);
            setSelected(new Set());
            fetchRecords();
        } catch (e: any) {
            toast.error("שגיאה במחיקה: " + e.message);
        } finally {
            setDeleting(false);
        }
    };

    // Get displayable columns from the first record
    const columns = records.length > 0
        ? Object.keys(records[0]).filter(k => !HIDDEN_FIELDS.includes(k))
        : [];

    const totalPages = Math.ceil(total / PAGE_SIZE);

    const renderCellValue = (val: any): string => {
        if (val === null || val === undefined) return "";
        if (Array.isArray(val)) return val.join(", ");
        if (typeof val === "boolean") return val ? "V" : "";
        if (typeof val === "object") return JSON.stringify(val);
        return String(val);
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-[96vw] max-h-[94vh] flex flex-col bg-[#0a0a12] border-white/10 text-white p-0 gap-0">
                <DialogHeader className="p-5 pb-3 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl font-black text-white">ניהול קטלוג: {title}</DialogTitle>
                            <DialogDescription className="text-slate-400 text-sm mt-1">
                                {total} רשומות סה"כ
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && doSearch()}
                                    placeholder="חיפוש לפי מותג/דגם..."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-9 w-64 text-sm"
                                    dir="rtl"
                                />
                                <Button onClick={doSearch} size="sm" className="bg-indigo-600 hover:bg-indigo-700 h-9 px-3">
                                    <Search size={14} />
                                </Button>
                                {search && (
                                    <Button onClick={() => { setSearchInput(""); setSearch(""); setPage(0); }} size="sm" variant="ghost" className="text-slate-400 h-9 px-3">
                                        <X size={14} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bulk actions bar */}
                    {selected.size > 0 && (
                        <div className="flex items-center gap-3 mt-3 px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/20">
                            <span className="text-red-400 text-sm font-bold">{selected.size} רשומות נבחרו</span>
                            {!deleteConfirm ? (
                                <Button
                                    onClick={() => setDeleteConfirm(true)}
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 h-8 text-xs"
                                >
                                    <Trash2 size={12} className="ml-1" />
                                    מחק נבחרים
                                </Button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-yellow-400" />
                                    <span className="text-yellow-400 text-xs">בטוח? פעולה בלתי הפיכה!</span>
                                    <Button onClick={handleDelete} disabled={deleting} size="sm" className="bg-red-700 hover:bg-red-800 h-8 text-xs">
                                        {deleting ? <Loader2 size={12} className="animate-spin" /> : "אשר מחיקה"}
                                    </Button>
                                    <Button onClick={() => setDeleteConfirm(false)} size="sm" variant="ghost" className="text-slate-400 h-8 text-xs">
                                        ביטול
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogHeader>

                {/* Table */}
                <div className="flex-1 overflow-auto p-2">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="animate-spin text-indigo-400" size={32} />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-slate-500">
                            {search ? "לא נמצאו תוצאות לחיפוש זה" : "הקטלוג ריק"}
                        </div>
                    ) : (
                        <table className="w-full text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 sticky top-0">
                                    <th className="w-8 p-2">
                                        <input
                                            type="checkbox"
                                            checked={selected.size === records.length && records.length > 0}
                                            onChange={toggleAll}
                                            className="accent-indigo-500"
                                        />
                                    </th>
                                    <th className="w-16 p-2 text-slate-400 font-semibold text-right">פעולות</th>
                                    {columns.map(col => (
                                        <th key={col} className="p-2 text-slate-400 font-semibold text-right whitespace-nowrap">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => {
                                    const isEditing = editingId === record.id;
                                    const isSelected = selected.has(record.id);
                                    return (
                                        <tr
                                            key={record.id}
                                            className={`border-b border-white/5 transition-colors ${isSelected ? "bg-indigo-500/10" : "hover:bg-white/3"} ${isEditing ? "bg-blue-500/10" : ""}`}
                                        >
                                            <td className="p-2">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(record.id)}
                                                    className="accent-indigo-500"
                                                />
                                            </td>
                                            <td className="p-2">
                                                {isEditing ? (
                                                    <div className="flex gap-1">
                                                        <button onClick={saveEdit} disabled={saving} className="text-green-400 hover:text-green-300">
                                                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                        </button>
                                                        <button onClick={cancelEdit} className="text-red-400 hover:text-red-300">
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => startEdit(record)} className="text-blue-400 hover:text-blue-300">
                                                            <Pencil size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelected(new Set([record.id])); setDeleteConfirm(true); }}
                                                            className="text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            {columns.map(col => (
                                                <td key={col} className="p-2 max-w-[200px]">
                                                    {isEditing && !READONLY_FIELDS.includes(col) ? (
                                                        <input
                                                            value={Array.isArray(editData[col]) ? editData[col].join(", ") : String(editData[col] ?? "")}
                                                            onChange={e => {
                                                                const raw = e.target.value;
                                                                // If the original was an array, keep it as array on save
                                                                const original = record[col];
                                                                setEditData(prev => ({
                                                                    ...prev,
                                                                    [col]: Array.isArray(original) ? raw.split(",").map(s => s.trim()).filter(Boolean) : raw
                                                                }));
                                                            }}
                                                            className="bg-white/10 border border-white/20 rounded px-1 py-0.5 text-white text-xs w-full min-w-[80px]"
                                                        />
                                                    ) : (
                                                        <span className="truncate block text-slate-300" title={renderCellValue(record[col])}>
                                                            {renderCellValue(record[col])}
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer / Pagination */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 flex-shrink-0 bg-black/20">
                    <span className="text-slate-500 text-xs">
                        {Math.min(page * PAGE_SIZE + 1, total)}–{Math.min((page + 1) * PAGE_SIZE, total)} מתוך {total}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm" variant="ghost"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="text-slate-400 hover:text-white h-8 w-8 p-0"
                        >
                            <ChevronRight size={14} />
                        </Button>
                        <span className="text-slate-400 text-xs">{page + 1} / {Math.max(1, totalPages)}</span>
                        <Button
                            size="sm" variant="ghost"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading}
                            className="text-slate-400 hover:text-white h-8 w-8 p-0"
                        >
                            <ChevronLeft size={14} />
                        </Button>
                    </div>
                    <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white h-8 text-xs">
                        סגור
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
