import Globals from "../Globals";
import MessageUtils from "./MessageUtils";
import {injectable} from "inversify";
import {GuildChannel, Message, TextChannel} from "discord.js";

@injectable()
export default class MessageFetcher {
  private globals: Globals;
  private messageUtils: MessageUtils;

  constructor(globals: Globals,
              messageUtils: MessageUtils) {
    this.globals = globals;
    this.messageUtils = messageUtils;
  }

  async getLastMessagesFromWatchedChannel(channel: GuildChannel): Promise<Array<Message>> {
    const count: number = this.globals.getReadMessagesCount()
    const fetchedMessages: Array<Message> = Array.from((await (channel as TextChannel).messages.fetch({limit: count})).values());
    return Array.from(
      fetchedMessages.reverse().filter((msg) => this.messageUtils.isSentFromUser(msg)).values()
    ).slice(-count)
  }

  fetchMessage(message: Message): Promise<Message> {
    return message.channel.messages.fetch(message.id);
  }
}
