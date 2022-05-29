const {logger} = require('../logging');

function addRoleToUser(message, roleId) {
  logger.info(`[${message.guild.name}] Adding roleId=${roleId} to user=${message.author.username}`);
  try {
    message.member.roles.add(roleId);
    logger.info(`[${message.guild.name}] Successfully added roleId=${roleId} to user=${message.author.username}`);
  } catch (error) {
    logger.error('[${message.guild.name}] Failed to add tole to user.', error);
  }
}

function hasRole(member, roleId) {
  return member.roles.cache.find((role) => role.id === roleId);
}

module.exports = {
  addRoleToUser: addRoleToUser,
  hasRole: hasRole,
};
