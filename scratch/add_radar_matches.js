const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/marketplace/RadarDetailModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update imports
const targetImports = `import {
    Loader2, Pencil, Trash2, Share2, CheckCircle2, Calendar, Zap, X
} from "lucide-react";`;

const replacementImports = `import {
    Loader2, Pencil, Trash2, Share2, CheckCircle2, Calendar, Zap, X, Radar, ShoppingBag, ArrowLeft
} from "lucide-react";`;

if (content.includes(targetImports)) {
    content = content.replace(targetImports, replacementImports);
    console.log('✅ Updated imports in RadarDetailModal.');
} else {
    // Try normalized match
    const regexImports = /import\s*\{\s*Loader2,\s*Pencil,\s*Trash2,\s*Share2,\s*CheckCircle2,\s*Calendar,\s*Zap,\s*X\s*\}\s*from\s*"lucide-react";/;
    const match = content.match(regexImports);
    if (match) {
        content = content.replace(match[0], replacementImports);
        console.log('✅ Updated imports via regex.');
    } else {
        console.log('❌ Could not find target imports.');
    }
}

// 2. Update states
const targetStates = `    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(request.query);
    const [extra, setExtra] = useState<Record<string, any>>(initialExtra);
    const [saving, setSaving] = useState(false);
    const shareUrl = \`https://qlikndeal.vercel.app/radar/\${request.id}\`;`;

const replacementStates = `    const [editMode, setEditMode] = useState(false);
    const [editText, setEditText] = useState(request.query);
    const [extra, setExtra] = useState<Record<string, any>>(initialExtra);
    const [saving, setSaving] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const shareUrl = \`https://qlikndeal.vercel.app/radar/\${request.id}\`;`;

if (content.includes(targetStates)) {
    content = content.replace(targetStates, replacementStates);
    console.log('✅ Updated states in RadarDetailModal.');
} else {
    // Regex match
    const regexStates = /const\s*\[editMode,\s*setEditMode\]\s*=\s*useState\(false\);\s*const\s*\[editText,\s*setEditText\]\s*=\s*useState\(request\.query\);\s*const\s*\[extra,\s*setExtra\]\s*=\s*useState[^;]+;\s*const\s*\[saving,\s*setSaving\]\s*=\s*useState\(false\);/;
    const match = content.match(regexStates);
    if (match) {
        content = content.replace(match[0], `const [editMode, setEditMode] = useState(false);\n    const [editText, setEditText] = useState(request.query);\n    const [extra, setExtra] = useState<Record<string, any>>(initialExtra);\n    const [saving, setSaving] = useState(false);\n    const [matches, setMatches] = useState<any[]>([]);\n    const [loadingMatches, setLoadingMatches] = useState(false);`);
        console.log('✅ Updated states via regex.');
    } else {
        console.log('❌ Could not find target states.');
    }
}

// 3. Update Sync Effect and insert Fetch Match Effect
const targetEffect = `    // Sync state on prop updates
    useEffect(() => {
        const flattened = flattenExtraData(request.extraData);
        setEditText(request.query);
        setExtra(flattened);
    }, [request]);`;

const replacementEffect = `    // Sync state on prop updates
    useEffect(() => {
        const flattened = flattenExtraData(request.extraData);
        setEditText(request.query);
        setExtra(flattened);
    }, [request]);

    // Fetch matching listings
    useEffect(() => {
        if (!request || editMode) return;
        
        const fetchMatches = async () => {
            setLoadingMatches(true);
            try {
                const res = await fetch("/api/marketplace/smart-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: request.query,
                        lat: extra.lat || null,
                        lng: extra.lng || null,
                        radiusKm: extra.radius || null,
                        category: extra.category || null,
                        listingType: "SELL"
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.results)) {
                        // Filter out listings belonging to the same user
                        setMatches(data.results.filter((l) => l.sellerId !== request.userId));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch matching listings:", err);
            } finally {
                setLoadingMatches(false);
            }
        };

        fetchMatches();
    }, [request.id, request.query, extra, editMode]);`;

const clean = s => s.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

if (clean(content).includes(clean(targetEffect))) {
    const regexEffect = /useEffect\(\(\)\s*=>\s*\{\s*const\s*flattened\s*=\s*flattenExtraData\(request\.extraData\);\s*setEditText\(request\.query\);\s*setExtra\(flattened\);\s*\}\s*,\s*\[request\]\);/;
    const match = content.match(regexEffect);
    if (match) {
        content = content.replace(match[0], match[0] + `\n\n    // Fetch matching listings\n    useEffect(() => {\n        if (!request || editMode) return;\n        \n        const fetchMatches = async () => {\n            setLoadingMatches(true);\n            try {\n                const res = await fetch("/api/marketplace/smart-search", {\n                    method: "POST",\n                    headers: { "Content-Type": "application/json" },\n                    body: JSON.stringify({\n                        query: request.query,\n                        lat: extra.lat || null,\n                        lng: extra.lng || null,\n                        radiusKm: extra.radius || null,\n                        category: extra.category || null,\n                        listingType: "SELL"\n                    })\n                });\n                if (res.ok) {\n                    const data = await res.json();\n                    if (data.success && Array.isArray(data.results)) {\n                        setMatches(data.results.filter((l) => l.sellerId !== request.userId));\n                    }\n                }\n            } catch (err) {\n                console.error("Failed to fetch matching listings:", err);\n            } finally {\n                setLoadingMatches(false);\n            }\n        };\n\n        fetchMatches();\n    }, [request.id, request.query, extra, editMode]);`);
        console.log('✅ Inserted Fetch Match Effect.');
    } else {
        console.log('❌ Regex match failed for Sync Effect.');
    }
} else {
    console.log('❌ Could not find target Sync Effect.');
}

// 4. Render matches UI in JSX
const targetInfo = `                            {/* Info */}
                            <div className="bg-cyan-950/30 rounded-xl p-3 border border-cyan-500/20 text-xs text-cyan-300">
                                💡 מוכרים שיש להם מוצר מתאים יוכלו לראות את הבקשה שלך וליצור איתך קשר ישירות.
                            </div>`;

const replacementInfo = `                            {/* Matching Listings Section */}
                            <div className="space-y-3 pt-3 border-t border-white/10">
                                <h4 className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                                    <Radar className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                                    מודעות מתאימות שנמצאו במרקטפלייס ({matches.length})
                                </h4>
                                
                                {loadingMatches ? (
                                    <div className="flex items-center justify-center p-6 bg-gray-900/40 rounded-xl border border-white/5">
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                        <span className="text-xs text-gray-400 mr-2 font-medium">מחפש התאמות במרקטפלייס...</span>
                                    </div>
                                ) : matches.length === 0 ? (
                                    <div className="p-4 bg-gray-900/20 rounded-xl border border-white/5 text-center">
                                        <p className="text-gray-500 text-[11px] font-medium">לא נמצאו מודעות מכירה תואמות כרגע. נשלח אליך התראה ברגע שיעלה מוצר מתאים!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {matches.map((l: any) => {
                                            let img = null;
                                            try {
                                                const parsed = JSON.parse(l.images || "[]");
                                                img = parsed[0] || null;
                                            } catch {}
                                            
                                            return (
                                                <a
                                                    key={l.id}
                                                    href={\`/dashboard/marketplace/\${l.id}\`}
                                                    className="flex items-center gap-3 p-3 bg-gray-900/60 hover:bg-gray-800/80 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all duration-200 group/item text-right"
                                                >
                                                    {/* Product Image */}
                                                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden border border-white/10 flex items-center justify-center">
                                                        {img ? (
                                                            <img src={img} alt={l.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="w-4 h-4 text-gray-500" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Text details */}
                                                    <div className="flex-1 min-w-0 text-right">
                                                        <h5 className="text-xs font-bold text-white group-hover/item:text-cyan-400 transition-colors truncate">{l.title}</h5>
                                                        <p className="text-[10px] text-gray-400 mt-1 flex flex-wrap items-center gap-1.5 justify-start" dir="rtl">
                                                            <span className="font-bold text-white">₪{Number(l.price).toLocaleString()}</span>
                                                            <span className="text-gray-600">•</span>
                                                            <span>{l.locationName || "לא צוין מיקום"}</span>
                                                            {l.distanceKm !== null && l.distanceKm !== undefined && (
                                                                <>
                                                                    <span className="text-gray-600">•</span>
                                                                    <span>{Math.round(l.distanceKm)} ק"מ</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Arrow */}
                                                    <ArrowLeft className="w-3.5 h-3.5 text-gray-500 group-hover/item:text-cyan-400 group-hover/item:-translate-x-0.5 transition-all shrink-0" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="bg-cyan-950/30 rounded-xl p-3 border border-cyan-500/20 text-xs text-cyan-300">
                                💡 מוכרים שיש להם מוצר מתאים יוכלו לראות את הבקשה שלך וליצור איתך קשר ישירות.
                            </div>`;

if (content.includes(targetInfo)) {
    content = content.replace(targetInfo, replacementInfo);
    console.log('✅ Inserted matches section UI.');
} else {
    // Regex match
    const regexInfo = /\{\/\*\s*Info\s*\*\/\}\s*<div\s+className="bg-cyan-950\/30[^>]+>\s*💡[^<]+<\/div>/;
    const match = content.match(regexInfo);
    if (match) {
        content = content.replace(match[0], replacementInfo);
        console.log('✅ Inserted matches section UI via regex.');
    } else {
        console.log('❌ Could not find target Info container.');
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
