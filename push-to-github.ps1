# ============================================
# 1) 아래 한 줄만 본인 GitHub 주소로 바꾼 뒤
# 2) PowerShell에서 이 파일을 실행하세요:
#    .\push-to-github.ps1
# 처음 한 번만 remote 가 등록됩니다.
# ============================================

$GitHubRepoUrl = "https://github.com/여기에사용자명/여기에저장소명.git"

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
Set-Location -LiteralPath $here

$git = "git"
if (Test-Path "C:\Program Files\Git\bin\git.exe") {
  $git = "C:\Program Files\Git\bin\git.exe"
}

function Invoke-Git {
  param([string[]]$Args)
  & $git @Args
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Invoke-Git @("add", "-A")
$status = & $git status --porcelain
if ([string]::IsNullOrEmpty($status)) {
  Write-Host "[안내] 커밋할 변경이 없습니다. 푸시만 시도합니다."
} else {
  $msg = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  Invoke-Git @("commit", "-m", $msg)
}

$hasOrigin = $false
foreach ($line in (& $git remote 2>$null)) {
  if ($line -eq "origin") { $hasOrigin = $true; break }
}
if (-not $hasOrigin) {
  if ($GitHubRepoUrl -match "여기에") {
    Write-Error "push-to-github.ps1 안의 `$GitHubRepoUrl 을 본인 저장소 주소로 수정하세요."
    exit 1
  }
  Invoke-Git @("remote", "add", "origin", $GitHubRepoUrl)
}

Invoke-Git @("branch", "-M", "main")
Invoke-Git @("push", "-u", "origin", "main")
Write-Host "[완료] GitHub에 푸시했습니다."
