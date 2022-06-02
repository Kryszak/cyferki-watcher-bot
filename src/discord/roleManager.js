const {getLogger} = require('../logging/logging');
const {notifyPrizedNumber} = require('./messageSender');
const {fetchMessage} = require('./messageFetcher');

function addRoleToUser(message, roleId) {
  const logger = getLogger(message.guild.name);
  try {
    logger.info(`Adding roleId=${roleId} to user=${message.author.username}`);
    if (!hasRole(message.member, roleId)) {
      fetchMessage(message).then(() => {
        notifyPrizedNumber(message.channel, message.author.id, roleId);
        message.member.roles.add(roleId);
        logger.info(`Successfully added roleId=${roleId} to user=${message.author.username}`);
      });
    } else {
      logger.warn(`User ${message.author.username} already has roleId=${roleId}!`);
    }
  } catch (error) {
    logger.error('Failed to add tole to user.', error);
  }
}

function hasRole(member, roleId) {
  return member.roles.cache.find((role) => role.id === roleId);
}

module.exports = {
  addRoleToUser: addRoleToUser,
  hasRole: hasRole,
};
