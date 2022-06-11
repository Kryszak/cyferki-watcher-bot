import Globals from "../Globals";
import {injectable} from "inversify";
import "reflect-metadata";
import {GuildChannel, Message, TextChannel} from "discord.js";

@injectable()
export default class MessageSender {
  private globals: Globals;

  constructor(globals: Globals) {
    this.globals = globals;
  }

  notifyWrongNumberProvided(channel: GuildChannel, authorId: string): void {
    (channel as TextChannel).send(`<@${authorId}> ${this.globals.getWrongIncrementMessage()}`);
  }

  notifyWrongMessageFormat(channel: GuildChannel, authorId: string): void {
    (channel as TextChannel).send(`<@${authorId}> ${this.globals.getWrongMessageContent()}`);
  }

  notifyPrizedNumber(channel: GuildChannel, authorId: string, roleId: string): void {
    (channel as TextChannel).send(`<@${authorId}>, ${this.globals.getRankWonMessageContent()} <@&${roleId}>!`);
  }

  notifyGameOver(channel: GuildChannel): Promise<Message> {
    return (channel as TextChannel).send(this.globals.getGameOverMessageContent());
  }
}
