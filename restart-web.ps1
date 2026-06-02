$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$LogDir = Join-Path $ProjectRoot "temp"
$JavaHome = Join-Path $ProjectRoot ".tools\jdk-21.0.11"

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

function Import-EnvFile {
    param(
        [Parameter(Mandatory = $true)]
        [string] $Path
    )

    if (!(Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (!$line -or $line.StartsWith("#") -or !$line.Contains("=")) {
            return
        }

        $parts = $line.Split("=", 2)
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

function Stop-PortProcess {
    param(
        [Parameter(Mandatory = $true)]
        [int] $Port
    )

    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
        Where-Object { $_.State -eq "Listen" }

    foreach ($connection in $connections) {
        $processId = $connection.OwningProcess
        if ($processId -and $processId -ne $PID) {
            Write-Host "Stopping process $processId on port $Port..."
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

if (!(Test-Path (Join-Path $JavaHome "bin\java.exe"))) {
    throw "JDK 21 not found at: $JavaHome"
}

Import-EnvFile (Join-Path $ProjectRoot ".env.local")

if (-not $env:MAIL_USERNAME) {
    $env:MAIL_USERNAME = "uit.gohcmc@gmail.com"
}

if (-not $env:MAIL_PASSWORD) {
    $secureMailPassword = Read-Host "Enter Gmail app password for $env:MAIL_USERNAME" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureMailPassword)
    try {
        $env:MAIL_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

Stop-PortProcess -Port 8080
Stop-PortProcess -Port 5173

$backendOut = Join-Path $LogDir "backend.out.log"
$backendErr = Join-Path $LogDir "backend.err.log"
$frontendOut = Join-Path $LogDir "frontend.out.log"
$frontendErr = Join-Path $LogDir "frontend.err.log"
$backendRunner = Join-Path $LogDir "run-backend.ps1"
$frontendRunner = Join-Path $LogDir "run-frontend.ps1"

@"
`$env:JAVA_HOME = '$JavaHome'
`$env:PATH = "`$env:JAVA_HOME\bin;`$env:PATH"
`$env:DB_HOST = 'localhost'
`$env:DB_PORT = '1433'
`$env:DB_NAME = 'VeMayBayDB'
`$env:DB_USER = 'vemaybay_app'
`$env:DB_PASSWORD = 'VeMayBayApp@Test123'
mvn spring-boot:run
"@ | Set-Content -Encoding UTF8 -Path $backendRunner

@"
npm run dev -- --host 0.0.0.0
"@ | Set-Content -Encoding UTF8 -Path $frontendRunner

Write-Host "Starting backend on http://localhost:8080 ..."
$backendProcess = Start-Process `
    -WindowStyle Hidden `
    -FilePath "powershell.exe" `
    -WorkingDirectory $BackendDir `
    -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $backendRunner) `
    -RedirectStandardOutput $backendOut `
    -RedirectStandardError $backendErr `
    -PassThru

Write-Host "Starting frontend on http://localhost:5173 ..."
$frontendProcess = Start-Process `
    -WindowStyle Hidden `
    -FilePath "powershell.exe" `
    -WorkingDirectory $FrontendDir `
    -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $frontendRunner) `
    -RedirectStandardOutput $frontendOut `
    -RedirectStandardError $frontendErr `
    -PassThru

Write-Host ""
Write-Host "Started:"
Write-Host "  Backend PID : $($backendProcess.Id)"
Write-Host "  Frontend PID: $($frontendProcess.Id)"
Write-Host ""
Write-Host "Open:"
Write-Host "  http://localhost:5173/login"
Write-Host ""
Write-Host "Logs:"
Write-Host "  $backendOut"
Write-Host "  $backendErr"
Write-Host "  $frontendOut"
Write-Host "  $frontendErr"
Write-Host ""
Write-Host "Gmail OTP:"
Write-Host "  Script reads MAIL_USERNAME and MAIL_PASSWORD from .env.local if present."
Write-Host "  MAIL_PASSWORD must be a Gmail App Password."
