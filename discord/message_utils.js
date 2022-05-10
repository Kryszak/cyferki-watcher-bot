function isSentFromUser(message) {
    return !message.author.bot;
}

function isContainingNumber(message) {
    return !isNaN(extractNumberFromMessage(message));
}

function extractNumberFromMessage(message) {
    try {
        return parseInt(message.content.split(" ")[0]);
    } catch (e) {
        return NaN;
    }
}

module.exports = {
    isSentFromUser: isSentFromUser,
    isContainingNumber: isContainingNumber,
    extractNumberFromMessage: extractNumberFromMessage
}