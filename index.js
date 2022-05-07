require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const logger = require('loglevel');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;
const READ_MESSAGES_COUNT = process.env.MESSAGE_READ_COUNT || 5;
const WRONG_INCREMENT_MESSAGE = process.env.BOT_WRONG_NUMBER_MESSAGE;
const WRONG_MESSAGE_CONTENT = process.env.BOT_WRONG_MESSAGE_FORMAT;

logger.setLevel(LOG_LEVEL);

function getChannelId(message) {
    return client.channels.cache.get(message.channelId);
}

function isSentToWatchedChannel(channel) {
    return channel.name === WATCHED_CHANNEL;
}

function isSentFromUser(message) {
    return !message.author.bot;
}

function getLastMessagesFromWatchedChannel(channel) {
    return channel.messages.fetch({limit: READ_MESSAGES_COUNT});
}

function extractLastMessagesFromResponse(messages, count) {
    return Array.from(messages.reverse().filter(msg => !msg.author.bot).values()).slice(-count);
}

function extractNumberFromMessage(currentMessage) {
    let extractedNumber = currentMessage.content.split(" ")[0];
    logger.debug("Extracted: %o", extractedNumber);
    if (isNaN(extractedNumber)) {
        throw new Error("Could not extract number from message");
    }
    return extractedNumber;
}

function isNewlyPostedNumberCorrect(currentMessage, previousMessage) {
    return extractNumberFromMessage(currentMessage) - 1 === extractNumberFromMessage(previousMessage.content);
}

function deleteMessage(message) {
    message.delete()
        .then(() => logger.log("Successfully removed message: %o", message.content))
        .catch(error => logger.error("Error while removing message: %o", error))
}

function notifyWrongNumberProvided(channel, author) {
    channel.send(`<@${author}> ${WRONG_INCREMENT_MESSAGE}`);
}

function notifyWrongMessageFormat(channel, author) {
    channel.send(`<@${author}> ${WRONG_MESSAGE_CONTENT}`);
}

function verifyNewlyPostedNumber(messages, channel, message) {
    let lastMessages = extractLastMessagesFromResponse(messages, 2);
    let previousMessage = lastMessages[0];
    let currentMessage = lastMessages[1];
    logger.debug("Previous message: %o", previousMessage.content);
    logger.debug("Current message: %o", currentMessage.content);
    try {
        if (isNewlyPostedNumberCorrect(currentMessage, previousMessage)) {
            logger.info("Verified correctly.")
        } else {
            logger.info("Verification failed.")
            notifyWrongNumberProvided(channel, message.author.id);
            deleteMessage(message);
        }
    } catch (error) {
        logger.error("Error occurred while checking numbers: %o", error);
        notifyWrongMessageFormat(channel, message.author.id);
        deleteMessage(message);
    }
}

function verifyNewMessage(message) {
    let channel = getChannelId(message);
    if (isSentToWatchedChannel(channel) && isSentFromUser(message)) {
        logger.info(`Verifying received message sent to channel ${WATCHED_CHANNEL} by ${message.author.username}`)
        logger.debug("reading last %o messages", READ_MESSAGES_COUNT);
        getLastMessagesFromWatchedChannel(channel)
            .then(messages => {
                verifyNewlyPostedNumber(messages, channel, message);
            })
            .catch(error => logger.error("Error while fetching last channel messages: %o", error))
    }
}

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    verifyNewMessage(message);
});

client.login(process.env.CLIENT_TOKEN);