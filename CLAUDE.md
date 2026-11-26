# CLAUDE.md - Snippmaster

## Arkitektur
- Electron-skall: `src/main.js` (IPC for fs, exec, shell, varsler, os-info) og `src/preload.js` (eksponerer `window.snippDesktop`, etterligner Claude-appens desktop-API).
- Grensesnitt: `ui/snippmaster.html` er eneste kilde. `scripts/build-ui.mjs` lager `renderer/index.html` med en liten shim (`window.claude.use("desktop")`). `renderer/` er generert og ignoreres i git.
- Samme HTML publiseres også som Claude-artefakt (slug 72de055f-6d87-43dd-90ea-f39b29435641). Hold dem like.
- Python-worker (innebygd i HTML som `<script type="text/plain" id="workerPy">`) skrives til `~/.klippverk/worker.py` og kjøres som bakgrunnsjobb: launchd på Mac, Oppgaveplanlegger + `conhost --headless` på Windows. Kommandoer: `check`, `transcribe`, `batch` (klippkø), `proxy` (forhåndsvisning i segmenter).
- Data: `~/.klippverk/` (venv, bin, jobs/<id>/, settings.json, hf_token). Arbeidsmappe: `~/Movies/Snippmaster` eller `%USERPROFILE%\Videos\Snippmaster`.
- Modeller: Mac MLX (aalst/nb-whisper-large-mlx, mlx-community/whisper-large-v3[-turbo]); Windows faster-whisper på CUDA (NB-Whisper konverteres til CT2 ved første bruk). Talere: pyannote/speaker-diarization-community-1.
- ffmpeg: systemets, ellers static-ffmpeg (pip). uv installeres i `~/.klippverk/bin` med Astrals installasjonsskript.

## Konvensjoner
- Norsk bokmål i grensesnitt og kommentarer. Ingen emojier.
- Bakgrunnsjobber må overleve at appen lukkes. Ikke bruk childProcess.spawn for lange jobber.
- Beskyttede mapper på Mac (Downloads, Desktop, Documents): appen kloner videoen inn i jobbmappen før bakgrunnsjobben leser den.

## Vedlikehold
- Update CLAUDE.md if data models, new features, or architecture changed.
