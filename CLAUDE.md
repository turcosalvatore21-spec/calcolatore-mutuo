# calcolatore-mutuo

## Cosa fa

Calcolatore di mutuo online (metodo di ammortamento alla francese, rate costanti). Permette di simulare mutuo a tasso fisso e variabile, confrontare rate su diverse durate, generare un piano di ammortamento ed esportare un'analisi in PDF. Rivolto a privati che devono valutare l'acquisto di una casa e vogliono farsi un'idea di rata, interessi totali e TAEG indicativo prima di rivolgersi a un istituto di credito.

Non è consulenza finanziaria: il footer richiama sempre il D.Lgs. 58/1998 (TUF) e invita a rivolgersi a un istituto di credito autorizzato per un'offerta vincolante.

## Stack

- **Vite + React** (React 19), single-page app, nessun router — tutto vive in [src/App.jsx](src/App.jsx)
- Deploy su **Vercel**, progetto collegato via `.vercel/` (non versionato)
- Deploy in produzione: `npm run build` per verificare che compili, poi `npx vercel --prod --yes`
- Nessun backend: calcoli e generazione PDF (via `window.print`/HTML) sono tutti lato client

## Stile visivo

Tutto lo styling è inline (`style={{...}}`), niente CSS module o styled-components. Rispettare questa convenzione anche nelle modifiche.

Palette definita nell'oggetto `C` in [src/App.jsx:164](src/App.jsx:164):

```js
const C = {
  bg:"#0d1117", surface:"#131920", border:"#1e2d3d", borderLight:"#1a2840",
  text:"#e2e8f0", muted:"#4a6580", accent:"#0ea5e9", accentDim:"#0ea5e910",
  green:"#22c55e", red:"#ef4444", amber:"#f59e0b",
  font:"'Plus Jakarta Sans', system-ui, sans-serif",
  mono:"'IBM Plex Mono', monospace",
};
```

- Tema scuro (`bg` quasi nero, `text` chiaro), accento azzurro (`accent`)
- **Font sans** (`C.font`, Plus Jakarta Sans) per titoli e testo corrente
- **Font mono** (`C.mono`, IBM Plex Mono) per numeri, label, badge, tabelle — quasi tutto ciò che è dato/valore usa il mono, spesso in maiuscolo con `letterSpacing` largo (`0.08em`–`0.15em`) e font-size piccoli (`0.58rem`–`0.75rem`)
- Componenti riutilizzabili da preferire: `Card`, `Label`, `AdSlot` — non introdurre nuovi pattern di layout senza necessità

## Altri tool del portfolio (cross-link nel footer)

Nel footer di ogni sito del portfolio va sempre mantenuto il link incrociato agli altri tool. Elenco aggiornato:

- [Calcolatore Regime Forfettario](https://calcolatore-forfettario-eight.vercel.app)
- [Calcolatore Margini Negozio](https://margine-negozio.vercel.app)
- [Calcolatore Costo Dipendente](https://costo-dipendente.vercel.app)
- Calcolatore Mutuo (questo sito)

Quando si crea un nuovo tool nel portfolio, aggiungerlo al footer di **tutti** gli altri (non solo di se stesso), mantenendo lo stesso stile del blocco "Altri strumenti gratuiti" già presente in [src/App.jsx:603](src/App.jsx:603).

## Prodotto da promuovere

Link al template Gumroad da promuovere (quando previsto, es. in footer o call-to-action): https://salvoturco.gumroad.com/l/viejex

## Regola sui contatti

Niente form di contatto né promesse di risposta diretta ("ti rispondiamo entro X ore", ecc.) da nessuna parte nel sito. Se esiste una sezione contatti, deve contenere **solo** un'email di riferimento, senza form né SLA di risposta impliciti o espliciti.
