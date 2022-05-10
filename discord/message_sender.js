const logger = require("loglevel");
require('dotenv').config();

const WRONG_INCREMENT_MESSAGE = process.env.BOT_WRONG_NUMBER_MESSAGE;
const WRONG_MESSAGE_CONTENT = process.env.BOT_WRONG_MESSAGE_FORMAT;
const RANK_WON_MESSAGE_CONTENT = process.env.BOT_RANK_WON_MESSAGE;
const GAME_OVER_MESSAGE_CONTENT = process.env.BOT_GAME_OVER_MESSAGE;

function notifyWrongNumberProvided(channel, author) {
    channel.send(`<@${author}> ${WRONG_INCREMENT_MESSAGE}`);
}

function notifyWrongMessageFormat(channel, author) {
    channel.send(`<@${author}> ${WRONG_MESSAGE_CONTENT}`);
}

function notifyPrizedNumber(channel, author, roleId) {
    channel.send(`<@${author}>, ${RANK_WON_MESSAGE_CONTENT} <@&${roleId}>!`);
}

function notifyGameOver(channel) {
    channel.send(GAME_OVER_MESSAGE_CONTENT)
}

function deleteMessage(message) {
    message.delete()
        .then(() => logger.info("Successfully removed message: %o", message.content))
        .catch(error => logger.error("Error while removing message: %o", error))
}

module.exports = {
    notifyWrongNumberProvided: notifyWrongNumberProvided,
    notifyWrongMessageFormat: notifyWrongMessageFormat,
    notifyPrizedNumber: notifyPrizedNumber,
    notifyGameOver: notifyGameOver,
    deleteMessage: deleteMessage
}