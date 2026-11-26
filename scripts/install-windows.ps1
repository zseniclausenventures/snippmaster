& {
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$repo = 'zseniclausenventures/snippmaster'
$work = Join-Path $env:TEMP 'snippmaster-install'
Write-Host ''
Write-Host '== Snippmaster: installasjon og oppdatering for Windows ==' -ForegroundColor Cyan
try {
  # 1. Sjekk maskinen
  if (-not [Environment]::Is64BitOperatingSystem) { throw 'Snippmaster krever 64-bit Windows.' }
  $free = [math]::Floor((Get-PSDrive C).Free / 1GB)
  Write-Host "[1/5] Ledig plass på C: $free GB"
  if ($free -lt 15) { throw "For lite plass: $free GB ledig, trenger minst 15 GB." }
  if (Get-Command nvidia-smi -ErrorAction SilentlyContinue) {
    Write-Host ('      Skjermkort: ' + ((nvidia-smi --query-gpu=name,driver_version --format=csv,noheader) -join ', '))
  } else {
    Write-Host '      Fant ikke NVIDIA-driver. Transkribering går da på CPU og blir treg.' -ForegroundColor Yellow
  }

  # 2. Hugging Face-nøkkel (talerseparasjon), spørres bare første gang
  $kv = Join-Path $env:USERPROFILE '.klippverk'
  $tf = Join-Path $kv 'hf_token'
  if (Test-Path $tf) {
    Write-Host '[2/5] Hugging Face-nøkkel finnes allerede.'
  } else {
    $s = Read-Host '[2/5] Lim inn Hugging Face-nøkkelen (hf_...) og trykk Enter. Den vises ikke. Bare Enter = hopp over' -AsSecureString
    $t = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)).Trim()
    if ($t) {
      New-Item -ItemType Directory -Force -Path $kv | Out-Null
      [IO.File]::WriteAllText($tf, $t)
      Write-Host '      Nøkkelen er lagret.'
    } else {
      Write-Host '      Hoppet over. Talerseparasjon virker ikke før nøkkelen er lagt inn i appen.' -ForegroundColor Yellow
    }
  }

  # 3. Finn nyeste versjon
  $rel = (Invoke-RestMethod "https://api.github.com/repos/$repo/releases" -UseBasicParsing) | Select-Object -First 1
  $asset = $rel.assets | Where-Object { $_.name -like 'Snippmaster-Setup-*.exe' } | Select-Object -First 1
  if (-not $asset) { throw 'Fant ikke Windows-installasjonen i nyeste release.' }
  Write-Host ("[3/5] Laster ned Snippmaster " + $rel.tag_name + " (" + [math]::Round($asset.size / 1MB) + " MB) ...")
  Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path $work | Out-Null
  $setup = Join-Path $work $asset.name
  Invoke-WebRequest $asset.browser_download_url -OutFile $setup -UseBasicParsing
  Unblock-File $setup

  # 4. Installer stille
  Write-Host ("[4/5] Installerer " + $rel.tag_name + " ...")
  Get-Process Snippmaster -ErrorAction SilentlyContinue | Stop-Process -Force
  Start-Process $setup -ArgumentList '/S' -Wait
  $app = Get-ChildItem (Join-Path $env:LOCALAPPDATA 'Programs') -Recurse -Depth 2 -Filter 'Snippmaster.exe' -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
  if (-not $app) { throw 'Fant ikke Snippmaster etter installasjonen.' }

  # 5. Start appen
  Write-Host '[5/5] Starter Snippmaster ...'
  Start-Process $app
  Write-Host ''
  Write-Host ("FERDIG: Snippmaster " + $rel.tag_name + " er installert og startet.") -ForegroundColor Green
  Write-Host 'Første gang laster appen ned talemodellene selv. La den jobbe, det kan ta 15-40 minutter.'
} catch {
  Write-Host ''
  Write-Host ('STOPPET: ' + $_.Exception.Message) -ForegroundColor Red
  Write-Host 'Ta et skjermbilde av dette vinduet og send det til Claude.'
} finally {
  Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
}
}
