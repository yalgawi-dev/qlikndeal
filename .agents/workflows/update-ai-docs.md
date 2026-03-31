---
description: עדכון תיעוד docs/ אחרי שינויים משמעותיים במערכת הלמידה
---

# Workflow: עדכון תיעוד AI Learning System

## מתי להפעיל?
כשיש שינוי ב:
- `src/lib/analyze.ts`
- `src/lib/learning.ts`
- `src/lib/expert-pipeline.ts`
- `src/lib/signal-engine.ts`
- `prisma/schema.prisma` (טבלאות למידה)
- `src/app/api/parser-log/`

## שלבים

// turbo-all

1. בדוק TypeScript נקי
```bash
npx tsc --noEmit
```

2. פתח `docs/learning-history/changelog.md` והוסף רשומה חדשה בתחילת הקובץ:
```markdown
## YYYY-MM-DD | vX.X - [שם השינוי]

### שינויים:
- ✅ [תיאור קצר של מה שנעשה]

### קבצים שהשתנו:
- `src/lib/...`
```

3. אם השינוי משפיע על ארכיטקטורת הליבה - עדכן גם `docs/architecture/ai-brain-system.md`

4. הוספת ל-git:
```bash
git add docs/
git commit -m "docs: update AI learning changelog v[X.X]"
```
