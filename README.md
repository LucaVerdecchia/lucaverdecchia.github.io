# Scheda Palestra

Mini guida personale per la scheda in palestra, ottimizzata per mobile e pubblicata su GitHub Pages.

## Struttura

- `index.html` — Home con tipologie di allenamento e database esercizi
- `data/programs.json` — Programmi disponibili (es. Upper/Lower 4 Day)
- `programmi/upper-lower-4-day.html` — Giorni del programma
- `giorno1.html` — Giorno 1 (carica dati da `data/giorno1.json`)
- `data/exercises.json` — Database esercizi (nome, immagine, muscoli, note)
- `data/giorno1.json` — Ordine e serie/ripetizioni del Giorno 1
- `esercizi/` — Scheda individuale per ogni esercizio (es. `esercizi/bench-press.html`)
- `esercizi/index.html` — Catalogo di tutti gli esercizi

## Modificare gli esercizi

1. Aggiungi o modifica l'esercizio in `data/exercises.json` (con uno `slug` univoco)
2. Opzionale: aggiungi `"video"` — ID/URL YouTube oppure URL Vimeo (parte da 15s, muto)
3. Crea la pagina corrispondente in `esercizi/[slug].html` (copia da un file esistente)
3. Aggiorna `data/giorno1.json` per includere slug, serie e ripetizioni

## Firebase (storico pesi e ripetizioni)

L'app salva i log su **Firestore** dopo l'accesso con Google.

### Setup una tantum nella [Firebase Console](https://console.firebase.google.com)

1. **Authentication → Sign-in method** → abilita **Google**
2. **Authentication → Settings → Authorized domains** → verifica che ci sia `lucaverdecchia.github.io`
3. **Firestore Database** → crea database (modalità produzione)
4. **Firestore → Rules** → incolla il contenuto di `firestore.rules` e pubblica

### GitHub Pages

Imposta la branch `main` come sorgente in **Settings → Pages** del repository.

Il sito sarà su: `https://lucaverdecchia.github.io`
