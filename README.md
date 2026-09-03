# Visteller

Een visteller / vislogboek als installeerbare PWA voor Android. Houd bij welke vissen je hebt gevangen, met lengte, visplek en foto's — alles lokaal op het toestel opgeslagen, zonder account of server.

## Gebruiken

Open de gehoste GitHub Pages-URL in Chrome op Android en kies "Toevoegen aan startscherm". De app werkt daarna ook zonder internetverbinding.

## Lokaal ontwikkelen

Dit is een framework-loze statische app (geen build-stap nodig). Serveer de map met een lokale webserver, bijvoorbeeld:

```
npx serve .
```

en open de getoonde localhost-URL. Een service worker vereist HTTPS of localhost.

## Techniek

- `index.html` / `app.js` / `fish.js` / `db.js` — de app zelf, in vanilla JavaScript.
- Data (vangsten, visplekken, wie er vist) wordt lokaal opgeslagen in IndexedDB, inclusief foto's (verkleind voordat ze bewaard worden).
- `sw.js` + `manifest.webmanifest` maken de app een installeerbare, offline werkende PWA.
- Een "Back-up maken / terugzetten" knop in de Verzameling-tab exporteert en importeert alle data als JSON-bestand.

## Hosting

Deze repo bevat een GitHub Actions workflow (`.github/workflows/deploy.yml`) die bij elke push naar `main` automatisch naar GitHub Pages publiceert. Eenmalig instellen: **Settings → Pages → Source: GitHub Actions**.
