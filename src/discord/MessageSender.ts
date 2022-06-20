import Globals from "../Globals";
import {injectable} from "inversify";
import "reflect-metadata";
import {GuildChannel, Message, TextChannel} from "discord.js";
import * as fillTemplate from "es6-dynamic-template";

@injectable()
export default class MessageSender {
    private globals: Globals;

    constructor(globals: Globals) {
        this.globals = globals;
    }

    notifyWrongNumberProvided(channel: GuildChannel, authorId: string): void {
        const messageContent = fillTemplate(this.globals.getWrongIncrementMessage(), {
            'author': `<@${authorId}>`
        });
        this.sendMessage(channel, messageContent);
    }

    notifyWrongMessageFormat(channel: GuildChannel, authorId: string): void {
        const messageContent = fillTemplate(this.globals.getWrongMessageContent(), {
            'author': `<@${authorId}>`
        });
        this.sendMessage(channel, messageContent);
    }

    notifyPrizedNumber(channel: GuildChannel, authorId: string, roleId: string): void {
        const messageContent = fillTemplate(this.globals.getRankWonMessageContent(), {
            'author': `<@${authorId}>`,
            'role': `<@&${roleId}>`
        });
        this.sendMessage(channel, messageContent);
    }

    notifyGameOver(channel: GuildChannel): Promise<Message> {
        return this.sendMessage(channel, this.globals.getGameOverMessageContent());
    }

    private sendMessage(channel: GuildChannel, content: string): Promise<Message> {
        return (channel as TextChannel).send(content);
    }
}
