![test](https://github.com/Kryszak/cyferki-watcher-bot/actions/workflows/github-actions.yml/badge.svg)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/72c866122f724b63a756c6c59cd0d879)](https://www.codacy.com/gh/Kryszak/cyferki-watcher-bot/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=Kryszak/cyferki-watcher-bot&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/Kryszak/cyferki-watcher-bot/branch/master/graph/badge.svg)](https://codecov.io/gh/Kryszak/cyferki-watcher-bot)

# cyferki-watcher-bot
Discord bot guarding rules of game "cyferki" in given channel

## Rules
Game rules can be found in [Rules](./Rules.md)

## Deployment
[Heroku](https://dashboard.heroku.com/apps/cyferki-watcher-bot)

## Required bot user permissions
-  Manage Roles :warning: Bot's role must be higher than any role that it sets for this feature to work ⚠️
-  Read Messages/View Channels
-  Send Messages
-  Manage Messages

## local dev config
### Config
In main project directory create `.env` file with following contents:
```bash
CLIENT_TOKEN=<bot's token>
BOT_WRONG_NUMBER_MESSAGE=<name of channel to watch>
BOT_ERROR_MESSAGE=<Content of message sent, when user posts wrong number, e.g. '${author} learn learn to count'>
BOT_WRONG_MESSAGE_FORMAT=<Content of message sent, when user posts message in wrong format, 
e.g. '${author} read game rules - message was not correct'>
BOT_RANK_WON_MESSAGE=<Content of message sent, when user posts message with number winning role e.g. '${author}, congratulations on winning rank ${role}!',>
BOT_GAME_OVER_MESSAGE=<Content of message sent on last number, e.g. 'Game over! Thanks for playing'>
RANKS=<JSON with number - rankId entries, e.g. {"10": "973271221112291409", "15": "973282436047839262"}> 
GAMEOVER_NUMBER=<Number, on which game will end>
```
### Config placeholders
-  `{author}` will be substituted with mention to message's author
-  `${role}` will be substituted with mention to won role

### Run project
```bash
npm run watch # launch locally and restart on code change
```

### Run tests
```bash
npm run test
```

## Possible new features
-  Block editing messages
