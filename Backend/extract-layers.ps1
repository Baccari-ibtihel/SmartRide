# Script pour extraire automatiquement les layers Spring Boot dans le dossier target de chaque module
Write-Host "Extraction des couches Spring Boot (dependencies, snapshot-dependencies, etc.)..." -ForegroundColor Cyan

$services = @("discovery-server", "api-gateway", "dashboard-service", "user-service")

foreach ($svc in $services) {
    $targetPath = Join-Path $PSScriptRoot "$svc\target"
    if (Test-Path $targetPath) {
        $jar = Get-ChildItem -Path $targetPath -Filter "*.jar" | Where-Object { $_.Name -notmatch "original" } | Select-Object -First 1
        if ($jar) {
            Write-Host "-> Extraction pour $svc ($($jar.Name))..." -ForegroundColor Yellow
            Push-Location $targetPath
            try {
                java -Djarmode=layertools -jar $jar.Name extract
                Write-Host "   [OK] snapshot-dependencies & layers extraits dans $targetPath" -ForegroundColor Green
            } catch {
                Write-Host "   [ERR] Erreur lors de l'extraction pour $svc" -ForegroundColor Red
            } finally {
                Pop-Location
            }
        }
    }
}
Write-Host "`nTerminé avec succès ! Toutes les couches sont visibles dans target/." -ForegroundColor Cyan
