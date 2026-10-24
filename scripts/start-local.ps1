param([switch]$SeedDemo)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$python = Join-Path $root 'backend/.venv/Scripts/python.exe'
if (!(Test-Path $python)) { throw 'Create backend/.venv and install backend/requirements.lock first; see DEMO_GUIDE.md.' }
if (!(Test-Path (Join-Path $root 'backend/.env'))) { throw 'Configure backend/.env first; see DEMO_GUIDE.md.' }
$logs = Join-Path $root '.task-temp/dev-logs'
New-Item -ItemType Directory -Force $logs | Out-Null
foreach ($port in @(8000, 5173)) {
  if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { throw "Port $port is already in use. Preserve the existing process; inspect it before restarting." }
}
if ($SeedDemo) {
  Push-Location (Join-Path $root 'backend')
  try { & $python -m app.seed_demo; if ($LASTEXITCODE -ne 0) { throw 'Demo seeding failed; no servers started.' } } finally { Pop-Location }
}
$api = Start-Process -FilePath $python -ArgumentList @('-m','uvicorn','app.main:app','--host','localhost','--port','8000') -WorkingDirectory (Join-Path $root 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'api.log') -RedirectStandardError (Join-Path $logs 'api-errors.log') -PassThru
$worker = Start-Process -FilePath $python -ArgumentList @('-m','app.worker') -WorkingDirectory (Join-Path $root 'backend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'worker.log') -RedirectStandardError (Join-Path $logs 'worker-errors.log') -PassThru
$vite = Start-Process -FilePath (Get-Command node).Source -ArgumentList @('node_modules/vite/bin/vite.js','--host','localhost') -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logs 'vite.log') -RedirectStandardError (Join-Path $logs 'vite-errors.log') -PassThru
@{api=$api.Id; worker=$worker.Id; frontend=$vite.Id} | ConvertTo-Json | Set-Content (Join-Path $logs 'pids.json')
Write-Host "Started API $($api.Id), worker $($worker.Id), frontend $($vite.Id). Logs: $logs"
Write-Host 'Open http://localhost:5173. Verify http://localhost:8000/api/v1/ready before signing in.'
