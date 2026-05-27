"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw, Layers, CheckSquare, Settings, Share2, Download, Upload, Info, AlertTriangle, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ComputerCategory {
  id: number;
  categoryNameHe: string;
  categoryNameEn: string;
  minRamGb: number;
  recommendedGpu: string | null;
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

export default function AdminSoftwarePage() {
  const [software, setSoftware] = useState<SoftwareApplication[]>([]);
  const [categories, setCategories] = useState<ComputerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // AI Import/Export states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importing, setImporting] = useState(false);
  const [isImportingRequests, setIsImportingRequests] = useState(false);
  const [proposedChanges, setProposedChanges] = useState<{
    id: number;
    appNameEn: string;
    oldRam: number | null;
    newRam: number;
    oldVram: number | null;
    newVram: number;
  }[]>([]);
  const [proposedNewApps, setProposedNewApps] = useState<{
    nameEn: string;
    nameHe: string | null;
    categoryNameHe: string;
    minRamGb: number;
    minVramGb: number;
  }[]>([]);
  const [showChangeReport, setShowChangeReport] = useState(false);
  const [showHelpBox, setShowHelpBox] = useState(true);

  // User requests state
  const [requests, setRequests] = useState<{ id: number; appName: string; createdAt: string }[]>([]);

  // Form states
  const [appNameEn, setAppNameEn] = useState("");
  const [appNameHe, setAppNameHe] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [minRamGbOverride, setMinRamGbOverride] = useState("");
  const [minVramGbOverride, setMinVramGbOverride] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [iconUrl, setIconUrl] = useState("");

  const fetchSoftware = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/software");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSoftware(data.software || []);
          setCategories(data.categories || []);
          setRequests(data.requests || []);
        }
      } else {
        toast.error("שגיאה בטעינת נתונים - ודא שאתה מחובר כחשבון מנהל");
      }
    } catch (e) {
      toast.error("שגיאה בתקשורת עם השרת");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftware();
  }, []);

  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק בקשה זו?")) return;
    try {
      const res = await fetch(`/api/admin/software?requestId=${requestId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success("הבקשה נמחקה בהצלחה");
        fetchSoftware();
      } else {
        toast.error("שגיאה במחיקת הבקשה");
      }
    } catch (e) {
      toast.error("שגיאה בתקשורת עם השרת");
    }
  };

  const handleAddFromRequest = (reqName: string) => {
    resetForm();
    const isHebrew = /[\u0590-\u05FF]/.test(reqName);
    if (isHebrew) {
      setAppNameHe(reqName);
    } else {
      setAppNameEn(reqName);
    }
    setIsOpen(true);
  };

  const resetForm = () => {
    setAppNameEn("");
    setAppNameHe("");
    setCategoryId("");
    setMinRamGbOverride("");
    setMinVramGbOverride("");
    setIsPopular(false);
    setIconUrl("");
    setSelectedId(null);
    setIsEditing(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleOpenEdit = (app: SoftwareApplication) => {
    resetForm();
    setSelectedId(app.id);
    setAppNameEn(app.appNameEn);
    setAppNameHe(app.appNameHe || "");
    setCategoryId(app.categoryId ? String(app.categoryId) : "");
    setMinRamGbOverride(app.minRamGbOverride ? String(app.minRamGbOverride) : "");
    setMinVramGbOverride(app.minVramGbOverride ? String(app.minVramGbOverride) : "");
    setIsPopular(app.isPopular);
    setIconUrl(app.iconUrl || "");
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNameEn.trim()) {
      toast.error("שם באנגלית הוא שדה חובה");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: selectedId,
        appNameEn,
        appNameHe: appNameHe || null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        minRamGbOverride: minRamGbOverride ? parseInt(minRamGbOverride, 10) : null,
        minVramGbOverride: minVramGbOverride ? parseInt(minVramGbOverride, 10) : null,
        isPopular,
        iconUrl: iconUrl || null
      };

      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/software", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast.success(isEditing ? "האפליקציה עודכנה בהצלחה" : "האפליקציה התווספה בהצלחה");
          fetchSoftware();
          setIsOpen(false);
          resetForm();
        } else {
          toast.error("הפעולה נכשלה");
        }
      } else {
        toast.error("שגיאה בשמירת נתונים");
      }
    } catch (e) {
      toast.error("שגיאה בתקשורת עם השרת");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק תוכנה זו?")) return;

    try {
      const res = await fetch(`/api/admin/software?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        toast.success("האפליקציה נמחקה בהצלחה");
        fetchSoftware();
      } else {
        toast.error("שגיאה במחיקת האפליקציה");
      }
    } catch (e) {
      toast.error("שגיאה בתקשורת עם השרת");
    }
  };
 
  const handleExportPrompt = () => {
    if (software.length === 0) {
      toast.error("אין אפליקציות לייצוא");
      return;
    }
    
    const formattedList = software.map(app => ({
      nameEn: app.appNameEn,
      nameHe: app.appNameHe || undefined,
      currentMinRamGb: app.minRamGbOverride || (app.category ? app.category.minRamGb : 16),
      currentMinVramGb: app.minVramGbOverride || (app.category ? (app.category.recommendedGpu && !["integrated", "מובנה"].includes(app.category.recommendedGpu.toLowerCase()) ? 6 : 0) : 0),
    }));

    const promptText = `היי, להלן רשימה של תוכנות ומשחקים יחד עם דרישות המינימום הנוכחיות שלהם לזיכרון RAM ו-VRAM (זיכרון כרטיס מסך).

אנא בצע עדכון דרישות מערכת לפי ההנחיות הבאות:
1. בדוק האם היו שינויים או עדכונים רשמיים בדרישות המערכת של התוכנות/משחקים הללו לשנת 2026.
2. חוק בטיחות קריטי (חשוב ביותר): אם מצאת דרישת חומרה חדשה שהיא מקלה או נמוכה יותר מהדרישה הנוכחית שלי (למשל, הדרישה הנוכחית ברשימה היא 16GB RAM ומצאת מקור שאומר שמספיק 8GB RAM), אל תפחית אותה! תמיד תשאיר את הדרישה המחמירה/הגבוהה יותר. עדיף להיות בצד הבטוח עבור המשתמשים שלנו.
3. החזר לי אך ורק רשימת JSON מעודכנת באותו מבנה בדיוק, המכילה רק את האפליקציות שדרישותיהן באמת השתנו (כלומר, RAM או VRAM שונה מהערך הנוכחי).
4. אל תוסיף הסברים או טקסט נוסף לפני או אחרי ה-JSON. רק מערך JSON תקין ומלא שניתן להעתיק בקלות.

רשימת התוכנות הנוכחית:
${JSON.stringify(formattedList, null, 2)}`;

    navigator.clipboard.writeText(promptText);
    toast.success("📋 הפרומפט המוכן הועתק ללוח! הוא כולל את רשימת התוכנות והנחיות ה-AI המלאות. תוכל להדביק אותו ישירות בצ'אט (ChatGPT/Gemini).");
  };

  const handleExportRequestsPrompt = () => {
    if (requests.length === 0) {
      toast.error("אין בקשות לייצוא");
      return;
    }

    const promptText = `היי, להלן רשימה של שמות תוכנות ומשחקים שמשתמשים ביקשו להוסיף למערכת שלנו אך אין לנו עדיין את דרישות המערכת שלהם.
אנא חפש את דרישות המערכת הרשמיות והעדכניות שלהם לשנת 2026 (RAM ו-VRAM) והתאם להם את קטגוריית השימוש המתאימה ביותר מתוך הרשימה הבאה:
- "משרד ולימודים"
- "גיימינג"
- "עריכה גרפית וסאונד"
- "פיתוח תוכנה וסייבר"
- "עריכה תלת מימדית ותוכנות הנדסיות"

אנא החזר לי רשימת JSON במבנה הבא בלבד (ללא הסברים נוספים לפני או אחרי ה-JSON):
[
  {
    "nameEn": "שם התוכנה באנגלית (תקני)",
    "nameHe": "שם התוכנה בעברית (או null)",
    "categoryNameHe": "שם הקטגוריה המדויק מתוך הרשימה למעלה",
    "minRamGb": 16,
    "minVramGb": 6
  }
]

רשימת השמות המבוקשים:
${requests.map(r => r.appName).join(", ")}`;

    navigator.clipboard.writeText(promptText);
    toast.success("📋 פרומפט בקשות המשתמשים הועתק ללוח! הדבק אותו ישירות בצ'אט (ChatGPT/Gemini).");
  };

  const handleExportCSV = () => {
    if (software.length === 0) {
      toast.error("אין אפליקציות לייצוא");
      return;
    }

    const headers = ["ID", "Name (EN)", "Name (HE)", "Category", "Min RAM Override", "Min VRAM Override", "Is Popular", "Icon URL"];
    const rows = software.map(app => [
      app.id,
      `"${app.appNameEn.replace(/"/g, '""')}"`,
      app.appNameHe ? `"${app.appNameHe.replace(/"/g, '""')}"` : "",
      app.category ? `"${app.category.categoryNameHe.replace(/"/g, '""')}"` : "",
      app.minRamGbOverride || "",
      app.minVramGbOverride || "",
      app.isPopular ? "TRUE" : "FALSE",
      app.iconUrl ? `"${app.iconUrl}"` : ""
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `qlikndeal_software_applications_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("📊 קובץ CSV הורד בהצלחה!");
  };

  const handleAnalyzeImport = () => {
    if (!importJson.trim()) {
      toast.error("אנא הדבק את תוצאת ה-JSON מהצ'אט");
      return;
    }

    try {
      let cleanJson = importJson.trim();
      if (cleanJson.includes("```")) {
        const match = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
        if (match && match[1]) {
          cleanJson = match[1].trim();
        }
      }

      const list = JSON.parse(cleanJson);
      if (!Array.isArray(list)) {
        toast.error("הקלט חייב להיות מערך (Array) של אובייקטים בפורמט JSON");
        return;
      }

      if (isImportingRequests) {
        const newAppsList: typeof proposedNewApps = [];
        for (const item of list) {
          const nameEn = item.nameEn || item.appNameEn;
          if (!nameEn) continue;

          newAppsList.push({
            nameEn,
            nameHe: item.nameHe || item.appNameHe || null,
            categoryNameHe: item.categoryNameHe || "משרד ולימודים",
            minRamGb: item.minRamGb || item.currentMinRamGb || 8,
            minVramGb: item.minVramGb || item.currentMinVramGb || 0
          });
        }

        if (newAppsList.length === 0) {
          toast.info("לא נמצאו אפליקציות חוקיות לפענוח ב-JSON.");
          return;
        }

        setProposedNewApps(newAppsList);
        setShowChangeReport(true);
      } else {
        const changesList: typeof proposedChanges = [];
        for (const item of list) {
          const name = item.nameEn || item.appNameEn;
          if (!name) continue;

          const existing = software.find(s => s.appNameEn.toLowerCase().trim() === name.toLowerCase().trim());
          if (existing) {
            const currentRam = existing.minRamGbOverride || (existing.category ? existing.category.minRamGb : 16);
            const currentVram = existing.minVramGbOverride || (existing.category ? (existing.category.recommendedGpu && !["integrated", "מובנה"].includes(existing.category.recommendedGpu.toLowerCase()) ? 6 : 0) : 0);

            const newRam = item.currentMinRamGb || item.minRamGb || item.minRamGbOverride || currentRam;
            const newVram = item.currentMinVramGb || item.minVram || item.minVramGb || item.minVramGbOverride || currentVram;

            if (newRam !== currentRam || newVram !== currentVram) {
              changesList.push({
                id: existing.id,
                appNameEn: existing.appNameEn,
                oldRam: existing.minRamGbOverride,
                newRam: newRam,
                oldVram: existing.minVramGbOverride,
                newVram: newVram
              });
            }
          }
        }

        if (changesList.length === 0) {
          toast.info("לא נמצאו שינויים בדרישות בהשוואה למצב הקיים במערכת (או שהתוכנות לא נמצאו במאגר).");
          return;
        }

        setProposedChanges(changesList);
        setShowChangeReport(true);
      }
    } catch (e) {
      toast.error("שגיאה בפענוח ה-JSON. ודא שהעתקת את כל הטקסט בצורה תקינה מהצ'אט.");
    }
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      if (isImportingRequests) {
        const payload = {
          bulkCreate: proposedNewApps
        };

        const res = await fetch("/api/admin/software", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            toast.success(`סיימנו! נוצרו בהצלחה ${proposedNewApps.length} אפליקציות חדשות ובקשות המשתמשים נמחקו.`);
            fetchSoftware();
            setIsImportOpen(false);
            setImportJson("");
            setProposedNewApps([]);
            setShowChangeReport(false);
            setIsImportingRequests(false);
          } else {
            toast.error("היצירה נכשלה בשרת");
          }
        } else {
          toast.error("שגיאה בתקשורת עם השרת");
        }
      } else {
        const payload = {
          bulkUpdates: proposedChanges.map(change => ({
            id: change.id,
            minRamGbOverride: change.newRam,
            minVramGbOverride: change.newVram
          }))
        };

        const res = await fetch("/api/admin/software", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            toast.success(`סיימנו! עודכנו בהצלחה ${proposedChanges.length} אפליקציות.`);
            fetchSoftware();
            setIsImportOpen(false);
            setImportJson("");
            setProposedChanges([]);
            setShowChangeReport(false);
          } else {
            toast.error("העדכון נכשל בשרת");
          }
        } else {
          toast.error("שגיאה בתקשורת עם השרת");
        }
      }
    } catch (e) {
      toast.error("שגיאה במהלך שמירת העדכונים");
    } finally {
      setImporting(false);
    }
  };

  const filteredSoftware = software.filter(app => {
    const query = searchQuery.toLowerCase();
    return (
      app.appNameEn.toLowerCase().includes(query) ||
      (app.appNameHe && app.appNameHe.toLowerCase().includes(query)) ||
      (app.category && app.category.categoryNameHe.toLowerCase().includes(query))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-200 flex items-center gap-2">
            ניהול תוכנות ומשחקים (יועץ חכם)
            {!showHelpBox && (
              <button 
                onClick={() => setShowHelpBox(true)}
                className="text-xs font-normal text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full transition-all"
              >
                הצג מדריך AI 💡
              </button>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            ניהול דרישות החומרה הספציפיות לתוכנות ומשחקים במרקטפלייס
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleExportPrompt} 
            variant="outline" 
            className="border-gray-800 bg-[#0d1117]/50 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            title="העתק רשימת תוכנות כפרומפט מוכן לעדכון דרישות על ידי AI"
          >
            <Share2 className="w-4 h-4 ml-2" />
            ייצא פרומפט ל-AI
          </Button>

          <Button 
            onClick={handleExportCSV} 
            variant="outline" 
            className="border-gray-800 bg-[#0d1117]/50 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            title="ייצא רשימת תוכנות לקובץ CSV"
          >
            <Download className="w-4 h-4 ml-2" />
            ייצא CSV
          </Button>

          <Button 
            onClick={() => setIsImportOpen(true)} 
            variant="outline" 
            className="border-gray-800 bg-[#0d1117]/50 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            title="ייבא דרישות מעודכנות שחולצו על ידי AI"
          >
            <Upload className="w-4 h-4 ml-2" />
            ייבוא עדכונים מ-AI
          </Button>

          <Button 
            onClick={fetchSoftware} 
            variant="outline" 
            className="border-gray-800 bg-[#0d1117]/50 text-gray-300 hover:text-white"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            רענן
          </Button>

          <Button 
            onClick={handleOpenAdd} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
          >
            <Plus className="w-4 h-4 ml-2" />
            הוספת אפליקציה
          </Button>
        </div>
      </div>

      {/* Help Guide Box */}
      {showHelpBox && (
        <div className="mb-6 bg-gradient-to-br from-indigo-950/20 to-purple-950/15 border border-indigo-500/20 p-5 rounded-3xl relative backdrop-blur-sm">
          <button 
            onClick={() => setShowHelpBox(false)}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-300 text-xs transition-colors"
          >
            סגור מדריך ✕
          </button>
          
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-indigo-200">מדריך מהיר: עדכון דרישות מערכת באמצעות בינה מלאכותית (AI)</h3>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                תהליך עדכון דרישות ה-RAM וה-VRAM של האפליקציות שלך לוקח פחות מדקה ומבוצע ב-3 שלבים פשוטים:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-950/40 p-3 rounded-2xl border border-gray-850">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold mb-2">1</span>
                  <h4 className="font-bold text-xs text-cyan-300">ייצוא הפרומפט</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    לחץ על <strong>"ייצא פרומפט ל-AI"</strong> למעלה. המערכת תעתיק אוטומטית ללוח שלך את רשימת התוכנות והוראות התשאול המלאות.
                  </p>
                </div>
                
                <div className="bg-gray-950/40 p-3 rounded-2xl border border-gray-850">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-2">2</span>
                  <h4 className="font-bold text-xs text-emerald-300">תשאול הצ\'אטבוט</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    פתח את ChatGPT או Gemini, בצע הדבקה (Paste) ושלח. ה-AI יסרוק, יאמת דרישות חומרה, ויחזיר קוד JSON מעודכן.
                  </p>
                </div>
                
                <div className="bg-gray-950/40 p-3 rounded-2xl border border-gray-850">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold mb-2">3</span>
                  <h4 className="font-bold text-xs text-purple-300">ייבוא וצפייה בשינויים</h4>
                  <p className="text-[11px] text-gray-400 mt-1">
                    לחץ על <strong>"ייבוא עדכונים מ-AI"</strong>, הדבק את התוצאה, וצפה בדוח ההשוואה המציג בדיוק מה ישתנה לפני שמירת הנתונים.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending User Requests Widget */}
      <div className="mb-8 bg-purple-950/15 border border-purple-500/20 p-5 rounded-3xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-purple-500/10 pb-3">
          <div className="flex items-center gap-2">
            <span className={`flex h-2.5 w-2.5 rounded-full ${requests.length > 0 ? "bg-purple-400 animate-pulse" : "bg-gray-600"}`} />
            <h3 className="font-bold text-sm text-purple-200">בקשות משתמשים להוספת תוכנות חדשות</h3>
            <span className="text-xs text-gray-500 font-normal">({requests.length} בקשות ממתינות)</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleExportRequestsPrompt}
              disabled={requests.length === 0}
              size="sm"
              variant="outline"
              className="border-purple-500/20 bg-[#0d1117]/50 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5 ml-1.5" />
              ייצא פרומפט AI לבקשות
            </Button>
            <Button
              onClick={() => {
                setIsImportingRequests(true);
                setIsImportOpen(true);
              }}
              size="sm"
              variant="outline"
              className="border-purple-500/20 bg-[#0d1117]/50 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs font-bold"
            >
              <Upload className="w-3.5 h-3.5 ml-1.5" />
              ייבוא והוספה מ-AI
            </Button>
          </div>
        </div>
        
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
            {requests.map((req) => (
              <div 
                key={req.id} 
                className="bg-gray-950/40 border border-gray-850 p-3 rounded-2xl flex items-center justify-between gap-2 hover:border-purple-500/20 transition-all animate-in fade-in duration-200"
              >
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white block truncate" title={req.appName}>
                    {req.appName}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(req.createdAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleAddFromRequest(req.appName)}
                    className="h-7 px-2.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg"
                  >
                    הוסף
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDeleteRequest(req.id)}
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-xs leading-relaxed">
            אין בקשות חדשות ממתינות ממשתמשים כרגע. 
            <span className="block text-[10px] text-purple-400/60 mt-0.5">ברגע שמשתמש יחפש תוכנה שלא קיימת וישלח בקשה, היא תופיע כאן מיידית.</span>
          </div>
        )}
      </div>

      {/* Search Bar & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3 relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <Input
            placeholder="חפש תוכנה לפי שם באנגלית, עברית או קטגוריה..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 bg-gray-900/40 border-gray-800 focus:ring-purple-500 focus:border-purple-500 rounded-2xl"
          />
        </div>

        <div className="bg-[#121626] border border-purple-500/10 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">סה&quot;כ תוכנות</span>
            <span className="text-2xl font-black text-purple-400">{software.length}</span>
          </div>
          <Layers className="w-8 h-8 text-purple-500/20" />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-gray-900/30 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            <p className="text-gray-400 text-sm animate-pulse">טוען אפליקציות...</p>
          </div>
        ) : filteredSoftware.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-950/40 border-b border-gray-800 text-gray-400 text-xs font-bold uppercase tracking-wider">
                  <th className="p-4">שם תוכנה (אנגלית)</th>
                  <th className="p-4">שם תוכנה (עברית)</th>
                  <th className="p-4">פרופיל שימוש</th>
                  <th className="p-4 text-center">RAM דרוש</th>
                  <th className="p-4 text-center">VRAM דרוש</th>
                  <th className="p-4 text-center">פופולרי?</th>
                  <th className="p-4 text-left">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 text-sm">
                {filteredSoftware.map((app) => (
                  <tr key={app.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{app.appNameEn}</td>
                    <td className="p-4 text-gray-300">{app.appNameHe || "—"}</td>
                    <td className="p-4">
                      {app.category ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-950/20 border border-purple-500/20 text-purple-300">
                          {app.category.categoryNameHe}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center font-semibold text-gray-200">
                      {app.minRamGbOverride ? `${app.minRamGbOverride}GB` : "ללא שינוי (ברירת מחדל)"}
                    </td>
                    <td className="p-4 text-center font-semibold text-gray-200">
                      {app.minVramGbOverride ? `${app.minVramGbOverride}GB` : "ללא שינוי (ברירת מחדל)"}
                    </td>
                    <td className="p-4 text-center">
                      {app.isPopular ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-950/30 text-green-400 border border-green-500/20">
                          כן ✨
                        </span>
                      ) : (
                        <span className="text-gray-500">לא</span>
                      )}
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          onClick={() => handleOpenEdit(app)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          onClick={() => handleDelete(app.id)} 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            לא נמצאו תוכנות מתאימות לחיפוש שלך.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md p-6 rounded-3xl" dir="rtl">
          <DialogHeader className="text-right mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              {isEditing ? "עריכת תוכנה" : "הוספת תוכנה חדשה"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-semibold">שם תוכנה באנגלית (שדה חובה):</label>
              <Input
                value={appNameEn}
                onChange={(e) => setAppNameEn(e.target.value)}
                placeholder="לדוגמה: SolidWorks"
                className="bg-gray-950 border-gray-800 rounded-xl"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-semibold">שם תוכנה בעברית (אופציונלי):</label>
              <Input
                value={appNameHe}
                onChange={(e) => setAppNameHe(e.target.value)}
                placeholder="לדוגמה: סולידוורקס"
                className="bg-gray-950 border-gray-800 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-semibold">פרופיל שימוש בסיסי (קטגוריה):</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
              >
                <option value="">בחר פרופיל...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryNameHe}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-semibold">RAM מוגדר (GB) - אופציונלי:</label>
                <Input
                  type="number"
                  value={minRamGbOverride}
                  onChange={(e) => setMinRamGbOverride(e.target.value)}
                  placeholder="לדוגמה: 32"
                  className="bg-gray-950 border-gray-800 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400 block font-semibold">VRAM מוגדר (GB) - אופציונלי:</label>
                <Input
                  type="number"
                  value={minVramGbOverride}
                  onChange={(e) => setMinVramGbOverride(e.target.value)}
                  placeholder="לדוגמה: 8"
                  className="bg-gray-950 border-gray-800 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400 block font-semibold">כתובת אייקון/תמונה (אופציונלי):</label>
              <Input
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://..."
                className="bg-gray-950 border-gray-800 rounded-xl text-left"
                dir="ltr"
              />
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="w-4 h-4 bg-gray-950 border-gray-800 rounded focus:ring-purple-500 text-purple-600"
              />
              <label htmlFor="isPopular" className="text-sm text-gray-300 select-none cursor-pointer">
                הצג כאפליקציה פופולרית ברשימת הבחירה המהירה
              </label>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-850">
              <Button
                type="button"
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="border-gray-850 bg-transparent text-gray-400 hover:text-white"
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "שמור"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
 
      {/* Import Updates Modal */}
      <Dialog open={isImportOpen} onOpenChange={(open) => {
        setIsImportOpen(open);
        if (!open) {
          setShowChangeReport(false);
          setProposedChanges([]);
          setProposedNewApps([]);
          setIsImportingRequests(false);
        }
      }}>
        <DialogContent className={`bg-gray-900 border-gray-800 text-white p-6 rounded-3xl transition-all duration-300 ${showChangeReport ? "max-w-2xl" : "max-w-md"}`} dir="rtl">
          <DialogHeader className="text-right mb-4">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              {isImportingRequests ? "ייבוא ויצירת אפליקציות מבוקשות מ-AI" : "ייבוא עדכוני דרישות מ-AI"}
            </DialogTitle>
          </DialogHeader>
 
          {!showChangeReport ? (
            <div className="space-y-4">
              <div className="bg-[#121626] border border-purple-500/10 rounded-2xl p-4 text-xs text-purple-300 leading-relaxed space-y-2">
                <span className="font-bold block text-sm text-purple-400">💡 איך לעדכן בקלות:</span>
                {isImportingRequests ? (
                  <>
                    <p>1. לחץ על הכפתור <strong>"ייצא פרומפט AI לבקשות"</strong> בתיבת הבקשות (הוא מעתיק את הבקשות וההנחיות).</p>
                    <p>2. הדבק בצ\'אט של ChatGPT או Gemini ושלח.</p>
                    <p>3. העתק את תשובת ה-JSON שקיבלת מהצ\'אט והדבק אותה כאן למטה:</p>
                  </>
                ) : (
                  <>
                    <p>1. לחץ על הכפתור <strong>"ייצא פרומפט ל-AI"</strong> למעלה (הוא מעתיק את האפליקציות הקיימות וההנחיות).</p>
                    <p>2. הדבק בצ\'אט של ChatGPT או Gemini ושלח.</p>
                    <p>3. העתק את תשובת ה-JSON שקיבלת מהצ\'אט והדבק אותה כאן למטה:</p>
                  </>
                )}
              </div>

              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder={isImportingRequests ? `[
  {
    "nameEn": "Revit",
    "nameHe": "רוויט",
    "categoryNameHe": "עריכה תלת מימדית ותוכנות הנדסיות",
    "minRamGb": 32,
    "minVramGb": 8
  }
]` : `[
  {
    "nameEn": "Fortnite",
    "currentMinRamGb": 16,
    "currentMinVramGb": 6
  }
]`}
                className="w-full h-48 bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs font-mono text-gray-300 focus:outline-none focus:border-purple-500"
                dir="ltr"
                required
              />
 
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  onClick={() => setIsImportOpen(false)}
                  variant="outline"
                  className="border-gray-850 bg-transparent text-gray-400 hover:text-white"
                >
                  ביטול
                </Button>
                <Button
                  onClick={handleAnalyzeImport}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  שלב הבא: הצג דוח שינויים
                </Button>
              </div>
            </div>
          ) : isImportingRequests ? (
            <div className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-3 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                <div>
                  <span className="font-bold block mb-0.5">יצירת אפליקציות חדשות:</span>
                  המערכת זיהתה <strong>{proposedNewApps.length}</strong> אפליקציות חדשות ליצירה. אישור הפעולה ייצור אותן במאגר ויסגור את בקשות המשתמשים התואמות.
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-950/60 border-b border-gray-800 text-gray-400 font-bold">
                      <th className="p-3">שם תוכנה (אנגלית / עברית)</th>
                      <th className="p-3">פרופיל שימוש (קטגוריה)</th>
                      <th className="p-3 text-center">RAM דרוש</th>
                      <th className="p-3 text-center">VRAM דרוש</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 bg-gray-950/20">
                    {proposedNewApps.map((app, index) => (
                      <tr key={index} className="hover:bg-white/5">
                        <td className="p-3 font-semibold text-white">
                          {app.nameEn} {app.nameHe ? <span className="text-gray-400 font-normal">({app.nameHe})</span> : ""}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-950/40 text-purple-300 border border-purple-500/20">
                            {app.categoryNameHe}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-400">{app.minRamGb}GB</td>
                        <td className="p-3 text-center font-bold text-emerald-400">{app.minVramGb}GB</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 justify-between pt-4 border-t border-gray-800">
                <Button
                  onClick={() => setShowChangeReport(false)}
                  variant="outline"
                  className="border-gray-800 bg-transparent text-gray-300 hover:text-white"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  חזור לעריכה
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsImportOpen(false);
                      setShowChangeReport(false);
                      setProposedNewApps([]);
                      setIsImportingRequests(false);
                    }}
                    variant="outline"
                    className="border-gray-850 bg-transparent text-gray-400 hover:text-white"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={importing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {importing ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Check className="w-4 h-4 ml-2" />
                    )}
                    אשר וצור אפליקציות
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-3 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                <div>
                  <span className="font-bold block mb-0.5">דוח שינויים מוצעים:</span>
                  המערכת זיהתה <strong>{proposedChanges.length}</strong> תוכנות עם שינויים בדרישות החומרה. אנא ודא שהשינויים תקינים לפני האישור.
                </div>
              </div>

              <div className="border border-gray-800 rounded-xl overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-950/60 border-b border-gray-800 text-gray-400 font-bold">
                      <th className="p-3">שם תוכנה (אנגלית)</th>
                      <th className="p-3 text-center">RAM (GB)</th>
                      <th className="p-3 text-center">VRAM (GB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800 bg-gray-950/20">
                    {proposedChanges.map((change) => {
                      const isRamChanged = change.oldRam !== change.newRam;
                      const isVramChanged = change.oldVram !== change.newVram;
                      return (
                        <tr key={change.id} className="hover:bg-white/5">
                          <td className="p-3 font-semibold text-white">{change.appNameEn}</td>
                          <td className="p-3 text-center">
                            {isRamChanged ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="text-gray-400 line-through">{change.oldRam || "קטגוריה"}</span>
                                <span className="text-purple-400">←</span>
                                <span className="text-emerald-400 font-bold">{change.newRam}GB</span>
                              </span>
                            ) : (
                              <span className="text-gray-500">ללא שינוי ({change.newRam}GB)</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {isVramChanged ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="text-gray-400 line-through">{change.oldVram || "קטגוריה"}</span>
                                <span className="text-purple-400">←</span>
                                <span className="text-emerald-400 font-bold">{change.newVram}GB</span>
                              </span>
                            ) : (
                              <span className="text-gray-500">ללא שינוי ({change.newVram}GB)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-3 justify-between pt-4 border-t border-gray-800">
                <Button
                  onClick={() => setShowChangeReport(false)}
                  variant="outline"
                  className="border-gray-800 bg-transparent text-gray-300 hover:text-white"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  חזור לעריכה
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsImportOpen(false);
                      setShowChangeReport(false);
                      setProposedChanges([]);
                    }}
                    variant="outline"
                    className="border-gray-850 bg-transparent text-gray-400 hover:text-white"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={handleConfirmImport}
                    disabled={importing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {importing ? (
                      <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    ) : (
                      <Check className="w-4 h-4 ml-2" />
                    )}
                    אשר והחל שינויים
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
