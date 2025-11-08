# VetDz Replacement Script
# This script replaces all SihaaExpress branding and laboratory colors with VetDz and vet colors

Write-Host "Starting VetDz replacement script..." -ForegroundColor Green

# Define replacement pairs
$replacements = @(
    # Color classes
    @{Old = "laboratory-primary"; New = "vet-primary"},
    @{Old = "laboratory-secondary"; New = "vet-secondary"},
    @{Old = "laboratory-dark"; New = "vet-dark"},
    @{Old = "laboratory-light"; New = "vet-light"},
    @{Old = "laboratory-accent"; New = "vet-accent"},
    @{Old = "laboratory-muted"; New = "vet-muted"},
    
    # Branding
    @{Old = "SihaaExpress"; New = "VetDz"},
    @{Old = "sihaaexpress"; New = "vetdz"},
    @{Old = "Sihaaexpress"; New = "VetDz"},
    @{Old = "SIHAAEXPRESS"; New = "VETDZ"},
    
    # Database/API terms
    @{Old = "laboratory_profiles"; New = "vet_profiles"},
    @{Old = "laboratory_id"; New = "vet_id"},
    @{Old = "laboratory_name"; New = "vet_name"},
    @{Old = "lab_name"; New = "clinic_name"},
    @{Old = "LaboratoryProfile"; New = "VetProfile"},
    @{Old = "laboratoryProfile"; New = "vetProfile"},
    @{Old = "laboratory"; New = "vet"},
    @{Old = "Laboratory"; New = "Vet"},
    @{Old = "LABORATORY"; New = "VET"},
    
    # Remove clinique references (we only have vets now)
    @{Old = "clinique_profiles"; New = "vet_profiles"},
    @{Old = "CliniqueProfile"; New = "VetProfile"},
    @{Old = "cliniqueProfile"; New = "vetProfile"},
    @{Old = "clinique"; New = "vet"},
    @{Old = "Clinique"; New = "Vet"},
    
    # Email
    @{Old = "sihaaexpress@gmail.com"; New = "vetdz@gmail.com"},
    @{Old = "support@sihaaexpress.com"; New = "support@vetdz.com"}
)

# Get all files to process (excluding node_modules, .git, dist, etc.)
$files = Get-ChildItem -Path "src" -Recurse -File -Include *.tsx,*.ts,*.css,*.json,*.md,*.sql,*.js |
    Where-Object { $_.FullName -notmatch "node_modules|\.git|dist|build" }

$totalFiles = $files.Count
$processedFiles = 0

foreach ($file in $files) {
    $processedFiles++
    Write-Progress -Activity "Processing files" -Status "$processedFiles of $totalFiles" -PercentComplete (($processedFiles / $totalFiles) * 100)
    
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        $originalContent = $content
        
        foreach ($replacement in $replacements) {
            $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
        }
        
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            Write-Host "Updated: $($file.FullName)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "Error processing $($file.FullName): $_" -ForegroundColor Red
    }
}

Write-Host "`nReplacement complete!" -ForegroundColor Green
Write-Host "Processed $totalFiles files" -ForegroundColor Cyan
