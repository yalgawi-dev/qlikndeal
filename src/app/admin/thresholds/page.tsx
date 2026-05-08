"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";

const CATEGORIES = ["SMARTPHONES", "LAPTOPS", "DESKTOPS", "AIO", "CUSTOM_DESKTOPS", "MOTHERBOARDS", "VEHICLES", "GENERAL"];

interface Threshold {
  id: string | null;
  category: string;
  field: string;
  threshold: number;
  suggestionMargin: number;
  occurrenceCount: number;
}

export default function ThresholdsPage() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newCategory, setNewCategory] = useState("LAPTOPS");
  const [newField, setNewField] = useState("");
  const [newThreshold, setNewThreshold] = useState("0.8");
  const [newMargin, setNewMargin] = useState("0.4");

  const fetchThresholds = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "All" ? "/api/admin/thresholds" : `/api/admin/thresholds?category=${selectedCategory}`;
      const res = await fetch(url);
      const data = await res.json();
      setThresholds(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [selectedCategory]);

  useEffect(() => { fetchThresholds(); }, [fetchThresholds]);

  const handleSave = async (id?: string | null, existingData?: Threshold) => {
    setSaving(true);
    try {
      const payload = id ? { id, ...existingData } : {
        category: newCategory, field: newField,
        threshold: parseFloat(newThreshold), suggestionMargin: parseFloat(newMargin)
      };
      const res = await fetch("/api/admin/thresholds", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (!id) setNewField("");
        fetchThresholds();
      }
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string | null) => {
    if (!id || !confirm("לאפס שדה זה?")) return;
    await fetch(`/api/admin/thresholds?id=${id}`, { method: "DELETE" });
    fetchThresholds();
  };

  const updateStateValue = (index: number, key: keyof Threshold, value: string) => {
    const updated = [...thresholds];
    updated[index] = { ...updated[index], [key]: parseFloat(value) };
    setThresholds(updated);
  };

  return (
    <div className="p-6 space-y-8" dir="rtl">
      <h1 className="text-3xl font-bold text-white">ניהול טרשהולדים (3D)</h1>
      <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-900/60 p-4 rounded-xl border border-amber-500/20">
          <div className="space-y-2">
            <Label className="text-amber-400">קטגוריה</Label>
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-gray-800 border-gray-700 h-10 rounded-md px-3 text-white">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label className="text-amber-400">שם שדה</Label><Input value={newField} onChange={e => setNewField(e.target.value)} className="bg-gray-800 border-gray-700 text-white" /></div>
          <div className="space-y-2"><Label className="text-amber-400">Threshold</Label><Input type="number" step="0.1" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} className="bg-gray-800 border-gray-700 text-white" /></div>
          <Button onClick={() => handleSave()} disabled={!newField || saving} className="bg-amber-600 hover:bg-amber-500">
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4 mr-2" />} הוסף
          </Button>
        </div>
        <div className="pt-6 border-t border-gray-800">
          <div className="flex items-center gap-4 mb-6">
            <Label className="text-gray-300">סינון לפי קטגוריה:</Label>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-gray-800 border-gray-700 h-9 rounded-md px-3 text-white w-48">
              <option value="All">הצג הכל</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {loading ? <Loader2 className="animate-spin mx-auto text-purple-500" /> : (
            <div className="space-y-8">
              {CATEGORIES.map(cat => {
                const catThresholds = thresholds.filter(t => t.category === cat || t.category === cat.toUpperCase());
                if (catThresholds.length === 0 && selectedCategory !== "All" && selectedCategory !== cat) return null;
                if (catThresholds.length === 0 && selectedCategory === "All") return null;

                return (
                  <div key={cat} className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="bg-gradient-to-l from-indigo-900/40 to-black/40 px-6 py-3 border-b border-indigo-500/20">
                      <h2 className="text-xl font-black text-indigo-300 tracking-wide">{cat}</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {catThresholds.map((t, i) => {
                        const globalIndex = thresholds.findIndex(x => x.id === t.id);
                        return (
                          <div key={t.id || i} className="bg-gray-800/80 p-5 rounded-xl border border-gray-700 relative group hover:border-indigo-500/50 transition-colors shadow-lg">
                            <button onClick={async () => {
                              await handleDelete(t.id);
                            }} className="absolute top-2 left-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="mb-5 border-b border-gray-700 pb-3">
                              <div className="font-black text-xl text-gray-100">{t.field}</div>
                              {false && t.occurrenceCount > 0 && <div className="text-[10px] text-emerald-400 font-bold mt-1">נלמד {t.occurrenceCount} פעמים</div>}
                            </div>
                            <div className="space-y-5">
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-xs text-indigo-200 font-bold">רף מילוי (FILL)</Label>
                                  <span className="text-xs bg-black/50 px-2 rounded text-indigo-400 font-mono">{t.threshold.toFixed(2)}</span>
                                </div>
                                <input type="range" step="0.05" max="1" min="0" value={t.threshold} onChange={e => updateStateValue(globalIndex, 'threshold', e.target.value)} className="w-full accent-indigo-500 cursor-pointer" />
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <Label className="text-xs text-amber-200 font-bold">טווח בועה (Gap)</Label>
                                  <span className="text-xs bg-black/50 px-2 rounded text-amber-400 font-mono">{t.suggestionMargin.toFixed(2)}</span>
                                </div>
                                <input type="range" step="0.05" max="1" min="0" value={t.suggestionMargin} onChange={e => updateStateValue(globalIndex, 'suggestionMargin', e.target.value)} className="w-full accent-amber-500 cursor-pointer" />
                              </div>
                            </div>
                            <Button variant="secondary" className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white border-0 transition-transform active:scale-95 shadow-lg shadow-indigo-900/20" onClick={() => handleSave(t.id, t)}>
                              <Save className="w-4 h-4 mr-2" /> ביצוע שינוי
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}