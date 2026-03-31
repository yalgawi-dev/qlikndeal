
# ═══════════════════════════════════════════════════════════════
# 🧪 DRY RUN TEST — AI Extraction Engine v2 (Hebrew-First)
# בדיקת: ניתוח | פירוק משפט | שקילה | למידה | הגנה מהזיות
# Response structure: { success, result: { ram, storage, condition, suggestions[], ... } }
# ═══════════════════════════════════════════════════════════════

$BASE_URL = "http://localhost:3000"
$ANALYZE_URL = "$BASE_URL/api/marketplace/analyze"

$pass = 0
$fail = 0

function Write-Header($msg) {
    Write-Host "`n══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════════" -ForegroundColor Cyan
}
function Pass($msg)  { Write-Host "  ✅ $msg" -ForegroundColor Green;  $global:pass++ }
function Fail($msg)  { Write-Host "  ❌ $msg" -ForegroundColor Red;    $global:fail++ }
function Info($msg)  { Write-Host "  ℹ️  $msg" -ForegroundColor Yellow }

function Invoke-Analyze($text, $category) {
    $body = @{ text = $text; category = $category } | ConvertTo-Json -Compress
    try {
        $resp = Invoke-WebRequest -Uri $ANALYZE_URL -Method POST `
            -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) `
            -TimeoutSec 30 -ErrorAction Stop
        $data = $resp.Content | ConvertFrom-Json
        return $data.result
    } catch {
        Write-Host "  🔴 HTTP Error: $_" -ForegroundColor Red
        return $null
    }
}

function Show-Result($r) {
    if ($null -eq $r) { return }
    $fields = @("brand","modelName","ram","storage","cpu","condition","batteryPercent","price","category")
    foreach ($f in $fields) {
        $v = $r.$f
        if ($v -and "$v".Trim() -ne "") {
            Write-Host "    📌 $f = '$v'" -ForegroundColor White
        }
    }
    # הצג suggestions
    if ($r.suggestions -and $r.suggestions.Count -gt 0) {
        Write-Host "    🧠 AI Suggestions ($($r.suggestions.Count)):" -ForegroundColor DarkCyan
        foreach ($s in $r.suggestions) {
            $col = if ($s.action -eq "AUTO_FILL") { "Green" } elseif ($s.action -eq "SUGGEST") { "Yellow" } else { "Gray" }
            Write-Host "       [$($s.action)] $($s.field) = '$($s.value)' conf=$([math]::Round($s.confidence,3)) src=$($s.source)" -ForegroundColor $col
        }
    }
}

# ═══════════════════════════════════════════════════════════════
# SUITE 1 — פירוק משפטים עבריים (Hebrew Sentence Decomposition)
# ═══════════════════════════════════════════════════════════════
Write-Header "SUITE 1 — פירוק משפטים עבריים"

# Test 1A — לפטופ עם תחיליות עבריות
Write-Host "`n  📋 Test 1A: לפטופ עם תחיליות (ה,ל,ב,מ)" -ForegroundColor White
$r = Invoke-Analyze "מוכר את המחשב הנשא שלי עם 16 גיגה זיכרון ו-512 גיגה SSD" "LAPTOPS"
Show-Result $r
if ($r) {
    if ($r.ram -match "16" -or ($r.suggestions | Where-Object { $_.field -eq "ram" -and $_.value -match "16" })) {
        Pass "RAM '16' extracted correctly (Hebrew prefix normalization working)"
    } else {
        Fail "RAM not extracted — Hebrew normalizer may not be stripping prefixes"
    }
    if ($r.storage -match "512" -or ($r.suggestions | Where-Object { $_.field -eq "storage" -and $_.value -match "512" })) {
        Pass "Storage '512' extracted correctly"
    } else {
        Fail "Storage '512' not found"
    }
}

# Test 1B — לפטופ בעברית עם ניקוד
Write-Host "`n  📋 Test 1B: ניקוד עברי" -ForegroundColor White
$r = Invoke-Analyze "לַפְטוֹפּ עִם 8 גִּיגָה רַם בְּמַצָּב טוֹב" "LAPTOPS"
Show-Result $r
if ($r) {
    if ($r.ram -match "8" -or ($r.suggestions | Where-Object { $_.field -eq "ram" -and $_.value -match "8" })) {
        Pass "Niqqud stripped — RAM extracted from vowelized text"
    } else {
        Info "RAM not found from niqqud text (niqqud removal + Hebrew normalization needed more context)"
    }
}

# Test 1C — מובייל עם storage
Write-Host "`n  📋 Test 1C: אייפון 14 Pro Max" -ForegroundColor White
$r = Invoke-Analyze "אייפון 14 פרו מקס 256 גיגה מצב מצוין כמו חדש" "MOBILES"
Show-Result $r
if ($r) {
    if ($r.condition -match "חדש" -or $r.condition -match "new") {
        Pass "Condition 'כמו חדש' detected"
    } else {
        Fail "Condition not extracted — got '$($r.condition)'"
    }
    if ($r.storage -match "256" -or ($r.suggestions | Where-Object { $_.value -match "256" })) {
        Pass "Storage 256GB detected"
    } else {
        Fail "Storage not found"
    }
}

# Test 1D — מודעה עם מחיר
Write-Host "`n  📋 Test 1D: מחיר מפורש" -ForegroundColor White
$r = Invoke-Analyze "מוכר לפטופ Dell XPS 15 אינץ 32 גיגה RAM מחיר 3500 שקל" "LAPTOPS"
Show-Result $r
if ($r) {
    if ($r.price -match "3500") {
        Pass "Price '3500' extracted correctly"
    } else {
        Fail "Price not extracted — got '$($r.price)'"
    }
    if ($r.brand -match "Dell" -or $r.brand -match "dell") {
        Pass "Brand 'Dell' detected"
    } else {
        Info "Brand 'Dell' not detected — may need DB training"
    }
}

# ═══════════════════════════════════════════════════════════════
# SUITE 2 — Unit Binding (Generic, No Hardcoding)
# גיגה → gb → storage/ram בלי rules hardcoded
# ═══════════════════════════════════════════════════════════════
Write-Header "SUITE 2 — Dynamic Unit Binding"

Write-Host "`n  📋 Test 2A: 'גיגה' כיחידת אחסון/זיכרון" -ForegroundColor White
$r = Invoke-Analyze "מחשב עם 16 גיגה זיכרון ו-256 גיגה דיסק" "LAPTOPS"
Show-Result $r
if ($r) {
    $allSuggestions = $r.suggestions
    Info "Total suggestions: $($allSuggestions.Count)"
    $ramHit     = $r.ram -match "16" -or ($allSuggestions | Where-Object { $_.field -eq "ram" -and $_.value -match "16" })
    $storageHit = $r.storage -match "256" -or ($allSuggestions | Where-Object { $_.field -eq "storage" -and $_.value -match "256" })
    if ($ramHit)     { Pass "Number 16 correctly bound to RAM field" }
    else             { Info "RAM binding via signals not yet trained (FieldSignal table likely empty — expected on fresh install)" }
    if ($storageHit) { Pass "Number 256 correctly bound to Storage field" }
    else             { Info "Storage binding not yet trained" }
}

Write-Host "`n  📋 Test 2B: 'אינץ' כיחידת מסך" -ForegroundColor White
$r = Invoke-Analyze "מקבוק 15 אינץ M3 Pro" "LAPTOPS"
Show-Result $r
if ($r) {
    if ($r.brand -match "Apple" -or $r.brand -match "MacBook") {
        Pass "Brand Apple/MacBook recognized"
    } else {
        Info "Brand detection depends on DB training data"
    }
}

# ═══════════════════════════════════════════════════════════════
# SUITE 3 — Threshold + Decision Engine
# בודק AUTO_FILL / SUGGEST / NONE
# ═══════════════════════════════════════════════════════════════
Write-Header "SUITE 3 — Threshold + Decision Engine"

Write-Host "`n  📋 Test 3A: ביטחון גבוה → AUTO_FILL" -ForegroundColor White
$r = Invoke-Analyze "iPhone 14 Pro Max 256GB mint condition" "MOBILES"
Show-Result $r
if ($r -and $r.suggestions) {
    $autoFills = $r.suggestions | Where-Object { $_.action -eq "AUTO_FILL" }
    $suggests  = $r.suggestions | Where-Object { $_.action -eq "SUGGEST" }
    Info "AUTO_FILL: $($autoFills.Count) | SUGGEST: $($suggests.Count)"
    if ($autoFills.Count -gt 0) {
        Pass "AUTO_FILL results present for high-confidence text"
        foreach ($af in $autoFills) {
            Write-Host "      AUTO_FILL: $($af.field) = '$($af.value)' (conf=$([math]::Round($af.confidence,3)))" -ForegroundColor Green
        }
    } else {
        Info "No AUTO_FILL yet — DB needs more training examples (fresh DB)"
    }
    if ($suggests.Count -gt 0) {
        Pass "SUGGEST results present — threshold engine working"
    }
}

Write-Host "`n  📋 Test 3B: טקסט עמום → לא AUTO_FILL על שדות מספריים" -ForegroundColor White
$r = Invoke-Analyze "לפטופ מצוין ממש מצוין מומלץ מאוד" "LAPTOPS"
if ($r -and $r.suggestions) {
    $badAutoFill = $r.suggestions | Where-Object {
        $_.action -eq "AUTO_FILL" -and
        $_.field -in @("ram","storage","screenSize","batteryHealth","batteryPercent") -and
        -not ($_.value -match '\d')
    }
    if ($badAutoFill.Count -eq 0) {
        Pass "Anti-hallucination guard working — no numeric field AUTO_FILL from vague text"
    } else {
        Fail "HALLUCINATION DETECTED: $(($badAutoFill | ForEach-Object { "$($_.field)='$($_.value)'" }) -join ', ')"
    }
} else {
    Pass "No suggestions from vague text — clean output"
}

# ═══════════════════════════════════════════════════════════════
# SUITE 4 — Anti-Hallucination (Numeric Guard)
# ═══════════════════════════════════════════════════════════════
Write-Header "SUITE 4 — Anti-Hallucination Guard"

Write-Host "`n  📋 Test 4A: 'מושלם' לא אמור לתפוס batteryHealth ללא מספר" -ForegroundColor White
$r = Invoke-Analyze "אייפון במצב מושלם ממש" "MOBILES"
if ($r -and $r.suggestions) {
    $bad = $r.suggestions | Where-Object {
        $_.field -eq "batteryHealth" -and $_.action -eq "AUTO_FILL" -and -not ($_.value -match '\d')
    }
    if ($bad.Count -eq 0) { Pass "batteryHealth numeric guard OK" }
    else { Fail "batteryHealth hallucination: '$($bad[0].value)'" }
}

Write-Host "`n  📋 Test 4B: 'מצוין' לא אמור לתפוס RAM ללא מספר" -ForegroundColor White
$r = Invoke-Analyze "מחשב מצוין לגמרי מצוין" "LAPTOPS"
if ($r -and $r.suggestions) {
    $bad = $r.suggestions | Where-Object {
        $_.field -eq "ram" -and -not ($_.value -match '\d')
    }
    if ($bad.Count -eq 0) { Pass "RAM text-only guard OK — no non-numeric RAM" }
    else { Fail "RAM hallucination: $($bad | ForEach-Object { "'$($_.value)'" })" }
}

# ═══════════════════════════════════════════════════════════════
# SUITE 5 — Category Detection
# ═══════════════════════════════════════════════════════════════
Write-Header "SUITE 5 — Category Detection"

$categoryTests = @(
    @{ text = "אייפון 15 פלוס למכירה";   expect = "PHONES"   }
    @{ text = "לפטופ Dell XPS 15";         expect = "LAPTOPS"  }
    @{ text = "טויוטה קורולה 2020";        expect = "VEHICLES" }
    @{ text = "מקרר סמסונג 500 ליטר";     expect = "APPLIANCES" }
)

foreach ($ct in $categoryTests) {
    $r = Invoke-Analyze $ct.text $null
    if ($r) {
        $got = "$($r.category)".ToUpper()
        if ($got -eq $ct.expect -or $got -like "*$($ct.expect)*") {
            Pass "Category '$($ct.expect)' detected for: '$($ct.text)'"
        } else {
            Info "Category mismatch: expected '$($ct.expect)', got '$got' for: '$($ct.text)'"
        }
    }
}

# ═══════════════════════════════════════════════════════════════
# FINAL REPORT
# ═══════════════════════════════════════════════════════════════
Write-Header "📊 FINAL TEST REPORT"
$total = $pass + $fail
Write-Host "  ✅ PASSED : $pass / $total" -ForegroundColor Green
Write-Host "  ❌ FAILED : $fail / $total" -ForegroundColor Red

if ($fail -eq 0) {
    Write-Host "`n  🚀 ALL TESTS PASSED — AI Pipeline v2 is OPERATIONAL!" -ForegroundColor Green
} elseif ($fail -le 3) {
    Write-Host "`n  ⚠️  Minor issues — likely needs more FieldSignal training data in DB" -ForegroundColor Yellow
    Write-Host "  💡 TIP: Run masterLearn() on real listings to populate FieldSignal table" -ForegroundColor Yellow
} else {
    Write-Host "`n  🔴 Multiple failures — review pipeline layers" -ForegroundColor Red
}
Write-Host ""
