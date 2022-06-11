import MessageFetcher from "./MessageFetcher";
import MessageSender from "./MessageSender";
import {GuildChannel, GuildMember, Message, Role} from "discord.js";
import LoggerFactory from "../logging/LoggerFactory";
import {injectable} from "inversify";
import "reflect-metadata";
import {Logger} from "loglevel";

@injectable()
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

  addRoleToUser(message: Message, roleId: string): void {
    const logger: Logger = this.loggerFactory.getLogger(message.guild.name);
    try {
      logger.info(`Adding roleId=${roleId} to user=${message.author.username}`);
      if (!this.hasRole(message.member, roleId)) {
        this.messageFetcher.fetchMessage(message)
          .then(() => {
            this.messageSender.notifyPrizedNumber(message.channel as GuildChannel, message.author.id, roleId);
          })
          .then(() => {
            return message.member.roles.add(roleId);
          })
          .finally(() => {
            logger.info(`Successfully added roleId=${roleId} to user=${message.author.username}`);
          });
      } else {
        logger.warn(`User ${message.author.username} already has roleId=${roleId}!`);
      }
    } catch (error) {
      logger.error('Failed to add tole to user.', error);
    }
  }

  private hasRole(member: GuildMember, roleId: string): boolean {
    return !!member.roles.cache.find((role: Role) => role.id === roleId);
  }
}
