require('dotenv').config();

const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;

function isSentToWatchedChannel(channel) {
    return channel.name === WATCHED_CHANNEL;
}

function isSentFromUser(message) {
    return !message.author.bot;
}

function isContainingNumber(message) {
    let extractedNumber = message.content.split(" ")[0];
    return !isNaN(extractedNumber);
}

function extractNumberFromMessage(message) {
    if (!isContainingNumber(message)) {
        throw new Error("Could not extract number from message");
    }
    return parseInt(message.content.split(" ")[0]);
}

module.exports = {
    isSentToWatchedChannel: isSentToWatchedChannel,
    isSentFromUser: isSentFromUser,
    isContainingNumber: isContainingNumber,
    extractNumberFromMessage: extractNumberFromMessage
}