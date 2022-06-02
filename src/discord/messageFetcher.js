const {getReadMessagesCount} = require('../globals');

function getLastMessagesFromWatchedChannel(channel) {
  return channel.messages.fetch({limit: getReadMessagesCount()});
}

function fetchMessage(message) {
  return message.channel.messages.fetch(message.id);
}

module.exports = {
  getLastMessagesFromWatchedChannel: getLastMessagesFromWatchedChannel,
  fetchMessage: fetchMessage,
};
