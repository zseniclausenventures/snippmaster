# CLAUDE.md - Snippmaster

## Arkitektur
- Electron-skall: `src/main.js` (IPC for fs, exec, shell, varsler, os-info; fs-feil returneres som `{err}` og kastes på nytt i preload, så manglende valgfrie filer ikke logges som feil) og `src/preload.js` (eksponerer `window.snippDesktop`, etterligner Claude-appens desktop-API).
- Grensesnitt: `ui/snippmaster.html` er eneste kilde. `scripts/build-ui.mjs` lager `renderer/index.html` med en liten shim (`window.claude.use("desktop")`). `renderer/` er generert og ignoreres i git.
- Samme HTML publiseres også som Claude-artefakt (slug 72de055f-6d87-43dd-90ea-f39b29435641). Hold dem like.
- Python-worker (innebygd i HTML som `<script type="text/plain" id="workerPy">`) skrives til `~/.klippverk/worker.py` og kjøres som bakgrunnsjobb: launchd på Mac, Oppgaveplanlegger + `conhost --headless` på Windows. Kommandoer: `check`, `transcribe`, `batch` (klippkø), `proxy` (forhåndsvisning i segmenter).
- Data: `~/.klippverk/` (venv, bin, jobs/<id>/, settings.json, hf_token). Hugging Face-nøkkel leses fra env `HF_TOKEN` eller `~/.klippverk/hf_token`, aldri fra repoet. Arbeidsmappe: `~/Movies/Snippmaster` eller `%USERPROFILE%\Videos\Snippmaster`.
- Modeller: Mac MLX (aalst/nb-whisper-large-mlx, mlx-community/whisper-large-v3[-turbo]); Windows faster-whisper på CUDA (NB-Whisper konverteres til CT2 ved første bruk). Talere: pyannote/speaker-diarization-community-1.
- ffmpeg: systemets, ellers static-ffmpeg (pip). uv installeres i `~/.klippverk/bin` med Astrals installasjonsskript.

- Jobber slettes med Slett-knappen i jobbvisningen (to klikk). Bare `jobs/<id>/` slettes; resultatmappen beholdes. Jobber som transkriberer kan ikke slettes.
- Windows-transkribering sender lyden som numpy-array til faster-whisper (ikke filsti), for å unngå PyAV-API-endringer.
- Klipp: valgfritt støyfilter (Av/Lett/Kraftig, ffmpeg afftdn) og «Løft svak tale» (dynaudnorm). Filterkjede i `clip_audio_filter`: highpass, støyfilter, volumløft, limiter. Støyfilter brukes aldri før transkribering.
- Språk: `LANGS_TOP` (no/en/hu) og `LANGS_MORE` (88 andre Whisper-koder) i grensesnittet. Ukjente språk bruker `ANY_MLX`/`ANY_CT2` (large-v3). Egne modeller per språk lagres i `settings.models` og `~/.klippverk/models.json`, og prøves først (`custom_model`). Windows: `ct2_path` bruker repo med `model.bin` direkte, ellers `convert_ct2` (TransformersConverter) én gang til `~/.klippverk/models/<slug>-ct2`.
- Hjelp er et sidepanel til høyre (`openHelp(section)`/`closeHelp()`, innhold i `helpHtml()`) som kan stå åpent mens appen brukes. Hold innholdet i takt med README.
- Innstillinger har Tilbake-knapp (`#backBtn`) som går til forrige jobb eller Ny video (`settingsPrev`).

- Personvern: worker setter `PYANNOTE_METRICS_ENABLED=0`, `HF_HUB_DISABLE_TELEMETRY=1` og `DO_NOT_TRACK=1`. Electron har `spellcheck: false` (ellers laster Chromium ordbøker fra Google). Nettbruk kun for nedlasting av verktøy og modeller. Ikke legg til statistikk, opplasting eller eksterne ressurser (skrifter, CDN). Skrifter er systemskrifter.

## Utgivelse
- Øk `version` i package.json og push til main. GitHub Actions bygger Mac (signert og notarisert) og Windows, og lager release `v<versjon>` automatisk.
- Installasjon på Windows: `irm https://raw.githubusercontent.com/zseniclausenventures/snippmaster/main/scripts/install-windows.ps1 | iex`

## Konvensjoner
- Norsk bokmål i grensesnitt og kommentarer. Ingen emojier.
- Bakgrunnsjobber må overleve at appen lukkes. Ikke bruk childProcess.spawn for lange jobber.
- Beskyttede mapper på Mac (Downloads, Desktop, Documents): appen kloner videoen inn i jobbmappen før bakgrunnsjobben leser den.

## Vedlikehold
- Update CLAUDE.md if data models, new features, or architecture changed.

## Offentlig repo

Repoet er offentlig med MIT-lisens. Ingen nøkler, passord, sertifikater eller personlige stier skal inn i koden. Signeringshemmeligheter ligger kun i GitHub Secrets.
