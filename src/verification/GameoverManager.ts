import Globals from "../Globals";
import ChannelUtils from "../discord/ChannelUtils";
import MessageSender from "../discord/MessageSender";
import { injectable } from "inversify";
import "reflect-metadata";
import { GuildChannel } from "discord.js";

@injectable()
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

    async checkForGameOver(verifiedNumber: number, channel: GuildChannel): Promise<void> {
        if (verifiedNumber === this.globals.getGameoverNumber()) {
            await this.messageSender.notifyGameOver(channel);
            await this.channelUtils.removeSendMessagePermissions(channel);
        }
    }
}
