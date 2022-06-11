import Globals from "../Globals";
import MessageUtils from "./MessageUtils";
import {injectable} from "inversify";
import {Message} from "discord.js";

@injectable()
export default class MessageFetcher {
  private globals: Globals;
  private messageUtils: MessageUtils;

  constructor(globals: Globals,
              messageUtils: MessageUtils) {
    this.globals = globals;
    this.messageUtils = messageUtils;
  }

  async getLastMessagesFromWatchedChannel(channel): Promise<Array<Message>> {
    const count = this.globals.getReadMessagesCount()
    const fetchedMessages: Array<Message> = await channel.messages.fetch({limit: count});
    return Array.from(
      fetchedMessages.reverse().filter((msg) => this.messageUtils.isSentFromUser(msg)).values()
    ).slice(-count)
  }

  fetchMessage(message) {
    return message.channel.messages.fetch(message.id);
  }
}
