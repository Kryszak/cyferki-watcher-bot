import Globals from "../Globals";
import {injectable} from "inversify";
import "reflect-metadata";

@injectable()
export default class MessageSender {
  private globals: Globals;

  constructor(globals: Globals) {
    this.globals = globals;
  }

  notifyWrongNumberProvided(channel, authorId: string): void {
    channel.send(`<@${authorId}> ${this.globals.getWrongIncrementMessage()}`);
  }

  notifyWrongMessageFormat(channel, authorId: string): void {
    channel.send(`<@${authorId}> ${this.globals.getWrongMessageContent()}`);
  }

  notifyPrizedNumber(channel, authorId: string, roleId: string): void {
    channel.send(`<@${authorId}>, ${this.globals.getRankWonMessageContent()} <@&${roleId}>!`);
  }

  notifyGameOver(channel): Promise<void> {
    return channel.send(this.globals.getGameOverMessageContent());
  }
}
