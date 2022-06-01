require('dotenv').config();

function getClientToken() {
  return process.env.CLIENT_TOKEN;
}

function getWatchedChannel() {
  return process.env.WATCHED_CHANNEL;
}

function getRanks() {
  return JSON.parse(process.env.RANKS);
}

function getGameoverNumber() {
  return parseInt(process.env.GAMEOVER_NUMBER);
}

function getReadMessagesCount() {
  return parseInt(process.env.MESSAGE_READ_COUNT) || 20;
}

function getWrongIncrementMessage() {
  return process.env.BOT_WRONG_NUMBER_MESSAGE;
}

function getWrongMessageContent() {
  return process.env.BOT_WRONG_MESSAGE_FORMAT;
}

function getRankWonMessageContent() {
  return process.env.BOT_RANK_WON_MESSAGE;
}

function getGameOverMessageContent() {
  return process.env.BOT_GAME_OVER_MESSAGE;
}

module.exports = {
  getClientToken: getClientToken,
  getWatchedChannel: getWatchedChannel,
  getRanks: getRanks,
  getGameoverNumber: getGameoverNumber,
  getReadMessagesCount: getReadMessagesCount,
  getWrongIncrementMessage: getWrongIncrementMessage,
  getWrongMessageContent: getWrongMessageContent,
  getRankWonMessageContent: getRankWonMessageContent,
  getGameOverMessageContent: getGameOverMessageContent,
};
