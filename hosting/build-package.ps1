# Builds ramzshop-production.zip from the locally installed copy (run AFTER the wizard finished).
# Excludes secrets, caches, logs and dev leftovers. Output goes next to this script.
$src = 'C:\ramzshop-web'
$stage = Join-Path $env:TEMP 'ramzshop-stage'
$out = Join-Path $PSScriptRoot 'ramzshop-production.zip'

if (Test-Path $stage) { cmd /c rmdir /s /q "$stage" }
New-Item -ItemType Directory $stage | Out-Null

$xd = @('storage\logs', 'storage\framework\cache', 'storage\framework\sessions', 'storage\framework\views', 'node_modules', 'tests', '.git')
$xf = @('.env', '.rnd', 'mySpecs.html', 'routes.json', 'backup.json', 'models.json', 'composer.phar', 'auto_builder_sh.sh', 'php.ini', '*.log')
robocopy $src $stage /E /NFL /NDL /NJH /NP /XD ($xd | % { Join-Path $src $_ }) /XF $xf | Out-Null

# keep the empty runtime folders Laravel needs
foreach ($d in 'storage\logs', 'storage\framework\cache', 'storage\framework\sessions', 'storage\framework\views') {
    New-Item -ItemType Directory -Force (Join-Path $stage $d) | Out-Null
}
Copy-Item (Join-Path $PSScriptRoot '.env.production.example') (Join-Path $stage '.env.example') -Force

if (Test-Path $out) { Remove-Item $out }
tar -a -cf $out -C $stage .
"{0:N0} MB -> {1}" -f ((Get-Item $out).Length / 1MB), $out
