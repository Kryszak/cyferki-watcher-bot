import Globals from "../Globals";
import LoggerFactory from "../logging/LoggerFactory";

export default class {
  private globals: Globals;
  private loggerFactory: LoggerFactory;

  constructor(globals: Globals,
              loggerFactory: LoggerFactory) {
    this.globals = globals;
    this.loggerFactory = loggerFactory;
  }

  getChannel(client, message) {
    return client.channels.cache.get(message.channelId);
  }

  isSentToWatchedChannel(channel) {
    return channel.name === this.globals.getWatchedChannel();
  }

  removeSendMessagePermissions(channel) {
    const logger = this.loggerFactory.getLogger(channel.guild.name);
    logger.info('Locking channel after finished game.');
    channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SEND_MESSAGES: false,
    }).then(() => logger.info('Channel locked after finished game.'))
      .catch((error) => logger.error('Failed to lock channel.', error));
  }
}
