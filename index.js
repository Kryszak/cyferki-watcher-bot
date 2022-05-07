require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});
const logger = require('loglevel');

logger.setLevel(process.env.LOG_LEVEL);

const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;
const READ_MESSAGES_COUNT = process.env.MESSAGE_READ_COUNT;
const WRONG_INCREMENT_MESSAGE = process.env.BOT_WRONG_NUMBER_MESSAGE;
const WRONG_MESSAGE_CONTENT = process.env.BOT_WRONG_MESSAGE_FORMAT;

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

function newlyPostedNumberIsNotCorrect(currentMessage, previousMessage) {
    return extractNumberFromMessage(currentMessage) - 1 !== parseInt(previousMessage.content);
}

function deleteMessage(message) {
    message.delete()
        .then(() => logger.log("Successfully removed message: %o", message.content))
        .catch(error => logger.error("Error while removing message: %o", error))
}

function notifyWrongMessageFormat(channel, author) {
    channel.send(`<@${author}> ${WRONG_MESSAGE_CONTENT}`);
}

function notifyWrongNumberProvided(channel, author) {
    channel.send(`<@${author}> ${WRONG_INCREMENT_MESSAGE}`);
}

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    logger.trace("message sent by: %o", message.author.username);
    let channel = getChannelId(message);
    if (isSentToWatchedChannel(channel) && isSentFromUser(message)) {
        logger.info(`Veryfing received message to channel ${WATCHED_CHANNEL}`)
        logger.debug("reading last %o messages", READ_MESSAGES_COUNT);
        getLastMessagesFromWatchedChannel(channel)
            .then(messages => {
                let lastMessages = extractLastMessagesFromResponse(messages, 2);
                let previousMessage = lastMessages[0];
                let currentMessage = lastMessages[1];
                logger.debug("Previous message: %o", previousMessage.content);
                logger.debug("Current message: %o", currentMessage.content);
                try {
                    if (newlyPostedNumberIsNotCorrect(currentMessage, previousMessage)) {
                        notifyWrongNumberProvided(channel, message.author.id);
                        deleteMessage(message);
                    } else {
                        logger.info("Verified ")
                    }
                } catch (error) {
                    logger.log("Error occurred while checking numbers: %o", error);
                    notifyWrongMessageFormat(channel, message.author.id);
                    deleteMessage(message);
                }
            })
            .catch(error => logger.error("Error while fetching last channel messages: %o", error))
    }
});

client.login(process.env.CLIENT_TOKEN);
