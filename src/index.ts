import LoggerFactory from "./logging/LoggerFactory";
import Globals from "./Globals";
import MessageVerificator from "./verification/MessageVerificator";
import {container} from "./inversify.config";
import {Client, Guild, Role} from "discord.js";
import {Logger} from "loglevel";


const globals: Globals = container.get<Globals>(Globals);
const loggerFactory: LoggerFactory = container.get<LoggerFactory>(LoggerFactory);
const rootLogger: Logger = loggerFactory.getLogger('root');

function printRolesGrantedForNumberOnServer(server: Guild) {
    const logger: Logger = loggerFactory.getLogger(server.name);
    logger.debug('REWARD ROLES FOR NUMBERS >>');
    Object.entries(globals.getRanks()).forEach((entry: any) => {
        const role: Role = server.roles.cache.get(entry[1]);
        if (role) {
            logger.debug(`${entry[0]}: '${role.name}'`);
        }
    });
    logger.debug('REWARD ROLES FOR NUMBERS <<');
}

const client: Client = new Client({intents: ['GUILDS', 'GUILD_MESSAGES']});

const messageVerificator: MessageVerificator = container.get<MessageVerificator>(MessageVerificator);

client.on('ready', () => {
    rootLogger.info(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('grę w cyferki', {type: 'WATCHING'});
    client.guilds.cache.forEach((server: Guild) => printRolesGrantedForNumberOnServer(server));
});

client.on('messageCreate', (message) => {
    messageVerificator.verifyNewMessage(message, client);
});

client.login(globals.getClientToken())
    .then(() => rootLogger.info('Client logged in!'))
    .catch((error) => rootLogger.error('Failed to login bot:', error));
