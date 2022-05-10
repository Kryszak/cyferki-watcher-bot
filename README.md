# cyferki-watcher-bot
Discord bot guarding rules of game "cyferki" in given channel

## Required bot user permissions
- Manage Roles
- Read Messages/View Channels
- Send Messages
- Manage Messages

## local dev config
In main project directory create `.env` file with following contents:
```
CLIENT_TOKEN=<token_bota>
WATCHED_CHANNEL=<nazwa kanału z grą>
BOT_ERROR_MESSAGE=<Wiadomość wysyłana przez bota, gdy ktoś pomyli liczby, 
np 'Co ty odkurwiasz, weź się naucz liczyć'>
BOT_WRONG_MESSAGE_FORMAT=<Wiadomość wysyłana, gdy gracz wprowadzi niepopranwą
wiadomość, np 'Przeczytaj dokładnie regulamin gry - wiadomość nie była poprawna'>
BOT_RANK_WON_MESSAGE=<Wiadomość wysyłana po wygraniu roli, np gratulacje za wygranie rangi>
BOT_GAME_OVER_MESSAGE=<Wiadomość wysyłana na koniec gry, np Koniec gry! Dziękuję wszystkim za uczestnictwo>
RANKS=<JSON with number - rankId entries, np {"10": "973271221112291409", "15": "973282436047839262"}> 
GAMEOVER_NUMBER=<numerek kończący grę>
```