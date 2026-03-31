import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

console.log("=".repeat(60));
console.log("🔍 שאלה 1: האם ThinkPad X1 Carbon קיים בקטלוג?");
console.log("=".repeat(60));

const catalogMatches = await p.laptopCatalog.findMany({
    where: {
        OR: [
            { modelName: { contains: "ThinkPad", mode: "insensitive" } },
            { modelName: { contains: "X1 Carbon", mode: "insensitive" } },
            { brand: { contains: "Lenovo", mode: "insensitive" } }
        ]
    },
    select: { id: true, brand: true, modelName: true },
    take: 5
});

if (catalogMatches.length > 0) {
    console.log("✅ נמצא בקטלוג!");
    catalogMatches.forEach(m => console.log(`   brand="${m.brand}"  model="${m.modelName}"`));
} else {
    console.log("❌ לא נמצא בקטלוג");
}

console.log("\n" + "=".repeat(60));
console.log("🧠 מצב למידה נוכחי (LAPTOPS)");
console.log("=".repeat(60));

const db = p;

// FieldSignal
const signals = await db.fieldSignal.findMany({
    where: { category: "LAPTOPS" },
    orderBy: { weight: "desc" },
    take: 20
});
console.log(`\n📡 FieldSignal (${signals.length} רשומות):`);
if (signals.length === 0) {
    console.log("   [ריק - עוד לא נאספו סיגנלים]");
} else {
    signals.forEach(s => 
        console.log(`   field="${String(s.field).padEnd(15)}" rawValue="${String(s.rawValue).padEnd(20)}" weight=${Number(s.weight).toFixed(3)} type=${s.signalType}`)
    );
}

// FieldValueReliability
const dictEntries = await db.fieldValueReliability.findMany({
    where: { category: "LAPTOPS" },
    orderBy: { occurrenceCount: "desc" },
    take: 20
});
console.log(`\n📖 FieldValueReliability - מילון (${dictEntries.length} רשומות):`);
if (dictEntries.length === 0) {
    console.log("   [ריק]");
} else {
    dictEntries.forEach(d => 
        console.log(`   field="${String(d.field).padEnd(15)}" value="${String(d.value).padEnd(25)}" conf=${Number(d.confidence).toFixed(3)} count=${d.occurrenceCount}`)
    );
}

// ContextPattern
const patterns = await db.contextPattern.findMany({
    where: { category: "LAPTOPS" },
    orderBy: { occurrenceCount: "desc" },
    take: 15
});
console.log(`\n🧬 ContextPattern - DNA (${patterns.length} רשומות):`);
if (patterns.length === 0) {
    console.log("   [ריק]");
} else {
    patterns.forEach(pt => 
        console.log(`   type="${String(pt.type).padEnd(12)}" pattern="${String(pt.patternPart).padEnd(20)}" field="${String(pt.field).padEnd(12)}" conf=${Number(pt.confidence).toFixed(3)} count=${pt.occurrenceCount}`)
    );
}

// ParserLog
const logs = await db.parserLog.findMany({
    where: { category: "LAPTOPS" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, createdAt: true, inputMode: true, corrections: true, userFinal: true }
});
console.log(`\n📋 ParserLog - ${logs.length} לוגים אחרונים:`);
logs.forEach(l => {
    const hasCorrections = l.corrections && l.corrections !== "{}";
    console.log(`   id=${l.id.slice(0,8)}... corrections=${hasCorrections ? "✅" : "❌"} userFinal=${l.userFinal ? "✅" : "❌"}`);
    if (hasCorrections) {
        try {
            const corr = JSON.parse(l.corrections);
            Object.entries(corr).forEach(([k, v]) => 
                console.log(`      "${k}": AI="${v.ai || "(ריק)"}" → User="${v.user}"`)
            );
        } catch {}
    }
});

await p.$disconnect();
