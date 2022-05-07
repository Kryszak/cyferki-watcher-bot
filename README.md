# cyferki-watcher-bot

Bot discordowy służący do pilnowania, czy na kanale z grą cyferki podawane są poprawnie kolejne wartości.

## konfiguracja

W katalogu z skryptem bota index.js należy umieścić plik konfiguracyjny `.env`
w którym należy umieścić następujące wpisy:

```
LOG_LEVEL=info
CLIENT_TOKEN=<token_bota>
WATCHED_CHANNEL=<nazwa kanału z grą>
MESSAGE_READ_COUNT=5
BOT_ERROR_MESSAGE=<Wiadomość wysyłana przez bota, gdy ktoś pomyli liczby, 
np 'Co ty odkurwiasz, weź się naucz liczyć'>
BOT_WRONG_MESSAGE_FORMAT=<Wiadomość wysyłana, gdy gracz wprowadzi niepopranwą
wiadomość, np 'Przeczytaj dokładnie regulamin gry - wiadomość nie była poprawna'>
```