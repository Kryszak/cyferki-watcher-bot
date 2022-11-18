import Globals from "../Globals";
import { injectable } from "inversify";
import "reflect-metadata";
import { GuildChannel, Message, TextChannel } from "discord.js";
import * as fillTemplate from "es6-dynamic-template";

@injectable()
export default class MessageSender {
    private globals: Globals;

    constructor(globals: Globals) {
        this.globals = globals;
    }

    async notifyWrongNumberProvided(channel: GuildChannel, authorId: string): Promise<void> {
        const messageContent = fillTemplate(this.globals.getWrongIncrementMessage(), {
            'author': `<@${authorId}>`
        });
        await this.sendMessage(channel, messageContent);
    }

    async notifyWrongMessageFormat(channel: GuildChannel, authorId: string): Promise<void> {
        const messageContent = fillTemplate(this.globals.getWrongMessageContent(), {
            'author': `<@${authorId}>`
        });
        await this.sendMessage(channel, messageContent);
    }

    async notifyPrizedNumber(channel: GuildChannel, authorId: string, roleId: string): Promise<void> {
        const messageContent = fillTemplate(this.globals.getRankWonMessageContent(), {
            'author': `<@${authorId}>`,
            'role': `<@&${roleId}>`
        });
        await this.sendMessage(channel, messageContent);
    }

    notifyGameOver(channel: GuildChannel): Promise<Message> {
        return this.sendMessage(channel, this.globals.getGameOverMessageContent());
    }

    private sendMessage(channel: GuildChannel, content: string): Promise<Message> {
        return (channel as TextChannel).send(content);
    }
}
