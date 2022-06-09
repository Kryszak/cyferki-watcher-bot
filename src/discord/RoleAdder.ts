import MessageFetcher from "./MessageFetcher";
import MessageSender from "./MessageSender";
import {GuildMember, Role} from "discord.js";
import LoggerFactory from "../logging/LoggerFactory";


export default class RoleAdder {
  private messageFetcher: MessageFetcher;
  private messageSender: MessageSender;
  private loggerFactory: LoggerFactory;

  constructor(messageFetcher: MessageFetcher,
              messageSender: MessageSender,
              loggerFactory: LoggerFactory) {
    this.messageSender = messageSender;
    this.messageFetcher = messageFetcher;
    this.loggerFactory = loggerFactory;
  }

  addRoleToUser(message, roleId): void {
    const logger = this.loggerFactory.getLogger(message.guild.name);
    try {
      logger.info(`Adding roleId=${roleId} to user=${message.author.username}`);
      if (!this.hasRole(message.member, roleId)) {
        this.messageFetcher.fetchMessage(message).then(() => {
          this.messageSender.notifyPrizedNumber(message.channel, message.author.id, roleId);
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

  private hasRole(member: GuildMember, roleId): boolean {
    return !!member.roles.cache.find((role: Role) => role.id === roleId);
  }
}
