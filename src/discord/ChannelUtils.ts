import Globals from "../Globals";
import LoggerFactory from "../logging/LoggerFactory";
import {injectable} from "inversify";
import "reflect-metadata";
import {Client, GuildChannel, Message} from "discord.js";
import {Logger} from "loglevel";

@injectable()
export default class {
    private globals: Globals;
    private loggerFactory: LoggerFactory;

    constructor(globals: Globals,
                loggerFactory: LoggerFactory) {
        this.globals = globals;
        this.loggerFactory = loggerFactory;
    }

    getChannel(client: Client, message: Message): GuildChannel {
        return client.channels.cache.get(message.channelId) as GuildChannel;
    }

    isSentToWatchedChannel(channel: GuildChannel): boolean {
        return channel.name === this.globals.getWatchedChannel();
    }

    getWatchedChannelName(): string {
        return this.globals.getWatchedChannel();
    }

    removeSendMessagePermissions(channel: GuildChannel): void {
        const logger: Logger = this.loggerFactory.getLogger(channel.guild.name);
        logger.info('Locking channel after finished game.');
        channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
            SEND_MESSAGES: false,
        }).then(() => logger.info('Channel locked after finished game.'))
            .catch((error: Error) => logger.error('Failed to lock channel.', error));
    }
}
