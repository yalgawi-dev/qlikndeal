"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Sparkles, Check, ArrowRight, ArrowLeft, Laptop, Monitor, 
  Gamepad2, Briefcase, Paintbrush, Code, ShieldCheck, X, Plus, BookOpen, Plane
} from "lucide-react";

interface ComputerCategory {
  id: number;
  categoryNameHe: string;
  categoryNameEn: string;
  description: string;
  minCpuTier: string;
  minRamGb: number;
  minStorageGb: number;
  storageType: string;
  recommendedGpu: string;
  manufacturerRecommendation: string;
  dynamicAttributes: any;
}

interface SoftwareApplication {
  id: number;
  appNameEn: string;
  appNameHe: string | null;
  categoryId: number | null;
  category: ComputerCategory | null;
  minRamGbOverride: number | null;
  minVramGbOverride: number | null;
  isPopular: boolean;
  iconUrl: string | null;
}

interface ComputerConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilter?: {
    categoryName: string;
    minRamGb: number;
    minStorageGb: number;
    minCpuTier: string;
    recommendedGpu: string;
    userBudget: number;
    preferredFormFactor: "laptop" | "desktop";
    selectedApps?: any[];
    selectedCategoryId?: number;
  } | null;
  onApplyFilter: (filter: {
    categoryName: string;
    minRamGb: number;
    minStorageGb: number;
    minCpuTier: string;
    recommendedGpu: string;
    userBudget: number;
    preferredFormFactor: "laptop" | "desktop";
    selectedApps?: any[];
    selectedCategoryId?: number;
  }) => void;
}

// Icon map per category id
const CATEGORY_ICONS: Record<number, React.ReactNode> = {
  1: <Briefcase className="w-8 h-8" />,
  2: <Gamepad2 className="w-8 h-8" />,
  3: <Paintbrush className="w-8 h-8" />,
  4: <Code className="w-8 h-8" />,
  5: <Plane className="w-8 h-8" />,
};

const CATEGORY_COLORS: Record<number, string> = {
  1: "from-emerald-600 to-teal-600",
  2: "from-pink-600 to-rose-600",
  3: "from-purple-600 to-violet-600",
  4: "from-blue-600 to-cyan-600",
  5: "from-amber-500 to-orange-500",
};

const CATEGORY_BORDER: Record<number, string> = {
  1: "border-emerald-500",
  2: "border-pink-500",
  3: "border-purple-500",
  4: "border-blue-500",
  5: "border-amber-500",
};

export default function ComputerConsultantModal({
  isOpen,
  onClose,
  initialFilter,
  onApplyFilter
}: ComputerConsultantModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ComputerCategory[]>([]);
  
  // Step 1: Category selection
  const [selectedCategory, setSelectedCategory] = useState<ComputerCategory | null>(null);

  // Step 2: Software Selections (optional)
  const [popularSoftware, setPopularSoftware] = useState<SoftwareApplication[]>([]);
  const [filteredPopular, setFilteredPopular] = useState<SoftwareApplication[]>([]);
  const [selectedApps, setSelectedApps] = useState<SoftwareApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SoftwareApplication[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Custom software request states
  const [requestingApp, setRequestingApp] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showRequestInput, setShowRequestInput] = useState(false);
  const [customAppName, setCustomAppName] = useState("");

  // Step 3 & 4
  const [preferredFormFactor, setPreferredFormFactor] = useState<"laptop" | "desktop" | null>(null);
  const [budget, setBudget] = useState<string>("");
  const [savingLog, setSavingLog] = useState(false);

  // Load baseline data on mount
  useEffect(() => {
    async function initData() {
      try {
        const [catsRes, appsRes] = await Promise.all([
          fetch("/api/marketplace/consultant/categories"),
          fetch("/api/marketplace/consultant/software?popular=true")
        ]);
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          if (catsData.success) setCategories(catsData.categories);
        }
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (appsData.success) setPopularSoftware(appsData.software);
        }
      } catch (e) {
        console.error("Failed to load initial consultant data", e);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // Filter popular software by selected category
  useEffect(() => {
    if (selectedCategory) {
      const filtered = popularSoftware.filter(app => app.categoryId === selectedCategory.id);
      setFilteredPopular(filtered.length > 0 ? filtered : popularSoftware.filter(app => app.isPopular).slice(0, 12));
    } else {
      setFilteredPopular(popularSoftware.filter(app => app.isPopular).slice(0, 12));
    }
  }, [selectedCategory, popularSoftware]);

  // Debounced search for software
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/marketplace/consultant/software?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setSearchResults(data.software);
        }
      } catch (e) {
        console.error("Error searching software", e);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  // Pre-populate selections if initialFilter is passed
  useEffect(() => {
    if (isOpen && initialFilter) {
      if (initialFilter.selectedApps) setSelectedApps(initialFilter.selectedApps);
      setPreferredFormFactor(initialFilter.preferredFormFactor);
      setBudget(initialFilter.userBudget > 0 ? String(initialFilter.userBudget) : "");
      setStep(1);
    } else if (isOpen && !initialFilter) {
      resetForm();
    }
  }, [isOpen, initialFilter]);

  const handleNext = () => { if (step < 5) setStep(step + 1); };
  const handlePrev = () => { if (step > 1) setStep(step - 1); };

  const resetForm = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedApps([]);
    setPreferredFormFactor(null);
    setBudget("");
    setSearchQuery("");
    setRequestSent(false);
    setShowRequestInput(false);
    setCustomAppName("");
  };

  const handleRequestSoftware = async (name: string) => {
    if (!name.trim()) return;
    setRequestingApp(true);
    try {
      const res = await fetch("/api/marketplace/software-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appName: name.trim() })
      });
      if (res.ok) {
        toast.success("הבקשה נשלחה למנהל המערכת בהצלחה!");
        setRequestSent(true);
      } else {
        toast.error("שגיאה בשליחת הבקשה");
      }
    } catch (e) {
      toast.error("שגיאה בתקשורת עם השרת");
    } finally {
      setRequestingApp(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getCpuTierLevel = (cpu: string | null) => {
    if (!cpu) return 0;
    const c = cpu.toLowerCase();
    if (c.includes("i9") || c.includes("ryzen 9")) return 5;
    if (c.includes("i7") || c.includes("ryzen 7")) return 4;
    if (c.includes("i5") || c.includes("ryzen 5")) return 3;
    if (c.includes("ultra 5") || c.includes("u-series")) return 2;
    if (c.includes("i3") || c.includes("ryzen 3")) return 1;
    return 1;
  };

  const getCpuTierFromLevel = (lvl: number) => {
    if (lvl === 5) return "Core i9 / Ryzen 9";
    if (lvl === 4) return "Core i7 / Ryzen 7";
    if (lvl === 3) return "Core i5 / Ryzen 5";
    if (lvl === 2) return "Core Ultra 5 / Ryzen 5 U";
    return "Core i3 / Ryzen 3";
  };

  const getGpuTierLevel = (gpu: string | null) => {
    if (!gpu) return 1;
    const g = gpu.toLowerCase();
    if (g.includes("rtx 4070") || g.includes("4060 ti")) return 3;
    if (g.includes("rtx 4060") || g.includes("rx 7600") || g.includes("dedicated")) return 2;
    return 1;
  };

  const getGpuTierFromLevel = (lvl: number) => {
    if (lvl === 3) return "RTX 4060 Ti 16GB / RTX 4070";
    if (lvl === 2) return "RTX 4060 / RX 7600";
    return "Integrated";
  };

  // Calculate final specs: base from category + override from selected apps (Maximum Ceiling)
  const calculateSpecs = () => {
    if (!selectedCategory) return null;
    
    let maxRam = selectedCategory.minRamGb;
    let maxStorage = selectedCategory.minStorageGb;
    let maxCpuLevel = getCpuTierLevel(selectedCategory.minCpuTier);
    let maxGpuLevel = getGpuTierLevel(selectedCategory.recommendedGpu);

    // Apps override only if they're MORE demanding
    if (selectedApps.length > 0) {
      const appMaxRam = Math.max(...selectedApps.map(a => a.minRamGbOverride || selectedCategory.minRamGb));
      const appMaxStorage = Math.max(...selectedApps.map(a => a.category?.minStorageGb || selectedCategory.minStorageGb));
      const appMaxCpu = Math.max(...selectedApps.map(a => getCpuTierLevel(a.category?.minCpuTier || null)));
      const appMaxGpu = Math.max(...selectedApps.map(a => {
        if (a.minVramGbOverride && a.minVramGbOverride > 0) {
          if (a.minVramGbOverride >= 8) return 3;
          return 2;
        }
        return getGpuTierLevel(a.category?.recommendedGpu || null);
      }));

      maxRam = Math.max(maxRam, appMaxRam);
      maxStorage = Math.max(maxStorage, appMaxStorage);
      maxCpuLevel = Math.max(maxCpuLevel, appMaxCpu);
      maxGpuLevel = Math.max(maxGpuLevel, appMaxGpu);
    }

    return {
      minRamGb: maxRam,
      minStorageGb: maxStorage,
      minCpuTier: getCpuTierFromLevel(maxCpuLevel),
      recommendedGpu: getGpuTierFromLevel(maxGpuLevel),
      storageType: selectedCategory.storageType || "SSD NVMe",
      manufacturerRecommendation: selectedCategory.manufacturerRecommendation || "",
    };
  };

  const handleSubmit = async () => {
    const computed = calculateSpecs();
    if (!computed || !preferredFormFactor || !selectedCategory) return;
    
    setSavingLog(true);
    try {
      const budgetNum = parseFloat(budget) || 0;
      
      await fetch("/api/marketplace/consultant/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedCategoryId: selectedCategory.id,
          preferredFormFactor,
          userBudget: budgetNum > 0 ? budgetNum : null,
          aiAdjustedRecommendation: {
            minRamGb: computed.minRamGb,
            minStorageGb: computed.minStorageGb,
            minCpuTier: computed.minCpuTier,
            recommendedGpu: computed.recommendedGpu,
            selectedApps: selectedApps.map(a => ({ id: a.id, appNameEn: a.appNameEn }))
          }
        })
      });

      const displayName = selectedApps.length > 0
        ? `${selectedCategory.categoryNameHe} (${selectedApps.map(a => a.appNameHe || a.appNameEn).join(", ")})`
        : selectedCategory.categoryNameHe;

      onApplyFilter({
        categoryName: displayName,
        minRamGb: computed.minRamGb,
        minStorageGb: computed.minStorageGb,
        minCpuTier: computed.minCpuTier,
        recommendedGpu: computed.recommendedGpu,
        userBudget: budgetNum,
        preferredFormFactor,
        selectedApps,
        selectedCategoryId: selectedCategory.id,
      });

      handleClose();
    } catch (e) {
      console.error("Failed to log consultant submission", e);
    } finally {
      setSavingLog(false);
    }
  };

  const getAppIcon = (catId: number | null) => {
    if (catId === 2) return <Gamepad2 className="w-4 h-4 text-pink-400" />;
    if (catId === 3) return <Paintbrush className="w-4 h-4 text-purple-400" />;
    if (catId === 4) return <Code className="w-4 h-4 text-blue-400" />;
    return <Briefcase className="w-4 h-4 text-emerald-400" />;
  };

  const computedSpecs = calculateSpecs();
  const TOTAL_STEPS = 5;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => { if (!val) handleClose(); }}>
      <DialogContent className="max-w-2xl bg-[#0b0f19]/95 border border-purple-500/20 text-white rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[86dvh] md:max-h-[90vh]" dir="rtl">
        
        {/* Banner Glow */}
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />

        <DialogHeader className="p-4 border-b border-gray-800 text-right">
          <DialogTitle className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-200 flex items-center justify-start gap-2">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            הטייס האוטומטי למציאת מחשב
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            <p className="text-purple-300/60 text-sm animate-pulse">טוען מודל החלטה חכם...</p>
          </div>
        ) : (
          <>
          {/* ── Scrollable step content ── */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-6 pb-2">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between max-w-lg mx-auto mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step === s 
                      ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]" 
                      : step > s 
                      ? "bg-purple-900/30 border-purple-500/50 text-purple-300" 
                      : "bg-gray-900/50 border-gray-800 text-gray-500"
                  }`}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 5 && (
                    <div className={`flex-1 h-0.5 mx-1.5 transition-all ${
                      step > s ? "bg-purple-500/50" : "bg-gray-800"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step labels */}
            <div className="flex justify-between text-[10px] text-gray-500 -mt-2 max-w-lg mx-auto px-1">
              <span className={step === 1 ? "text-purple-400" : ""}>פרופיל שימוש</span>
              <span className={step === 2 ? "text-purple-400" : ""}>תוכנות (אופציה)</span>
              <span className={step === 3 ? "text-purple-400" : ""}>סוג מחשב</span>
              <span className={step === 4 ? "text-purple-400" : ""}>תקציב</span>
              <span className={step === 5 ? "text-purple-400" : ""}>סיכום</span>
            </div>

            {/* ══ STEP 1: Category Selection (Primary) ══ */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center space-y-1 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-100">למה בעיקר ישמש המחשב?</h3>
                  <p className="text-xs sm:text-sm text-gray-400">בחר את הפרופיל המתאים ביותר לצרכיך</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map(cat => {
                    const isSelected = selectedCategory?.id === cat.id;
                    const colorClass = CATEGORY_COLORS[cat.id] || "from-gray-600 to-gray-700";
                    const borderClass = CATEGORY_BORDER[cat.id] || "border-gray-600";
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`p-4 rounded-2xl border-2 text-right transition-all flex flex-col gap-3 ${
                          isSelected
                            ? `bg-gradient-to-br ${colorClass} bg-opacity-20 ${borderClass} shadow-lg`
                            : "bg-[#111522] border-gray-800 hover:border-gray-700 hover:bg-gray-900/60"
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl w-fit bg-gradient-to-br ${colorClass} ${isSelected ? "opacity-100" : "opacity-60"}`}>
                          {CATEGORY_ICONS[cat.id] || <Briefcase className="w-8 h-8" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-100">{cat.categoryNameHe}</div>
                          <div className="text-[11px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{cat.description}</div>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-1 text-xs text-white font-bold">
                            <Check className="w-3.5 h-3.5" /> נבחר
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══ STEP 2: Software Selection (Optional) ══ */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center space-y-1 mb-2">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-100">אילו תוכנות ספציפיות תריץ?</h3>
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-xs text-amber-300 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> שלב אופציונלי — ניתן לדלג
                  </div>
                  <p className="text-xs text-gray-400">בחר תוכנות ספציפיות להידוק הדרישות מעבר לפרופיל הבסיסי</p>
                </div>

                {/* Selected Apps Bar */}
                {selectedApps.length > 0 && (
                  <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-3 flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-purple-300 font-bold ml-2">בחרת:</span>
                    {selectedApps.map(app => (
                      <div key={app.id} className="bg-purple-900/40 border border-purple-500/40 rounded-xl px-2.5 py-1 text-xs text-purple-200 flex items-center gap-1.5 shadow-sm">
                        <span>{app.appNameHe || app.appNameEn}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedApps(selectedApps.filter(a => a.id !== app.id))}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="חפש תוכנה ספציפית (AutoCAD, Fortnite, Photoshop)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#111522] border-gray-800 rounded-2xl pr-4 pl-10 h-12 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
                  </div>
                </div>

                {/* Software Grid */}
                <div className="max-h-[200px] overflow-y-auto pr-1">
                  {searchQuery.trim() ? (
                    <div>
                      <h4 className="text-xs text-gray-500 mb-2">תוצאות חיפוש:</h4>
                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {searchResults.map(app => {
                            const isSelected = selectedApps.some(a => a.id === app.id);
                            return (
                              <button
                                key={app.id}
                                onClick={() => {
                                  if (isSelected) setSelectedApps(selectedApps.filter(a => a.id !== app.id));
                                  else setSelectedApps([...selectedApps, app]);
                                }}
                                className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                                  isSelected
                                    ? "bg-purple-950/20 border-purple-500 text-purple-200"
                                    : "bg-[#111522] border-gray-800 hover:border-gray-700 text-gray-300"
                                }`}
                              >
                                <div className={`p-1.5 rounded-lg ${isSelected ? "bg-purple-600/20" : "bg-gray-900"}`}>
                                  {getAppIcon(app.categoryId)}
                                </div>
                                <span className="text-xs font-bold truncate flex-1">{app.appNameHe || app.appNameEn}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 bg-purple-950/5 border border-purple-500/10 rounded-2xl gap-3 text-center">
                          <span className="text-xs text-gray-400">התוכנה &quot;{searchQuery}&quot; לא נמצאה במאגר שלנו.</span>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleRequestSoftware(searchQuery)}
                            disabled={requestingApp || requestSent}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl"
                          >
                            {requestingApp ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1.5" /> : null}
                            {requestSent ? "הבקשה נשלחה! 👍" : `בקש להוסיף את "${searchQuery}"`}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xs text-gray-500 mb-2">
                        תוכנות פופולריות {selectedCategory ? `ל${selectedCategory.categoryNameHe}` : ""}:
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {filteredPopular.map(app => {
                          const isSelected = selectedApps.some(a => a.id === app.id);
                          return (
                            <button
                              key={app.id}
                              onClick={() => {
                                if (isSelected) setSelectedApps(selectedApps.filter(a => a.id !== app.id));
                                else setSelectedApps([...selectedApps, app]);
                              }}
                              className={`p-2.5 rounded-xl border text-right transition-all flex items-center gap-2 ${
                                isSelected
                                  ? "bg-purple-950/20 border-purple-500 text-purple-200"
                                  : "bg-[#111522] border-gray-800 hover:border-gray-700 text-gray-300"
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg ${isSelected ? "bg-purple-600/20" : "bg-gray-900"}`}>
                                {getAppIcon(app.categoryId)}
                              </div>
                              <span className="text-xs font-bold truncate flex-1">{app.appNameHe || app.appNameEn}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Request App Section */}
                <div className="mt-4 pt-3 border-t border-gray-800 text-xs">
                  {!showRequestInput ? (
                    <div className="flex items-center justify-between text-gray-500">
                      <span>לא מצאת את התוכנה שלך ברשימה?</span>
                      {requestSent ? (
                        <span className="text-emerald-400 font-semibold">בקשתך נרשמה במערכת! 👍</span>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setShowRequestInput(true)}
                          className="text-purple-400 hover:text-purple-300 font-semibold underline"
                        >
                          בקש להוסיף תוכנה חדשה
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-200">
                      <Input
                        placeholder="הזן שם תוכנה (למשל: Revit, CorelDraw)..."
                        value={customAppName}
                        onChange={(e) => setCustomAppName(e.target.value)}
                        className="h-9 text-xs bg-gray-950 border-gray-800 rounded-xl"
                      />
                      <Button
                        size="sm"
                        type="button"
                        onClick={() => {
                          handleRequestSoftware(customAppName);
                          setCustomAppName("");
                          setShowRequestInput(false);
                        }}
                        disabled={!customAppName.trim() || requestingApp}
                        className="h-9 bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 rounded-xl"
                      >
                        {requestingApp ? <Loader2 className="w-3 h-3 animate-spin" /> : "שלח בקשה"}
                      </Button>
                      <Button
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowRequestInput(false);
                          setCustomAppName("");
                        }}
                        className="h-9 text-gray-400 hover:text-white"
                      >
                        ביטול
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══ STEP 3: Form Factor ══ */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-100">האם אתה מעדיף מחשב נייד או נייח?</h3>
                  <p className="text-xs sm:text-sm text-gray-400">התאם את צורת המחשב לצורך בניידות</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => setPreferredFormFactor("laptop")}
                    className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${
                      preferredFormFactor === "laptop"
                        ? "bg-purple-950/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                        : "bg-[#111522] border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className={`p-4 rounded-2xl ${preferredFormFactor === "laptop" ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-400"}`}>
                      <Laptop className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base text-gray-100">מחשב נייד (Laptop)</div>
                      <div className="text-xs text-gray-400 mt-1 leading-relaxed">קל משקל, נייד, סוללה מובנית</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPreferredFormFactor("desktop")}
                    className={`p-6 rounded-2xl border flex flex-col items-center gap-4 transition-all ${
                      preferredFormFactor === "desktop"
                        ? "bg-purple-950/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                        : "bg-[#111522] border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <div className={`p-4 rounded-2xl ${preferredFormFactor === "desktop" ? "bg-purple-600 text-white" : "bg-gray-900 text-gray-400"}`}>
                      <Monitor className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-base text-gray-100">מחשב נייח (Desktop)</div>
                      <div className="text-xs text-gray-400 mt-1 leading-relaxed">עוצמתי, ניתן לשדרוג, ללא הגבלת סוללה</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ══ STEP 4: Budget ══ */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-100">מהי מסגרת התקציב שלך?</h3>
                  <p className="text-xs sm:text-sm text-gray-400">הזן את הסכום המקסימלי שברצונך להשקיע</p>
                </div>
                <div className="max-w-xs mx-auto space-y-4">
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="הזן מחיר מקסימלי (ש״ח)..."
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-gray-900/80 border-gray-700 rounded-2xl text-center text-lg h-14 pl-10 pr-4 focus:ring-purple-500"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">₪</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["2000", "4000", "6000", "8000", "12000"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudget(preset)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          budget === preset
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                        }`}
                      >
                        עד {parseFloat(preset).toLocaleString()} ₪
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-600">לא בטוח? ניתן לדלג ולראות את כל התוצאות</p>
                </div>
              </div>
            )}

            {/* ══ STEP 5: Summary ══ */}
            {step === 5 && computedSpecs && selectedCategory && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center space-y-2 mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-100 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                    סיכום הדרישות והמלצת החומרה
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400">הנה הדרישות שהגדרת והמפרט המומלץ עבורן</p>
                </div>

                <div className="bg-[#121626] border border-purple-500/20 p-5 rounded-2xl space-y-5">
                  {/* User Choices */}
                  <div className="space-y-2 pb-4 border-b border-gray-800">
                    <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider block">הדרישות שבחרת:</span>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                        <span className="text-gray-400 font-normal">פרופיל:</span>
                        {selectedCategory.categoryNameHe}
                      </div>
                      {selectedApps.length > 0 && (
                        <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-semibold flex items-center gap-1.5 flex-wrap">
                          <span className="text-gray-400 font-normal">תוכנות:</span>
                          {selectedApps.map(a => a.appNameHe || a.appNameEn).join(", ")}
                        </div>
                      )}
                      <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                        <span className="text-gray-400 font-normal">סוג מחשב:</span>
                        {preferredFormFactor === "laptop" ? "מחשב נייד 💻" : "מחשב נייח 🖥️"}
                      </div>
                      <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-semibold flex items-center gap-1.5">
                        <span className="text-gray-400 font-normal">תקציב:</span>
                        {budget ? `עד ₪${parseFloat(budget).toLocaleString()}` : "ללא הגבלה"}
                      </div>
                    </div>
                  </div>

                  {/* Hardware Recommendations */}
                  <div className="space-y-3">
                    <span className="text-[11px] text-purple-400 font-bold uppercase tracking-wider block">המפרט המינימלי המומלץ:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] text-gray-500 block">מעבד מינימלי</span>
                        <span className="text-sm font-bold text-gray-200">{computedSpecs.minCpuTier} ומעלה</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-gray-500 block">זיכרון עבודה</span>
                        <span className="text-sm font-bold text-gray-200">{computedSpecs.minRamGb}GB RAM ומעלה</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-gray-500 block">נפח אחסון</span>
                        <span className="text-sm font-bold text-gray-200">
                          {computedSpecs.minStorageGb >= 1024 
                            ? `${computedSpecs.minStorageGb / 1024}TB` 
                            : `${computedSpecs.minStorageGb}GB`}{" "}
                          {computedSpecs.storageType}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[11px] text-gray-500 block">כרטיס מסך מומלץ</span>
                        <span className="text-sm font-bold text-gray-200">{computedSpecs.recommendedGpu || "מובנה (Integrated)"}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── "What data sellers need to have entered" notice ── */}
                  <div className="pt-3 border-t border-gray-800">
                    <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
                      <span className="text-amber-400 text-base shrink-0 mt-0.5">⚠️</span>
                      <div>
                        <span className="text-[11px] font-bold text-amber-300 block mb-1.5">כדי שהחיפוש יעבוד — המוכר חייב למלא:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            שדה <span className="font-bold text-white">מעבד (cpu)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            שדה <span className="font-bold text-white">זיכרון RAM (ram)</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            שדה <span className="font-bold text-white">אחסון (storage)</span>
                          </div>
                          {computedSpecs.recommendedGpu && computedSpecs.recommendedGpu !== "Integrated" && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              שדה <span className="font-bold text-white">כרטיס מסך (gpu)</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                          מודעות ללא שדות אלו לא יופיעו בחיפוש המסונן שלך.
                        </p>
                      </div>
                    </div>
                  </div>

                  {computedSpecs.manufacturerRecommendation && (
                    <div className="pt-3 border-t border-gray-800 text-xs text-gray-400 leading-relaxed">
                      <span className="font-bold text-gray-300 block mb-1">יצרנים מומלצים:</span>
                      {computedSpecs.manufacturerRecommendation}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>


          {/* ── Sticky footer: navigation buttons always visible ── */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 pt-4 pb-8 md:pb-4 border-t border-gray-800 bg-[#0b0f19]/95">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="bg-transparent border-gray-700 hover:bg-gray-900 text-gray-300 rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" /> חזור
                </Button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <div className="flex items-center gap-2">
                  {step === 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleNext}
                      className="text-gray-400 hover:text-gray-300 rounded-xl px-4 py-2 text-sm"
                    >
                      דלג →
                    </Button>
                  )}
                  {step === 4 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleNext}
                      className="text-gray-400 hover:text-gray-300 rounded-xl px-4 py-2 text-sm"
                    >
                      דלג (ללא תקציב) →
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      (step === 1 && !selectedCategory) ||
                      (step === 3 && !preferredFormFactor)
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-5 py-2 flex items-center gap-2"
                  >
                    המשך <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={savingLog}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl px-6 py-2.5 flex items-center gap-2 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
                >
                  {savingLog ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> שומר...</>
                  ) : (
                    <><Check className="w-4 h-4" /> חל על תוצאות החיפוש</>
                  )}
                </Button>
              )}
          </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
