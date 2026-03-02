---
description: Safe deploy to Vercel - build verification before push
---

# 🔒 Safe Deploy Workflow

# ⚠️ אסור לדלג על שלבים. כל שלב חייב להסתיים בהצלחה לפני הבא.

## STEP 1: Full local build verification

// turbo

```powershell
npm run build 2>&1
```

✅ Required exit code: 0
❌ If exit code is NOT 0 - STOP IMMEDIATELY. Fix all errors. Do NOT proceed to next steps.

## STEP 2: TypeScript type check (extra safety net)

// turbo

```powershell
npx tsc --noEmit 2>&1
```

✅ Required exit code: 0
❌ If exit code is NOT 0 - STOP IMMEDIATELY. Fix all type errors. Do NOT proceed.

## STEP 3: Stage all changes

// turbo

```powershell
git add .
```

## STEP 4: Commit with clear message

```powershell
git commit -m "COMMIT_MESSAGE_HERE"
```

## STEP 5: Push to GitHub (auto-triggers Vercel)

// turbo

```powershell
git push origin main 2>&1
```

## STEP 6: Poll Vercel deployment status (requires VERCEL_TOKEN in .env.local)

// turbo

```powershell
Start-Sleep -Seconds 45
$envContent = Get-Content "d:\יהודה 2023\פרוייקטים\אפליקציה\Qlikndeal\.env.local" -ErrorAction SilentlyContinue
$tokenLine = $envContent | Where-Object { $_ -match "^VERCEL_TOKEN=" }
$token = if ($tokenLine) { $tokenLine -replace "^VERCEL_TOKEN=", "" } else { $null }

if (-not $token) {
    Write-Host "⚠️  VERCEL_TOKEN not set in .env.local. Cannot auto-check deployment status."
    Write-Host "👉  Please check manually at: https://vercel.com/yalgawi-dev/qlikndeal/deployments"
} else {
    Write-Host "🔍 Checking Vercel deployment status..."
    try {
        $response = Invoke-RestMethod -Uri "https://api.vercel.com/v6/deployments?projectId=qlikndeal&limit=1&target=production" -Headers @{ Authorization = "Bearer $token" } -Method GET
        $dep = $response.deployments[0]
        $state = $dep.state
        $url = $dep.url
        $readyState = $dep.readyState

        if ($state -eq "READY" -or $readyState -eq "READY") {
            Write-Host "✅ DEPLOYMENT SUCCESSFUL! Live at: https://$url"
        } elseif ($state -eq "ERROR" -or $readyState -eq "ERROR") {
            Write-Host "❌ DEPLOYMENT FAILED! Check logs at: https://vercel.com/yalgawi-dev/qlikndeal/deployments"
        } elseif ($state -eq "BUILDING" -or $readyState -eq "BUILDING") {
            Write-Host "⏳ Still building... Wait and re-run this step in 30 seconds."
            Write-Host "   Or check: https://vercel.com/yalgawi-dev/qlikndeal/deployments"
        } else {
            Write-Host "ℹ️ Status: $state / $readyState"
            Write-Host "   Check: https://vercel.com/yalgawi-dev/qlikndeal/deployments"
        }
    } catch {
        Write-Host "⚠️ Could not reach Vercel API. Check manually: https://vercel.com/yalgawi-dev/qlikndeal/deployments"
    }
}
```
