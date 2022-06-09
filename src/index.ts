import * as Discord from 'discord.js';
import LoggerFactory from "./logging/LoggerFactory";
import Globals from "./Globals";
import Verifications from "./verification/Verifications";
import MessageUtils from "./discord/MessageUtils";
import MessageSender from "./discord/MessageSender";
import MessageFetcher from "./discord/MessageFetcher";
import RoleAdder from "./discord/RoleAdder";
import ChannelUtils from "./discord/ChannelUtils";


const globals = new Globals();
const loggerFactory = new LoggerFactory(globals);
const rootLogger = loggerFactory.getLogger('root');

function printRolesGrantedForNumberOnServer(server) {
  const logger = loggerFactory.getLogger(server.name);
  logger.debug('REWARD ROLES FOR NUMBERS >>');
  Object.entries(globals.getRanks()).forEach((entry) => {
    const role = server.roles.cache.get(entry[1]);
    if (role) {
      logger.debug(`${entry[0]}: '${role.name}'`);
    }
  });
  logger.debug('REWARD ROLES FOR NUMBERS <<');
}

const client = new Discord.Client({intents: ['GUILDS', 'GUILD_MESSAGES']});

const messageFetcher = new MessageFetcher(globals);
const messageSender = new MessageSender(globals, loggerFactory);

const verifications = new Verifications(
  globals,
  new MessageUtils(),
  messageSender,
  messageFetcher,
  new RoleAdder(messageFetcher, messageSender, loggerFactory),
  new ChannelUtils(globals, loggerFactory),
  loggerFactory
);

client.on('ready', () => {
  rootLogger.info(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('grę w cyferki', {type: 'WATCHING'});
  client.guilds.cache.forEach((server) => printRolesGrantedForNumberOnServer(server));
});

client.on('messageCreate', (message) => {
  verifications.verifyNewMessage(message, client);
});

client.login(globals.getClientToken())
  .then(() => rootLogger.info('Client logged in!'))
  .catch((error) => rootLogger.error('Failed to login bot:', error));
