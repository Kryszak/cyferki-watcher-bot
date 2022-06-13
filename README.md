![test](https://github.com/Kryszak/cyferki-watcher-bot/actions/workflows/github-actions.yml/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/Kryszak/cyferki-watcher-bot/badge.svg)]

# cyferki-watcher-bot
Discord bot guarding rules of game "cyferki" in given channel

## Deployment
[Heroku](https://dashboard.heroku.com/apps/cyferki-watcher-bot)

## Required bot user permissions
- Manage Roles :warning: Bot's role must be higher than any role that it sets for this feature to work ⚠️
- Read Messages/View Channels
- Send Messages
- Manage Messages

## local dev config
### Config
In main project directory create `.env` file with following contents:
```
CLIENT_TOKEN=<bot's token>
WATCHED_CHANNEL=<name of channel to watch>
BOT_ERROR_MESSAGE=<Content of message sent, when user posts wrong number, 
e.g. 'Please learn to count'>
BOT_WRONG_MESSAGE_FORMAT=<Content of message sent, when user posts message in wrong format, 
e.g. 'Read game rules - message was not correct'>
BOT_RANK_WON_MESSAGE=<Content of message sent, when user posts message with number winning role e.g. 'congratulations on winning rank',>
BOT_GAME_OVER_MESSAGE=<Content of message sent on last number, e.g. 'Gmae over! Thanks for playing'>
RANKS=<JSON with number - rankId entries, e.g. {"10": "973271221112291409", "15": "973282436047839262"}> 
GAMEOVER_NUMBER=<Number, on which game will end>
```

### Run project
```
npm run watch-ts # Run auto rebuilding of changed files
npm run watch-node # Run auto restart on code change
```

### Run tests
```npm run test```

## Possible new features
- Block editing messages
