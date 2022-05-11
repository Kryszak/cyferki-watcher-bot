require('dotenv').config();

const READ_MESSAGES_COUNT = process.env.MESSAGE_READ_COUNT || 20;

function getLastMessagesFromWatchedChannel(channel) {
  return channel.messages.fetch({limit: READ_MESSAGES_COUNT});
}

module.exports = {
  getLastMessagesFromWatchedChannel: getLastMessagesFromWatchedChannel,
};
