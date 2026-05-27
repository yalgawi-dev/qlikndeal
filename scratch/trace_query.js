const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();

const BRAND_ALIASES = {
    xiaomi:   ["xiomi", "xaiomi", "שיאומי", "שיומי", "xiomi"],
    samsung:  ["סמסונג", "samsum", "samsng"],
    apple:    ["אפל", "iphone", "אייפון"],
    redmi:    ["רדמי"],
};

function expandTerms(terms) {
    return terms.map(term => {
        const t = term.toLowerCase().trim();
        const expanded = new Set([t]);
        for (const [canonical, aliases] of Object.entries(BRAND_ALIASES)) {
            if (t === canonical || aliases.some(a => a.toLowerCase() === t)) {
                expanded.add(canonical);
                aliases.forEach(a => expanded.add(a.toLowerCase()));
            }
        }
        return Array.from(expanded);
    });
}

async function test() {
    const q = "xiomi redmi 14";
    const rawTerms = q.split(/\s+/).filter(t => t.length > 0);
    const expandedTermGroups = expandTerms(rawTerms);

    console.log("Raw Terms:", rawTerms);
    console.log("Expanded groups:", expandedTermGroups);

    const textFields = ["brand", "modelName", "series", "cpu"];
    const buildMobileWhere = () => {
        return {
            OR: [
                {
                    AND: expandedTermGroups.map(termGroup => ({
                        OR: termGroup.flatMap(term =>
                            textFields.map(field => ({
                                [field]: { contains: term, mode: "insensitive" }
                            }))
                        )
                    }))
                },
                ...rawTerms.map(term => ({
                    hebrewAliases: { hasSome: [term, term.toLowerCase(), term.toUpperCase()] }
                })),
            ]
        };
    };

    const rows = await prisma.mobileCatalog.findMany({
        where: buildMobileWhere(),
        take: 50
    });

    console.log(`Found ${rows.length} rows:`);
    for (const r of rows) {
        console.log(`- ${r.brand} ${r.series} (${r.modelName}) | Aliases: ${JSON.stringify(r.hebrewAliases)}`);
    }
}

test().finally(() => prisma.$disconnect());
