require('dotenv').config();

const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;

function getChannelId(client, message) {
    return client.channels.cache.get(message.channelId);
}

function isSentToWatchedChannel(channel) {
    return channel.name === WATCHED_CHANNEL;
}

module.exports = {
    getChannelId: getChannelId,
    isSentToWatchedChannel: isSentToWatchedChannel,

}