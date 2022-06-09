import 'dotenv/config'

export default class Globals {
  getClientToken(): string {
    return process.env.CLIENT_TOKEN;
  }

  getWatchedChannel() {
    return process.env.WATCHED_CHANNEL;
  }

  getRanks() {
    return JSON.parse(process.env.RANKS);
  }

  getGameoverNumber() {
    return parseInt(process.env.GAMEOVER_NUMBER);
  }

  getReadMessagesCount() {
    return parseInt(process.env.MESSAGE_READ_COUNT) || 20;
  }

  getWrongIncrementMessage() {
    return process.env.BOT_WRONG_NUMBER_MESSAGE;
  }

  getWrongMessageContent() {
    return process.env.BOT_WRONG_MESSAGE_FORMAT;
  }

  getRankWonMessageContent() {
    return process.env.BOT_RANK_WON_MESSAGE;
  }

  getGameOverMessageContent() {
    return process.env.BOT_GAME_OVER_MESSAGE;
  }

  getLogLevel(): string {
    return process.env.LOG_LEVEL || 'info';
  }
}