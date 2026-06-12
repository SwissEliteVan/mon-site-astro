$docsPath = [Environment]::GetFolderPath("MyDocuments")
$hasher = [System.Security.Cryptography.SHA256]::Create()

# Optimisation : filtrage des dossiers exclus avant le Group-Object
$fileGroups = Get-ChildItem -Path $docsPath -File -Recurse |
    Where-Object { 
        $_.FullName -notmatch '\\node_modules\\' -and 
        $_.FullName -notmatch '\\\.git\\' -and
        $_.Length -gt 0
    } |
    Group-Object -Property Length

$duplicates = [System.Collections.Generic.List[string]]::new()

foreach ($group in $fileGroups) {
    if ($group.Count -gt 1) {
        $hashGroups = $group.Group | Group-Object -Property {
            try {
                $stream = [System.IO.File]::OpenRead($_.FullName)
                [System.BitConverter]::ToString($hasher.ComputeHash($stream))
            }
            finally {
                if ($stream) { $stream.Close() }
            }
        }

        $hashGroups.Where{ $_.Count -gt 1 }.ForEach{
            $_.Group | Select-Object -Skip 1 | ForEach-Object {
                $duplicates.Add($_.FullName)
            }
        }
    }
}

if ($duplicates.Count -gt 0) {
    Write-Host "`nFICHIERS EN DOUBLE ($($duplicates.Count)) :" -ForegroundColor Red
    $duplicates | ForEach-Object { Write-Host "  $_" }
}
else {
    Write-Host "Aucun doublon trouvé." -ForegroundColor Green
}

$hasher.Dispose()