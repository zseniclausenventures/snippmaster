# Snippmaster

Lokal transkribering med talerskille og videoklipping for Mac (Apple Silicon) og Windows.
Eies av OhJoy Ventures AS og utvikles under Ezerkoesz Ventures™.

## Hva appen gjør

- Transkriberer video lokalt: norsk (NB-Whisper), engelsk og ungarsk (Whisper large-v3), linjer på maks 4 sekunder.
- Skiller talere med pyannote community-1.
- Videospiller med tidslinje: marker start og slutt, legg klipp i en kø, lag alle klippene i full kvalitet.
- Kan også brukes uten transkribering, rett i spilleren.
- Alt kjører på maskinen. Ingenting sendes til skyen.

## Installasjon for brukere

1. Last ned `Snippmaster-...-mac-arm64.dmg` (Mac) eller `Snippmaster-Setup-....exe` (Windows) fra Releases.
2. Start appen og trykk **Installer**. Appen henter selv uv (Python), ffmpeg og modellbibliotekene til `~/.klippverk`. Krever ikke administratortilgang.
3. For talerskille: lag en gratis Hugging Face-konto, godta vilkårene på `pyannote/speaker-diarization-community-1` og lim inn en lesenøkkel i appen.

## Utvikling

```
npm ci
npm start          # bygger renderer/ fra ui/snippmaster.html og starter appen
npm run dist:mac   # lager dmg i dist/
npm run dist:win   # lager exe i dist/
```

`ui/snippmaster.html` er samme fil som Claude-artefakten. All logikk for oppsett, transkribering
(Python-worker), forhåndsvisning og klipp ligger der. `src/preload.js` gir den samme
maskin-API-et som Claude-appen (`claude.use("desktop")`).

## Bygging og signering

GitHub Actions (`.github/workflows/build.yml`) bygger dmg og exe ved tag `v*`, eller manuelt.
Mac signeres og notariseres når disse secrets finnes:

| Secret | Innhold |
|---|---|
| `MAC_CERT_P12_BASE64` | Developer ID Application-sertifikat (.p12), base64 |
| `MAC_CERT_PASSWORD` | Passordet til .p12-filen |
| `APPLE_ID` | Apple-ID-e-posten |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-spesifikt passord fra appleid.apple.com |
| `APPLE_TEAM_ID` | Team ID fra developer.apple.com |

Windows bygges usignert til Microsoft Artifact Signing legges til.

## Lisens

MIT. Se [LICENSE](LICENSE).

## Installer på Windows

Åpne PowerShell (ikke administrator) og kjør:

```powershell
irm https://raw.githubusercontent.com/zseniclausenventures/snippmaster/main/scripts/install-windows.ps1 | iex
```

Samme kommando oppdaterer til nyeste versjon.
