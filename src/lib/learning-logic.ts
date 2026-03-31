import prismadb from './prismadb';

export async function learnFromUser(originalText: string, userConfirmed: any, category: string) {
const valueUnits = ['₪', 'שקל', 'שח', 'gb', 'גיגה', 'אינץ', 'קמ', 'יד'];
for (const [field, confirmedValue] of Object.entries(userConfirmed)) {
if (!confirmedValue || isNaN(Number(confirmedValue))) continue;
const valStr = String(confirmedValue);
const index = originalText.indexOf(valStr);
if (index !== -1) {
const wordsBefore = originalText.substring(0, index).trim().split(/\s+/);
const pBefore = wordsBefore.length > 0 ? wordsBefore[wordsBefore.length - 1] : null;
if (pBefore && pBefore.length > 1) {
await (prismadb as any).learnedPattern.upsert({
where: { id: field + '' + category + '' + pBefore },
update: { occurrences: { increment: 1 }, confidence: { increment: 0.1 } },
create: { id: field + '' + category + '' + pBefore, field, patternBefore: pBefore, category, confidence: 0.2 }
});
}
}
}
}