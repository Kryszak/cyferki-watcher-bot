import Globals from "../Globals";
import ChannelUtils from "../discord/ChannelUtils";
import MessageSender from "../discord/MessageSender";

export default class GameoverManager {
  private globals: Globals;
  private channelUtils: ChannelUtils;
  private messageSender: MessageSender;

  constructor(globals: Globals,
              channelUtils: ChannelUtils,
              messageSender: MessageSender) {
    this.globals = globals;
    this.channelUtils = channelUtils;
    this.messageSender = messageSender;
  }

  checkForGameOver(verifiedNumber, channel) {
    if (verifiedNumber === this.globals.getGameoverNumber()) {
      new Promise((resolve) => {
        setTimeout(resolve.bind(null, this.messageSender.notifyGameOver(channel)), 3000);
      }).then(() => {
        this.channelUtils.removeSendMessagePermissions(channel);
      });
    }
  }
}
