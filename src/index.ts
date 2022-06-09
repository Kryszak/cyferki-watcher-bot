import * as Discord from 'discord.js';
import LoggerFactory from "./logging/LoggerFactory";
import Globals from "./Globals";
import MessageVerificator from "./verification/MessageVerificator";
import MessageUtils from "./discord/MessageUtils";
import MessageSender from "./discord/MessageSender";
import MessageFetcher from "./discord/MessageFetcher";
import RoleAdder from "./discord/RoleAdder";
import ChannelUtils from "./discord/ChannelUtils";
import PrizeManager from "./verification/PrizeManager";
import ErrorHandler from "./verification/ErrorHandler";


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

const messageUtils = new MessageUtils();
const messageFetcher = new MessageFetcher(globals, messageUtils);
const messageSender = new MessageSender(globals, loggerFactory);
const roleAdder = new RoleAdder(messageFetcher, messageSender, loggerFactory);
const verifications = new MessageVerificator(
  globals,
  messageUtils,
  messageSender,
  messageFetcher,
  new ChannelUtils(globals, loggerFactory),
  new PrizeManager(globals, roleAdder, messageFetcher),
  new ErrorHandler(messageFetcher, messageSender, loggerFactory),
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
