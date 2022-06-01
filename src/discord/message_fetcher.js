const {getReadMessagesCount} = require('../globals');

function getLastMessagesFromWatchedChannel(channel) {
  return channel.messages.fetch({limit: getReadMessagesCount()});
}

module.exports = {
  getLastMessagesFromWatchedChannel: getLastMessagesFromWatchedChannel,
};
