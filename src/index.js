const Discord = require('discord.js');
const client = new Discord.Client({intents: ['GUILDS', 'GUILD_MESSAGES']});
const {getLogger} = require('./logging/logging');
const {getRanks, getClientToken} = require('./globals');
const {verifyNewMessage} = require('./verification/verifications');

const rootLogger = getLogger('root');

function printRolesGrantedForNumberOnServer(server) {
  const logger = getLogger(server.name);
  logger.debug('REWARD ROLES FOR NUMBERS >>');
  Object.entries(getRanks()).forEach((entry) => {
    const role = server.roles.cache.get(entry[1]);
    if (role) {
      logger.debug(`${entry[0]}: '${role.name}'`);
    }
  });
  logger.debug('REWARD ROLES FOR NUMBERS <<');
}


client.on('ready', () => {
  rootLogger.info(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('grę w cyferki', {type: 'WATCHING'});
  client.guilds.cache.forEach((server) => printRolesGrantedForNumberOnServer(server));
});

client.on('messageCreate', (message) => {
  verifyNewMessage(message, client);
});

client.login(getClientToken())
    .then(() => rootLogger.info('Client logged in!'))
    .catch((error) => rootLogger.error('Failed to login bot:', error));
