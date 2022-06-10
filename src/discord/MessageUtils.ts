import {injectable} from "inversify";
import "reflect-metadata";

@injectable()
export default class MessageUtils {
    isSentFromUser(message): boolean {
        return !message.author.bot;
    }

    isContainingNumber(message): boolean {
        return !isNaN(this.extractNumberFromMessage(message));
    }

    extractNumberFromMessage(message): number {
        try {
            return parseInt(message.content.split(' ')[0]);
        } catch {
            return NaN;
        }
    }
}
