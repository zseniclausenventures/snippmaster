# Snippmaster

Snippmaster gjør om videoer til tekst og klipper ut bitene du trenger, i full kvalitet. Alt skjer på din egen maskin. Ingenting lastes opp til skyen.

Appen finnes for Mac med Apple Silicon (M1 og nyere) og for Windows-PC. Den er laget av OhJoy Ventures AS under Ezerkoesz Ventures™.

## Hva appen gjør

- **Transkriberer video** på norsk, engelsk og ungarsk, med tidsstempel høyst fire sekunder fra hverandre.
- **Skiller talere**, slik at du ser hvem som sier hva. Du kan gi talerne navn.
- **Lager klipp** fra tidspunktene du velger, i samme kvalitet som originalen. Klippene får navn etter tidspunktet, for eksempel `intervju_01m24s-01m52s.mov`.
- **Løfter svak tale**, slik at lavmælte stemmer blir tydelige, både i transkriberingen og i klippene.
- **Fjerner bakgrunnsstøy** i klippene hvis du vil. Du velger Av, Lett eller Kraftig.
- **Har en videospiller med tidslinje**, der du markerer start og slutt for klipp. Den virker også uten transkribering.

| Språk | Modell |
|---|---|
| Norsk | NB-Whisper large fra Nasjonalbiblioteket |
| Engelsk | Whisper large-v3-turbo |
| Ungarsk | Whisper large-v3 |

## Installasjon

Du trenger 15 GB ledig plass og nettilgang første gang. Appen laster selv ned det den trenger, og du trenger ikke administratortilgang.

### Windows

1. Åpne PowerShell: trykk Windows-tasten, skriv `PowerShell` og trykk Enter.
2. Lim inn denne linjen og trykk Enter:

   ```powershell
   irm https://raw.githubusercontent.com/zseniclausenventures/snippmaster/main/scripts/install-windows.ps1 | iex
   ```

3. Lim inn Hugging Face-nøkkelen når du blir spurt (se under).

Skriptet installerer og starter appen. Samme linje oppdaterer til nyeste versjon senere. Et NVIDIA-skjermkort gir full fart. Uten det går transkriberingen på prosessoren og tar lengre tid.

### Mac

1. Last ned `Snippmaster-...-mac-arm64.dmg` fra [nyeste versjon](https://github.com/zseniclausenventures/snippmaster/releases).
2. Åpne filen og dra Snippmaster over i **Applications**.
3. Start appen fra Applications. Appen er signert og godkjent av Apple, så den åpnes uten omveier.

### Hugging Face-nøkkel (for å skille talere)

Talerskillet bruker en åpen modell som krever en gratis nøkkel:

1. Lag en gratis konto på [huggingface.co](https://huggingface.co/join).
2. Åpne [pyannote/speaker-diarization-community-1](https://huggingface.co/pyannote/speaker-diarization-community-1) og godta vilkårene.
3. Gå til [Access Tokens](https://huggingface.co/settings/tokens), trykk **Create new token**, velg **Read** og kopier nøkkelen.
4. Lim den inn i appen (eller i installasjonsskriptet på Windows).

Uten nøkkel virker transkriberingen og klippingen, men alle linjene får samme taler.

### Første oppstart

Første gang laster appen ned Python, ffmpeg og talemodellene. Det tar 15–40 minutter avhengig av nettet. La maskinen stå på til oppsettet er ferdig. Første norske transkribering bruker i tillegg noen minutter på å gjøre klar den norske modellen. Senere starter alt med en gang.

## Slik bruker du appen

### 1. Velg video

Trykk **Ny video** og dra en video inn i vinduet, eller trykk **Finn video ...**. Videoer på opptil 4 GB går fint.

### 2. Transkriber, eller gå rett til spilleren

- Velg språk og trykk **Start transkribering**. Du ser fremdrift og omtrentlig tid igjen. Du kan lukke appen mens den jobber. Jobben fortsetter i bakgrunnen, og du får varsel når den er ferdig.
- Vil du bare klippe, trykk **Åpne i spilleren uten transkribering**. Du kan transkribere senere med **Transkriber denne videoen**.

### 3. Les og gi talerne navn

Teksten vises ved siden av videoen, med tidspunkt og farge for hver taler. Skriv navn i talerfeltene øverst, så oppdateres hele teksten. Bruk **Søk i teksten** for å finne et ord, og **Kopier tekst** for å lime teksten inn et annet sted.

Teksten lagres også automatisk i resultatmappen som `.txt` og som undertekstfil `.srt`.

### 4. Marker klipp

Du har tre måter å gjøre det på, og kan blande dem:

- **I teksten:** Klikk på linjen der klippet skal starte. Hold **Shift** og klikk på linjen der det skal slutte. Trykk **Legg til i listen**.
- **I spilleren:** Spill av eller flytt deg på tidslinjen. Trykk **Start her** og **Slutt her**, og deretter **Legg til klipp**.
- **Som liste:** Skriv eller lim inn tidspunkter i klipplisten, ett klipp per linje. Du kan gi klippet en tittel etter tidspunktene:

  ```
  1:24-1:52 Innledning
  3:10-3:45
  1:02:03-1:04:30 Avslutning
  ```

Hurtigtaster i spilleren:

| Tast | Gjør |
|---|---|
| Mellomrom | Spill av eller pause |
| Venstre / høyre pil | 2 sekunder tilbake eller frem (med Shift: 10 sekunder) |
| I | Start her |
| O | Slutt her |
| L | Legg klippet i listen |

### 5. Lag klippene

Velg innstillinger og trykk **Lag alle klipp**:

- **Kvalitet:** *Eksakt kutt* kutter nøyaktig der du har markert, og bildet blir visuelt likt originalen. *Tapsfri kopi* er raskest og endrer ingenting i bildet, men klippet kan starte et lite øyeblikk før markeringen.
- **Løft svak tale:** Jevner ut lyden, slik at svake partier blir tydelige. Slått på som standard.
- **Støyfilter:** *Av*, *Lett* eller *Kraftig*. Start med *Lett*. *Kraftig* fjerner mer, men kan gjøre stemmen litt metallisk. Filteret tar jevn støy som sus og vifter, ikke plutselige lyder.

Klippene havner i resultatmappen. Trykk **Resultatmappe** for å åpne den. Originalvideoen endres aldri.

### 6. Rydd

Åpne en jobb og trykk **Slett**, og deretter **Bekreft sletting**. Jobben forsvinner fra listen, men klipp og tekstfiler i resultatmappen beholdes.

### Innstillinger

Under **Innstillinger** velger du hvilken mappe videoene hentes fra, og hvor klipp og tekst lagres. Standard er `Movies/Snippmaster` på Mac og `Videos\Snippmaster` på Windows.

## Personvern

All lyd og video behandles lokalt. Appen henter bare programvare og modeller fra internett, aldri dine filer. Hugging Face-nøkkelen lagres i en fil i brukermappen din, `.klippverk/hf_token`.

## Feilsøking

- **Oppsettet stopper:** Sjekk at du har nett og 15 GB ledig, og trykk **Installer** igjen.
- **Alle linjene har samme taler:** Hugging Face-nøkkelen mangler, eller vilkårene for pyannote er ikke godtatt.
- **Transkriberingen er treg på Windows:** Oppdater NVIDIA-driveren med [NVIDIA-appen](https://www.nvidia.com/en-us/software/nvidia-app/).
- **Noe annet:** Lag en sak under [Issues](https://github.com/zseniclausenventures/snippmaster/issues) med skjermbilde av feilmeldingen.

---

## For utviklere

```
npm ci
npm start          # bygger renderer/ fra ui/snippmaster.html og starter appen
npm run dist:mac   # lager dmg i dist/
npm run dist:win   # lager exe i dist/
```

`ui/snippmaster.html` er hele appen: grensesnitt, oppsett og Python-worker for transkribering, forhåndsvisning og klipp. `src/main.js` og `src/preload.js` er et lite Electron-skall som gir siden tilgang til filer og kommandoer. Se `CLAUDE.md` for arkitektur.

### Utgivelse

Øk `version` i `package.json` og push til `main`. GitHub Actions bygger Mac (signert og notarisert) og Windows, og lager en ny release automatisk.

Mac signeres og notariseres når disse secrets finnes:

| Secret | Innhold |
|---|---|
| `MAC_CERT_P12_BASE64` | Developer ID Application-sertifikat (.p12), base64 |
| `MAC_CERT_PASSWORD` | Passordet til .p12-filen |
| `APPLE_ID` | Apple-ID-e-posten |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-spesifikt passord fra account.apple.com |
| `APPLE_TEAM_ID` | Team ID fra developer.apple.com |

Windows bygges foreløpig usignert.

## Lisens

MIT. Se [LICENSE](LICENSE).
