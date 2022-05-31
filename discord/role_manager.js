const {getLogger} = require('../logging/logging');

function addRoleToUser(message, roleId) {
  const logger = getLogger('message.guild.name');
  logger.info(`Adding roleId=${roleId} to user=${message.author.username}`);
  try {
    message.member.roles.add(roleId);
    logger.info(`Successfully added roleId=${roleId} to user=${message.author.username}`);
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
