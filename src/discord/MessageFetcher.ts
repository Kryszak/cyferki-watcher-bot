import Globals from "../Globals";

export default class MessageFetcher {
  private globals: Globals;

  constructor(globals: Globals) {
    this.globals = globals;
  }

  getLastMessagesFromWatchedChannel(channel) {
    return channel.messages.fetch({limit: this.globals.getReadMessagesCount()});
  }

  fetchMessage(message) {
    return message.channel.messages.fetch(message.id);
  }
}
