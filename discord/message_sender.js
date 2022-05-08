const logger = require("loglevel");
require('dotenv').config();

const WRONG_INCREMENT_MESSAGE = process.env.BOT_WRONG_NUMBER_MESSAGE;
const WRONG_MESSAGE_CONTENT = process.env.BOT_WRONG_MESSAGE_FORMAT;

function notifyWrongNumberProvided(channel, author) {
    channel.send(`<@${author}> ${WRONG_INCREMENT_MESSAGE}`);
}

function notifyWrongMessageFormat(channel, author) {
    channel.send(`<@${author}> ${WRONG_MESSAGE_CONTENT}`);
}

function deleteMessage(message) {
    message.delete()
        .then(() => logger.log("Successfully removed message: %o", message.content))
        .catch(error => logger.error("Error while removing message: %o", error))
}

module.exports = {
    notifyWrongNumberProvided: notifyWrongNumberProvided,
    notifyWrongMessageFormat: notifyWrongMessageFormat,
    deleteMessage: deleteMessage
}