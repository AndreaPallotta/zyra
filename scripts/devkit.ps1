param(
    [Parameter(ValueFromRemainingArguments = $true)]
    $RemainingArgs
)

$devkitPath = Join-Path $PSScriptRoot "..\..\agent-devkit\scripts\devkit.ps1"
if (Test-Path $devkitPath) {
    & $devkitPath @RemainingArgs
} else {
    Write-Host "Devkit script not found at $devkitPath"
}
