# 📚 היסטוריית שינויים - מערכת הלמידה

## פורמט:

```
[תאריך] | [גרסה] | [שינוי] | [קבצים שהשתנו]
```

---

## 2026-03-27 | v1.5 - War of Families + Temporal Decay

### שינויים:
- ✅ **Family Affinity - Return to Source** - חזרה מהמילון למשפחה שיצרה אותו ב-ContextPattern
- ✅ **computeFamilyAffinity()** - חישוב כמה "אחים" מהמשפחה קיימים בטקסט הנוכחי
- ✅ **STEP 5.5** - Family Affinity Pass אחרי hypothesisMap, לפני finalMap
- ✅ **Temporal Decay** - signals/dict שלא אושרו 180+ יום מאבדים משקל (min 0.30)
- ✅ **docs/** - תיקיית תיעוד: architecture guide + changelog + workflow

### קבצים שהשתנו:
- `src/lib/analyze.ts` - נוספו `getTemporalDecay()`, `computeFamilyAffinity()`, Family Affinity Pass

### הסבר:
```
"עולה" → {price:0.95, temperature:0.85} — שניהם גבוהים!
אחרי Family Affinity:
  price    (₪,שקל קיימים בטקסט) → affinity=0.5 → conf=0.97 ✅
  temp.    (מעלות לא קיים)       → affinity=0.0 → conf=0.85 ❌
```

---

## 2026-03-27 | v1.4 - Penalty + Smart Pruner

### שינויים:

- ✅ **Case Snapping** - "32gb" → "32GB" אוטומטי לפי ה-dropdown
- ✅ **masterPenalize()** - ענישת ביטחון כשמשתמש טועה
- ✅ **POST /api/parser-log/penalize** - API לענישה מה-Frontend
- ✅ **Smart Pruner** - גיזום מבוסס נפח (לא זמן)
- ✅ **@@index([createdAt])** על ContextPattern + FieldValueReliability

### קבצים שהשתנו:

- `src/lib/learning.ts` - נוסף `masterPenalize()` + `pruneWeakNodes()` חכם
- `src/lib/expert-pipeline.ts` - תוקן Case Snapping
- `src/app/api/parser-log/route.ts` - נוסף Penalty על corrections
- `src/app/api/parser-log/penalize/route.ts` - **קובץ חדש**
- `src/components/marketplace/DynamicListingForm.tsx` - `removeUncertain` שולח Penalty
- `prisma/schema.prisma` - נוספו @@index([createdAt])

---

## 2026-03-26 | v1.3 - FieldSignal + Garbage Filter

### שינויים:

- ✅ **FieldSignal** - DB-driven signals (במקום Regex קשיח)
- ✅ **Garbage Filter** - סינון שדות זבל (Numeric, General)
- ✅ **ניקוי DB** - 118 רשומות Numeric/General נמחקו
- ✅ **masterLearn filter** - מניעת זיהום עתידי
- ✅ **הסרת DEBUG logs** מ-analyze.ts

### קבצים שהשתנו:

- `src/lib/analyze.ts` - garbage filter + הסרת logs
- `src/lib/signal-engine.ts` - גלאי DB-driven
- `src/app/api/parser-log/route.ts` - garbage filter ב-masterLearn

---

## 2026-03-24 | v1.2 - DynamicListingForm

### שינויים:

- ✅ **DynamicListingForm** - טופס דינמי מבוסס DB לחלוטין
- ✅ **form-structure API** + Cache 60s
- ✅ **פרישת** ComputerListingForm + MobileListingForm (renamed \_)

---

## 2026-03-22 | v1.1 - FieldValueReliability + ContextPattern

### שינויים:

- ✅ **masterLearn()** - למידה אסימפטוטית מתיקוני משתמש
- ✅ **hypothesisMap** - הצבעה מרובת-מקורות
- ✅ **THE HARVESTER** - קציר אוטומטי ל-FieldValueReliability
- ✅ **SUGGEST/AUTO_FILL** - ספי ביטחון

---

## 2026-03-20 | v1.0 - Base AI Pipeline

### שינויים:

- ✅ **analyze.ts** - Pipeline בסיסי
- ✅ **expert-pipeline.ts** - מיפוי שדות + קטגוריה
- ✅ **matcher-core.ts** - זיהוי קטגוריה
- ✅ **ParserLog** - יומן ניסיונות

---

## 📋 מה מתוכנן לעתיד

- [ ] **מילוי שדות מהקטלוג** (GPU, weight, battery מ-LaptopCatalog)
- [ ] **Admin Pruner UI** - דף ניהול גיזום ידני
- [ ] **API /api/admin/pruner** - endpoint לגנן
- [בוצע ] **War of Families** - תחרות בין משפחות מילים
- [ ] **Multi-lang support** - English + Hebrew seamlessly
