const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// ══════════════════════════════════════════════════════════
// ANCHOR REVIVAL ENGINE
// מנגנון החייאה חכם לעוגנים מוחרמים
// ══════════════════════════════════════════════════════════

// כללי ניקוי אוטומטי — עוגנים שיש למחוק (רעש טהור)
const NOISE_PATTERNS = [
    /^מחיר/, /^שח$/, /^₪/, /^שקל/, /^מציאה/, /^עולה$/,
    /^לקחת/, /^תחלק/, /^לי$/, /^לו$/, /^ככה$/, /^ודיסק של$/,
    /^gb\)$/, /^ssd\.$/, /^tb ssd/, /^gb דגם/, /^gb\) אחסון/,
    /^gb ומסך/, /^gb ram$/, /^7\.3 אינץ/, /^n15 שם/,
    /^חדש של/, /^מוכר$/, /^שקלים/, /^לציון/, /^מחיר מציאה/,
    /^ דגם$/, /^בשימוש מחיר/, /^שח מזהה/, /^ סדרת/
];

// מיפוי תיקונים — עוגן שגוי → תיקון נכון (שדה + האם להחיות)
const CORRECTIONS = [
    // זיכרון/ram → RAM (לא GPU, לא CPU!)
    { match: p => p.phrase === 'זיכרון גרפי' || p.phrase === 'גרפי', correctField: 'gpu', revive: true },
    { match: p => p.phrase === 'ram' && p.relatedFields.includes('gpu'), correctField: 'ram', revive: true },
    { match: p => (p.phrase === ' זיכרון' || p.phrase === 'וזיכרון' || p.phrase === 'וזיכרון עבודה') && p.relatedFields.includes('gpu'), correctField: 'ram', revive: true },
    
    // מותגים/דגמים → brand / subModel (לא storage!)
    { match: p => p.phrase === 'dell' && p.relatedFields.includes('storage'), correctField: 'brand', revive: true },
    { match: p => p.phrase === 'xps' && p.relatedFields.includes('storage'), correctField: 'subModel', revive: true },
    { match: p => p.phrase === 'dell xps' && p.relatedFields.includes('storage'), correctField: 'subModel', revive: true },
    { match: p => (p.phrase === 'spectre' || p.phrase === 'spectre x360' || p.phrase === 'spectre x') && p.relatedFields.length === 0, correctField: 'family', revive: true },
    { match: p => (p.phrase === 'rog' || p.phrase === 'rog strix') && p.relatedFields.length === 0, correctField: 'family', revive: true },
    { match: p => p.phrase === 'x360' && p.relatedFields.length === 0, correctField: 'family', revive: true },
    { match: p => p.phrase === 'asus' && p.relatedFields.includes('family') && p.isIgnored, correctField: 'brand', revive: true },
    
    // GPU suffixes → gpu (לא ram!)
    { match: p => (p.phrase === 'ti' || p.phrase === 'ti עם') && p.relatedFields.includes('ram'), correctField: 'gpu', revive: true },
    
    // סוללה → battery (לא ram!)  
    { match: p => p.phrase === '. סוללה' && p.relatedFields.includes('ram'), correctField: 'battery', revive: true },
    
    // gb כ-signal (לא anchor) — סמן למחיקה
    { match: p => p.phrase === 'gb' && !p.phrase.includes(' '), correctField: null, revive: false, deleteIt: true },
    
    // עוגנים שנכונים אבל מוחרמים — החייה
    { match: p => p.phrase === 'ram אחסון' && p.relatedFields.includes('storage'), correctField: 'storage', revive: true },
    { match: p => p.phrase === 'כרטיס מסך' && p.relatedFields.includes('gpu'), correctField: 'gpu', revive: true },
    { match: p => p.phrase === 'אנווידיה' && p.relatedFields.includes('gpu'), correctField: 'gpu', revive: true },
    { match: p => p.phrase === 'אינטל' && p.relatedFields.includes('cpu'), correctField: 'cpu', revive: true },
    { match: p => p.phrase === 'intel core' && p.relatedFields.includes('cpu'), correctField: 'cpu', revive: true },
    { match: p => p.phrase === 'מעבד intel' && p.relatedFields.includes('cpu'), correctField: 'cpu', revive: true },
    { match: p => p.phrase === 'מעבד אינטל' && p.relatedFields.includes('cpu'), correctField: 'cpu', revive: true },
    { match: p => p.phrase === 'oled' && p.relatedFields.includes('screen'), correctField: 'screen', revive: true },
    { match: p => p.phrase === 'oled בגודל' && p.relatedFields.includes('screen'), correctField: 'screen', revive: true },
    { match: p => p.phrase === 'ddr5' && p.relatedFields.includes('ram'), correctField: 'ram', revive: true },
    { match: p => p.phrase === 'מסך מגע' && p.relatedFields.includes('screenType'), correctField: 'screenType', revive: true },
    { match: p => p.phrase === 'מגע' && p.relatedFields.includes('screenType'), correctField: 'screenType', revive: true },
    { match: p => p.phrase === 'core' && p.relatedFields.includes('cpu'), correctField: 'cpu', revive: true },
];

async function run() {
    const ignored = await p.fieldAnchor.findMany({ where: { isIgnored: true } });
    
    let deleted = 0, revived = 0, corrected = 0, skipped = 0;
    
    for (const anchor of ignored) {
        // 1. בדוק אם זה רעש טהור — מחק
        const isNoise = NOISE_PATTERNS.some(pat => pat.test(anchor.phrase.trim()));
        if (isNoise || anchor.relatedFields.length === 0 && anchor.occurrenceCount <= 2) {
            await p.fieldAnchor.delete({ where: { id: anchor.id } });
            console.log(`🗑️  נמחק: "${anchor.phrase}" (רעש / ריק)`);
            deleted++;
            continue;
        }
        
        // 2. בדוק אם יש תיקון ידוע
        const correction = CORRECTIONS.find(c => c.match(anchor));
        if (correction) {
            if (correction.deleteIt) {
                await p.fieldAnchor.delete({ where: { id: anchor.id } });
                console.log(`🗑️  נמחק (signal, לא anchor): "${anchor.phrase}"`);
                deleted++;
            } else if (correction.revive) {
                await p.fieldAnchor.update({
                    where: { id: anchor.id },
                    data: {
                        isIgnored: false,
                        relatedFields: [correction.correctField],
                        confidence: 0.65
                    }
                });
                console.log(`✅ הוחיה: "${anchor.phrase}" → [${correction.correctField}] (תוקן מ-[${anchor.relatedFields.join(',')}])`);
                revived++;
            }
            continue;
        }
        
        // 3. שורדים — סמן לבדיקה ידנית
        console.log(`⏸️  ממתין לבדיקה: "${anchor.phrase}" → [${anchor.relatedFields.join(',')}] | appearances:${anchor.occurrenceCount}`);
        skipped++;
    }
    
    console.log(`\n══ סיכום ══`);
    console.log(`🗑️  נמחקו: ${deleted}`);
    console.log(`✅ הוחיו: ${revived}`);
    console.log(`⏸️  ממתינים לבדיקה ידנית: ${skipped}`);
}

run().catch(console.error).finally(() => p.$disconnect());
