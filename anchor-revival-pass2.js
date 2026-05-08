const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// ══ Pass 2: טיפול ב-53 הנשארים ══
async function run() {
    const pending = await p.fieldAnchor.findMany({ where: { isIgnored: true } });
    console.log(`נשארו: ${pending.length} עוגנים לטיפול\n`);

    let deleted = 0, revived = 0;

    for (const a of pending) {
        const ph = a.phrase.trim();
        const fields = a.relatedFields;

        // ── מחיקות ברורות: רעש / חלקיקי ניקוד / ביטויים חלקיים ──
        const deletePatterns = [
            /^\. /, /\.\s*מחיר/, /^gb\b/, /^ram\s+ו/, /^ב-$/, /^ה-$/,
            /^6 \(המק/, /^3 במצב/, /^5 שם/, /^מזהה$/, /נקנה/, /240hz/,
            /^gb בשימוש/, /^gb מתוך/, /^ddr5 ככה/, /^ ככה/,
            /^בשימוש$/, /^מתוך$/, /^ליבות זיכרון/, /^gb\b/,
        ];
        if (deletePatterns.some(r => r.test(ph))) {
            await p.fieldAnchor.delete({ where: { id: a.id } });
            console.log(`🗑️  נמחק: "${ph}"`);
            deleted++;
            continue;
        }

        // ── עוגני שנה (שנת דגם) — נשארים מוחרמים אבל לא נמחקים ──
        if (fields.join('').includes('שנת') || fields.join('').includes('year')) {
            const yearOk = ['והוא','מפלצת','משנה','ב-','במצב','במצב מעולה','מעולה','והוא מפלצת','משנה ב-','דגם פרו','לנובו סדרת'].some(w => ph.includes(w));
            if (yearOk) {
                console.log(`🔒 נשאר מוחרם (שנה): "${ph}"`);
                continue;
            }
        }

        // ── החייאות: ביטויים בעלי ערך ──
        const revivals = [
            // סדרה / משפחה
            { test: ph === 'מסדרת' || ph === 'מסדרת ה-' || ph === 'מסדרת' , field: 'family' },
            { test: ph === 'גיימינג' || ph === 'נייד גיימינג', field: 'family' },
            { test: ph === 'גיימינג asus', field: 'brand' },
            { test: ph === 'g16' || ph === 'דגם g16', field: 'subModel' },
            { test: ph === 'נייד hp', field: 'brand' },

            // מעבד / זיכרון
            { test: ph === 'ram' && fields.some(f=>f==='ram'), field: 'ram' },
            { test: ph === 'וזיכרון' || ph === 'וזיכרון עבודה', field: 'ram' },
            { test: ph === 'עבודה של', field: 'ram' },
            { test: ph === 'חזק' || ph === 'חזק מאוד', field: 'cpu' },
            { test: ph === 'ram ודיסק', field: 'ram' },
            { test: ph === 'ודיסק', field: 'storage' },

            // GPU
            { test: ph === 'של אנווידיה', field: 'gpu' },
            { test: ph === 'עם 16gb', field: 'ram' },  // 16GB → RAM לא GPU

            // אחסון
            { test: ph === 'ה-' && fields.includes('family'), field: 'family' },
            { test: (ph === 'המחשב' || ph === '. המחשב') && fields.includes('storage'), field: 'storage' },
            { test: ph === 'יש לו', field: 'ram' },

            // מסך
            { test: (ph === 'אינץ\'. מחיר:' || ph === 'בגודל 14') && fields.includes('screen'), field: 'screen' },
        ];

        const match = revivals.find(r => r.test);
        if (match) {
            await p.fieldAnchor.update({
                where: { id: a.id },
                data: { isIgnored: false, relatedFields: [match.field], confidence: 0.60 }
            });
            console.log(`✅ הוחיה: "${ph}" → [${match.field}] (מ-[${fields.join(',')}])`);
            revived++;
            continue;
        }

        // ── למקצוענים / שיווקי → מחק ──
        if (/למקצוענים|מגיע|ram אחסון חיצוני/.test(ph)) {
            await p.fieldAnchor.delete({ where: { id: a.id } });
            console.log(`🗑️  נמחק (שיווקי): "${ph}"`);
            deleted++;
            continue;
        }

        console.log(`⏸️  נשאר: "${ph}" → [${fields.join(',')}] appearances:${a.occurrenceCount}`);
    }

    console.log(`\n══ סיכום Pass 2 ══`);
    console.log(`🗑️  נמחקו: ${deleted}`);
    console.log(`✅ הוחיו: ${revived}`);
}

run().catch(console.error).finally(() => p.$disconnect());
