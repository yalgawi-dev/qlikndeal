# 🧠 מדריך מוח ה-AI של Qlikndeal
## הסבר מלא למפתח חדש

---

## 🎯 מה המטרה בפשטות?

כשמוכר מדביק מודעה ("מחשב נייד Lenovo ThinkPad 32GB..."), ה-AI **ממלא את הטופס בעצמו** במקום שהמוכר יצטרך להקליד הכל ידנית.

> **משל לילד:** דמיין שיש לך עוזר חכם. בפעם הראשונה שהוא רואה מודעה, הוא מנחש. אם ניחש נכון ואתה לא מתקן - הוא לומד שהניחוש היה טוב. אם טעה ותיקנת - הוא לומד לא לטעות שוב. ככל שרואה יותר מודעות - הוא יותר מדויק.

---

## 🏗️ ארכיטקטורה - 3 שכבות

```
┌─────────────────────────────────────────────────────────┐
│  שכבה 1: קלט המשתמש                                    │
│  (המוכר מדביק טקסט מודעה)                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  שכבה 2: מוח ה-AI (Pipeline)                            │
│  analyze.ts → signal-engine.ts → expert-pipeline.ts     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│  שכבה 3: למידה מתמדת                                    │
│  learning.ts → [DB Tables] → שיפור לדור הבא            │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 קבצים מרכזיים - מי עושה מה?

| קובץ | תפקיד | מי קורא לו? |
|------|--------|-------------|
| `src/lib/analyze.ts` | **מנצח התזמורת** - מריץ את כל השלבים | API route |
| `src/lib/signal-engine.ts` | **גלאי מילות מפתח** - מזהה "32GB" → RAM | analyze.ts |
| `src/lib/expert-pipeline.ts` | **מיפוי שדות** - מוודא שהתוצאה מתאימה ל-DB | analyze route |
| `src/lib/learning.ts` | **מוח הלמידה** - שומר וגוזז ידע | parser-log, penalty |
| `src/lib/matcher-core.ts` | **זיהוי קטגוריה** - "זה מחשב? טלפון? רכב?" | analyze.ts |
| `src/app/api/marketplace/analyze/route.ts` | **שער ה-API** - מקבל טקסט, מחזיר JSON | Frontend |
| `src/app/api/parser-log/route.ts` | **יומן למידה** - שומר ולומד מתיקוני משתמש | Frontend |
| `src/app/api/parser-log/penalize/route.ts` | **ענישה** - כשמשתמש לוחץ X | Frontend |
| `src/components/marketplace/DynamicListingForm.tsx` | **הטופס** - מציג + מקבל AI data | משתמש |

---

## 🔄 זרימת נתונים שלב-שלב

### שלב 1: המשתמש מדביק מודעה
```
"Lenovo ThinkPad X1 Carbon Gen 13, 32GB RAM, 1TB SSD, Intel Core Ultra 7"
                         ↓
            POST /api/marketplace/analyze
```

### שלב 2: זיהוי קטגוריה (`matcher-core.ts`)
```
"ThinkPad" + "מחשב נייד" + "CPU" → LAPTOPS ✅
```

### שלב 3: ניתוח מרובה-מקורות (`analyze.ts`)
```
מקור 1: FieldSignal DB    "32gb" → RAM (weight=0.60)
מקור 2: Dictionary DB     "32gb" → RAM (confidence=0.64)
מקור 3: Compromise NLP    "gb"   → RAM (confidence=0.95)
מקור 4: DNA Context       "זיכרון" לפני "32" → RAM
                               ↓
                     hypothesisMap voting:
                     "ram___32gb" = 0.60 + 0.40×0.64 = 0.856
                               ↓
                     0.856 ≥ 0.85 → AUTO_FILL ✅
```

### שלב 4: Dropdown Snapping (`expert-pipeline.ts`)
```
AI החזיר: "ram" = "32gb"  (lowercase)
DB אופציה: "32GB"          (uppercase)
exactMatch → finalValue = "32GB" ✅
```

### שלב 5: הטופס מציג
| ביטחון | פעולה | מה המשתמש רואה |
|--------|--------|----------------|
| ≥ 0.85 | `AUTO_FILL` | שדה מולא, צבע רגיל |
| 0.45–0.85 | `SUGGEST` | מסגרת **צהובה** + כפתור אישור |
| < 0.45 | `NONE` | שדה ריק |

### שלב 6: למידה
```
אישר   → masterLearn()   → weight++
תיקן   → masterPenalize() → weight-- (על הערך הישן)
לחץ X  → masterPenalize() → weight-- (על הערך שנדחה)
```

---

## 🗄️ טבלאות הזיכרון ב-DB

### `FieldValueReliability` - המילון הרשמי
> ספר משפחת מילים: "32gb" שייך ל-RAM ב-LAPTOPS

| עמודה | דוגמה | הסבר |
|-------|--------|-------|
| `value` | `"32gb"` | המילה |
| `field` | `"ram"` | השדה |
| `category` | `"LAPTOPS"` | קטגוריה |
| `confidence` | `0.640` | ביטחון (0-1) |
| `occurrenceCount` | `3` | כמה פעמים נראה |

### `FieldSignal` - הגלאי הישיר
> כלב מאומן: "1tb ssd" = Storage תמיד

| עמודה | דוגמה | הסבר |
|-------|--------|-------|
| `rawValue` | `"1tb ssd"` | מחרוזת שנסרקת |
| `field` | `"storage"` | שדה מזוהה |
| `weight` | `0.600` | משקל |
| `signalType` | `"VALUE"` | VALUE/UNIT/CONTEXT |

### `ContextPattern` - ה-DNA / השושלת
> משפחה: "זיכרון" (סבא) → FIELD:RAM (נכד)

```
"זיכרון" (PREFIX_ROOT)
   └── "ram" (FIELD, confidence=0.75)
```

**קציר אוטומטי:** count>5 AND conf>0.85 → העתקה ל-FieldValueReliability

### `ParserLog` - יומן הניסיונות
| עמודה | הסבר |
|-------|-------|
| `originalText` | הטקסט שהמשתמש הדביק |
| `aiParsed` | מה ה-AI הציע |
| `userFinal` | מה אושר בסוף |
| `corrections` | ההפרשים (מה שונה) |

---

## ⚖️ פורמולת הביטחון (Asymptotic)

```
❌ פשוט:     0.6 + 0.64 = 1.24  (אי אפשר!)
✅ נכון:      0.6 + (1-0.6) × 0.64
           = 0.6 + 0.4 × 0.64
           = 0.856 ✅ תמיד < 1.0
```

ה-"0.4" = כמה ספק נשאר. כל ראיה נוגסת בספק הנותר.

---

## 📊 ספי ביטחון

| ערך | שם | משמעות |
|-----|-----|---------|
| **0.85** | AUTO_FILL | AI בטוח → מולא אוטומטי |
| **0.45** | SUGGEST | AI מנחש → מסגרת צהובה |
| **0.20** | MIN_KEEP | מועמד לגיזום |
| **0.05** | MIN_EVER | לא יורד מזה לעולם |

---

## 🌿 מנגנון הגיזום (Pruner)

| גודל DB | מינימום גיל לגיזום |
|---------|---------------------|
| < 1,000 | **אין גיזום!** (שלב פיתוח) |
| 1,000 | 89 ימים |
| 10,000 | 82 ימים |
| 100,000+ | 7 ימים |

```bash
# בדיקת dry-run (לא מוחק)
GET /api/admin/pruner?dryRun=true

# גיזום אמיתי
GET /api/admin/pruner?force=true
```

---

## ⚠️ כללים קריטיים

1. **לעולם אל תוסיף שדות זבל:** `Numeric`, `General`, `Value`, `isCatalogMatch`
2. **Case חשוב!** "32gb" ≠ "32GB" בDropdown - תמיד הSnapping קודם
3. **הקטלוג** - רק לValidation, לא למילוי שדות
4. **הנכד לא נמחק לאחר קציר** - נשאר למלחמות משפחות

---

## 🛠️ כלי דיבאג שימושיים

```bash
# מצב למידה נוכחי
npx tsx tmp/track_learning_state.mjs

# TypeScript
npx tsc --noEmit

# DB sync (ללא מחיקה!)
npx prisma db push
```

---

*גרסה: 1.4 | תאריך: מרץ 2026*
*עדכונים אחרונים: Penalty + Smart Volume-Based Pruner + Case Snapping*
