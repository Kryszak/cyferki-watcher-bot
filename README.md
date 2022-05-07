# cyferki-watcher-bot
Discord bot guarding rules of game "cyferki" in given channel

## loca dev config
In main project directory create `.env` file with following contents:
```
CLIENT_TOKEN=<token_bota>
WATCHED_CHANNEL=<nazwa kanału z grą>
BOT_ERROR_MESSAGE=<Wiadomość wysyłana przez bota, gdy ktoś pomyli liczby, 
np 'Co ty odkurwiasz, weź się naucz liczyć'>
BOT_WRONG_MESSAGE_FORMAT=<Wiadomość wysyłana, gdy gracz wprowadzi niepopranwą
wiadomość, np 'Przeczytaj dokładnie regulamin gry - wiadomość nie była poprawna'>
```