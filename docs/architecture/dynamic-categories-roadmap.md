# מפת דרכים – קטגוריות דינמיות (Dynamic Category Engine)
## סיכום לפגישה הבאה עם Antigravity

---

## מה כבר בנינו ✅

1. **`src/lib/config/categoryRegistry.ts`** – Registry Pattern מרכזי:
   - 9 קטגוריות בסיס: `LAPTOPS, SMARTPHONES, VEHICLES, APPLIANCES, ELECTRONICS, DESKTOPS, AIO, CUSTOM_COMPUTERS, MOTHERBOARDS`
   - `getCategoryRegistry()` – async + Cache 60s + קורא מ-DB (DynamicCategory)
   - מבנה: `code, nameHebrew, prismaModel, nlpKeywords, regex, learnFields, uniqueKeys, translationMap`

2. **`src/lib/matcher-core.ts`** – 3 שכבות זיהוי דינמיות (ללא switch/case):
   - שכבה 1: compromise NLP (סמנטי, מזהה וריאציות)
   - שכבה 2: Regex עברי
   - שכבה 3: UNKNOWN

3. **`src/app/admin/import-actions.ts`** – `importDynamicCategoryAction()` גנרי לכל קטגוריה + `undoRecentInCategoryAction` דינמי

4. **DB: `DynamicCategory`** – טבלה ב-schema.prisma + db push בוצע ✅
   - שדות: `code, nameHebrew, prismaModel, nlpKeywords, regex, learnFields, uniqueKeys, translationMap, isActive`

5. **`/admin/categories`** – UI: כרטיסיות + כפתור + (לשדרג!)
   - לשונית "קטגוריות דינמיות" נוספה לסרגל הניהול (`src/app/admin/layout.tsx`)

---

## מה לבנות בפגישה הבאה 🎯

### שלב א' – שדרוג ממשק ה-+ (עדיפות גבוהה!):

**הבעיה כרגע**: הטופס טכני מדי (regex, prismaModel = שפת מתכנת).

**הפתרון הנדרש**:
```
האדמין כותב שם קטגוריה + 3 דוגמאות מוצרים
          ↓
API חדש שולח ל-AI (Gemini)
          ↓
AI מחזיר: nlpKeywords, regex, learnFields, uniqueKeys, prismaModel
          ↓
אדמין רואה תצוגה מקדימה → מאשר → שומר ב-DynamicCategory
```

**קבצים:**
- לשנות: `src/app/admin/categories/CategoriesClient.tsx`
- להקים: `src/app/api/admin/category-suggest/route.ts`

### שלב ב' – לכידת UNKNOWN (עדיפות בינונית):
- כשמשתמש מקבל UNKNOWN → שמור ב-`UnknownCategoryHints` (טבלה חדשה)
- 3+ דומים (semantic) → הצע לאדמין אישור/דחייה
- קובץ: `src/app/api/marketplace/analyze/route.ts`

### שלב ג' – דגל "נוצר ע"י AI" (עדיפות נמוכה):
- קטגוריות שנוצרו ע"י AI → אייקון 🤖 + רקע ירוק

---

## קבצים מרכזיים:
| קובץ | מצב |
|------|-----|
| `src/lib/config/categoryRegistry.ts` | ✅ מרכז השליטה |
| `src/lib/matcher-core.ts` | ✅ דינמי |
| `src/app/admin/import-actions.ts` | ✅ גנרי |
| `src/app/admin/categories/page.tsx` | ✅ |
| `src/app/admin/categories/CategoriesClient.tsx` | ⚠️ לשדרג ממשק + |
| `src/app/actions/category.ts` | ✅ addDynamicCategory() |
| `src/app/admin/layout.tsx` | ✅ לשונית קטגוריות |
| `prisma/schema.prisma` | ✅ DynamicCategory |

---

## פקודות שרצו כבר (לא לחזור):
```
npx prisma generate ✅
npx prisma db push  ✅
```

---

## המשפט לפתוח בו את הפגישה הבאה:
> **"שדרג את ממשק ה-+ בדף /admin/categories. האדמין כותב שם קטגוריה + 3 דוגמאות מוצרים, ה-AI מחלץ אוטומטית nlpKeywords/regex/learnFields/uniqueKeys/prismaModel ומציג לאדמין לאישור לפני השמירה."**

---

## החזון המלא (ציטוט המשתמש):
> *"המערכת תלמד לבד קטגוריות. משתמש יכניס מודעה שה-AI לא מכיר – המערכת תפתח קטגוריה חדשה עם שדות חדשים בלי לערב אדמין. לאדמין תמיד האפשרות לתקן."*
