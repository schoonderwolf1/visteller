# Visteller — notities voor Claude

Visteller is een vistel-/vislogboek-PWA voor een kind, gebouwd samen met de
ouder (eigenaar van de repo) in korte, iteratieve rondes. Dit bestand legt de
werkafspraken en architectuurkeuzes vast zodat een latere sessie niet opnieuw
hoeft te ontdekken hoe dit project werkt.

## Techniek in het kort

- **Geen framework, geen build-stap.** Vanilla JS/HTML/CSS. `index.html` laadt
  `fish.js` (data + SVG-tekeningen + kleine helpers), `db.js` (IndexedDB-laag)
  en `app.js` (state, rendering, event handling) als gewone `<script>`-tags.
- **State/rendering in `app.js`**: één `state`-object, `render()` zet steeds de
  hele `#app`-inhoud opnieuw neer via template strings (geen virtual DOM).
  Events lopen via delegatie op `document` met `data-click` / `data-change` /
  `data-input`-attributen en een `registry` van id → functie die bij elke
  render opnieuw wordt opgebouwd (zie `on()` in `app.js`).
- **Opslag**: alles (vangsten, visplekken, vissers, foto's) staat lokaal in
  IndexedDB (`db.js`), niet in localStorage — dat laatste is te klein/synchroon
  voor foto's. Er is geen backend en geen account.
- **PWA**: `manifest.webmanifest` + `sw.js` maken de app installeerbaar en
  offline werkend. `sw.js` cachet een vaste `SHELL`-lijst van bestanden.
  **Belangrijk:** elk nieuw bestand dat de app nodig heeft (een foto, een
  audiobestand, een nieuw script) moet aan die `SHELL`-lijst worden
  toegevoegd, én de `CACHE`-versienaam (`visteller-vN`) moet omhoog, anders
  ziet een gebruiker met een geïnstalleerde PWA het nooit.
- **Vissoort-media**: `/photos/<slug>.webp` (foto per soort, ~25-45KB,
  gegenereerd met `cwebp`) en `/audio/<slug>.mp3` (voorgelezen soortfeitjes,
  door de gebruiker gegenereerd via een TTS-tool, geen apparaat-stem). Slugs
  zijn de lowercase soortnaam (`baars`, `snoekbaars`, ...). Zie `fish.js` voor
  de `foto`/`audio`-velden per soort. Voeg je een nieuwe soort toe: lever ook
  een foto en audiobestand met exact dezelfde naamgeving, en zet ze in de
  `SHELL`-lijst van `sw.js`.
- **Voorlezen** (`speelVisUit()` in `app.js`): speelt eerst het opgenomen
  mp3-bestand van de soort af; alleen als dat ontbreekt of niet wil afspelen
  valt de app terug op de `speechSynthesis`-stem van het toestel (die klinkt
  op veel Android-telefoons elektronisch/hortend — vandaar de voorkeur voor
  echte audio).

## Versienummer

`APP_VERSIE` bovenaan `app.js` wordt getoond onderaan het Vangen-scherm
("Visteller vN") zodat de gebruiker kan zien of zijn telefoon de nieuwste
versie heeft opgehaald. **Dit nummer moet het nummer van de pull request zijn
waarin de wijziging wordt gemerged.** Check dus vóór het aanmaken van een PR
wat het eerstvolgende PR-nummer op deze repo wordt (bijv. via
`list_pull_requests`, aflopend gesorteerd) en zet `APP_VERSIE` daarop, vóórdat
je commit. Klopt het na het aanmaken van de PR toch niet (iemand anders maakte
tussentijds een PR), corrigeer dan met een volgende commit/PR.

## Git- en PR-werkwijze

- Werk op de branch die de sessie-instructies aangeven (op het moment van
  schrijven: `claude/pwa-fishing-log-android-3vmy0z`).
- **Als de vorige PR op die branch al gemerged is** (zeer gebruikelijk hier —
  de gebruiker merget snel): begin de branch opnieuw vanaf de laatste `main`
  (`git fetch origin main && git checkout -B <branch> origin/main`) vóór je
  verder werkt. Nooit doorbouwen op een branch waarvan de historie al in
  `main` zit.
- **Sta zelf toe dat deze/een latere Claude-sessie PR's direct naar `main`
  merget** zodra ze klaar, getest en `mergeable_state: clean` zijn — de
  gebruiker heeft hiervoor expliciet doorlopende toestemming gegeven en wil
  niet elke keer apart om een merge gevraagd worden. Maak nog steeds altijd
  een PR aan (voor de zichtbare historie/CI), maar hoeft niet op een reactie
  van de gebruiker te wachten voor het mergen.
- Zet elke wijziging in een eigen kleine PR met een duidelijke Nederlandse
  titel en beschrijving (## Samenvatting / ## Testplan). Zie de PR-historie
  van deze repo voor de gehanteerde toon en structuur.
- Test vóór het pushen altijd met `node --check` op elk gewijzigd
  JS-bestand, en waar zinvol met een Playwright-smoke-test tegen een lokale
  `python3 -m http.server` (zie eerdere PR's voor voorbeelden) — een headless
  browser heeft geen TTS-stemmen en geen echte GPS, dus mock die met
  `context.geolocation`/`permissions` en verwacht geen écht geluid.

## Taal en toon

Alle UI-teksten, code-comments, commitberichten en PR-beschrijvingen zijn in
het Nederlands (de doelgroep is een Nederlands kind en haar vader). Comments
in de code alleen bij niet-voor-de-hand-liggende keuzes (bekende
browser-bugs, workarounds, etc.), niet om te herhalen wat de code al zegt.

## Bekende afwegingen / niet opnieuw uitvinden

- Foto- en audio-uploadvelden gebruiken bewust **geen** `capture="environment"`
  op de `<input type="file">`, zodat Android zowel camera als galerij als
  keuze toont (met `capture` wordt de camera afgedwongen en verdwijnt de
  galerij-optie op veel toestellen).
- GPS-matching van visplekken gebruikt een vaste straal van 80 meter
  (`RADIUS` in `app.js`) — binnen die afstand wordt een vangst aan een
  bestaande plek gekoppeld in plaats van een nieuwe plek aan te maken.
- Tekstvelden binnen de vangst-sheet (nieuwe plek-naam) muteren `state`
  rechtstreeks zonder `render()` aan te roepen bij elke toets — een volledige
  her-render bij elke toetsaanslag kan een knop vervangen net terwijl een tik
  daarop bezig is (focus-wissel-race), waardoor de tik verloren gaat.
