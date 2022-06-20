import {injectable} from "inversify";
import "reflect-metadata";
import {Message} from "discord.js";

@injectable()
export default class MessageUtils {
    isSentFromUser(message: Message): boolean {
        return !message.author.bot;
    }

    isContainingNumber(message: Message): boolean {
        return !isNaN(this.extractNumberFromMessage(message));
    }

    extractNumberFromMessage(message: Message): number {
        try {
            return parseInt(message.content.split(' ')[0]);
        } catch {
            return NaN;
        }
    }
}
