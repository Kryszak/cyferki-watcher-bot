import Globals from "../Globals";
import LoggerFactory from "../logging/LoggerFactory";

export default class MessageSender {
  private globals: Globals;
  private loggerFactory: LoggerFactory;

  constructor(globals: Globals,
              loggerFactory: LoggerFactory) {
    this.globals = globals;
    this.loggerFactory = loggerFactory;
  }

  notifyWrongNumberProvided(channel, authorId) {
    channel.send(`<@${authorId}> ${this.globals.getWrongIncrementMessage()}`);
  }

  notifyWrongMessageFormat(channel, authorId) {
    channel.send(`<@${authorId}> ${this.globals.getWrongMessageContent()}`);
  }

  notifyPrizedNumber(channel, authorId, roleId) {
    channel.send(`<@${authorId}>, ${this.globals.getRankWonMessageContent()} <@&${roleId}>!`);
  }

  notifyGameOver(channel) {
    return channel.send(this.globals.getGameOverMessageContent());
  }

  deleteMessage(message) {
    const logger = this.loggerFactory.getLogger(message.guild.name);
    logger.info(`Removing message from ${message.author.username}: ${message.content}`);
    message.delete()
      .then(() => logger.info(`Successfully removed message: ${message.content} from ${message.author.username}`))
      .catch((error) => {
        if (error.httpStatus !== 404) {
          logger.error('Error while removing message: %o', error);
        }
      });
  }
}
