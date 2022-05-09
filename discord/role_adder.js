function addRoleToUser(message, roleId) {
    message.member.roles.add(roleId);
}

module.exports = {
    addRoleToUser: addRoleToUser
}