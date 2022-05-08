require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({intents: ["GUILDS", "GUILD_MESSAGES"]});

const {notifyWrongNumberProvided, notifyWrongMessageFormat, deleteMessage} = require("./discord/message_sender");
const {
    isSentToWatchedChannel,
    isSentFromUser,
    isContainingNumber,
    extractNumberFromMessage
} = require("./discord/message_utils");
const {getLastMessagesFromWatchedChannel} = require("./discord/message_fetcher");
const {logger} = require("./logging");

const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;
const READ_MESSAGES_COUNT = process.env.MESSAGE_READ_COUNT || 20;

function getChannelId(message) {
    return client.channels.cache.get(message.channelId);
}

function extractLastMessagesFromResponse(messages, count) {
    return Array.from(messages.reverse().filter(msg => !msg.author.bot).values()).slice(-count);
}

function isNewlyPostedNumberCorrect(currentMessage, previousMessage) {
    return extractNumberFromMessage(currentMessage) - 1 === extractNumberFromMessage(previousMessage);
}

function validateNewlyPostedNumber(currentMessage, previousMessage, channel, message) {
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

function isTheFirstNumberInGame(messages) {
    let previousMessages = extractLastMessagesFromResponse(messages, READ_MESSAGES_COUNT);
    let currentMessage = previousMessages.shift();
    return previousMessages.every(msg => !isContainingNumber(msg) && extractNumberFromMessage(currentMessage) === 1);
}

function verifyNewlyPostedNumber(messages, channel, message) {
    let lastMessages = extractLastMessagesFromResponse(messages, 2);
    if (lastMessages.length < 2) {
        logger.info("Not enough messages in channel to run the check, msg count=%o", lastMessages.length);
        return;
    }
    if (isTheFirstNumberInGame(messages)) {
        logger.info("This is the first correct number in game - skipping further checks!")
        return;
    }
    let previousMessage = lastMessages[0];
    let currentMessage = lastMessages[1];
    logger.debug("Previous message: %o", previousMessage.content);
    logger.debug("Current message: %o", currentMessage.content);
    validateNewlyPostedNumber(currentMessage, previousMessage, channel, message);
}

function verifyNewMessage(message) {
    let channel = getChannelId(message);
    if (isSentToWatchedChannel(channel) && isSentFromUser(message)) {
        logger.info(`Verifying message="${message.content}" sent to channel ${WATCHED_CHANNEL} by ${message.author.username}`)
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

client.login(process.env.CLIENT_TOKEN)
    .then(() => logger.info("Client loggged in!"))
    .catch(error => logger.error("Failed to login bot: %o", error));
