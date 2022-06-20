![test](https://github.com/Kryszak/cyferki-watcher-bot/actions/workflows/github-actions.yml/badge.svg)

# cyferki-watcher-bot
Discord bot guarding rules of game "cyferki" in given channel

## Rules
Game rules can be found in [Rules](./game_rules.md)

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
- `{author}` will be substituted with mention to message's author
- `${role}` will be substituted with mention to won role


### Run project
```
npm run watch # launch locally and restart on code change
```

### Run tests
```npm run test```

## Possible new features
- Block editing messages
