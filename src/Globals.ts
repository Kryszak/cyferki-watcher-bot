import 'dotenv/config'
import "reflect-metadata";
import {injectable} from "inversify";

@injectable()
export default class Globals {
    getClientToken(): string {
        return process.env.CLIENT_TOKEN;
    }

    getWatchedChannel(): string {
        return process.env.WATCHED_CHANNEL;
    }

    getRanks() {
        return JSON.parse(process.env.RANKS);
    }

    getGameoverNumber(): number {
        return parseInt(process.env.GAMEOVER_NUMBER);
    }

    getReadMessagesCount(): number {
        return parseInt(process.env.MESSAGE_READ_COUNT) || 20;
    }

    getWrongIncrementMessage(): string {
        return process.env.BOT_WRONG_NUMBER_MESSAGE;
    }

    getWrongMessageContent(): string {
        return process.env.BOT_WRONG_MESSAGE_FORMAT;
    }

    getRankWonMessageContent(): string {
        return process.env.BOT_RANK_WON_MESSAGE;
    }

    getGameOverMessageContent(): string {
        return process.env.BOT_GAME_OVER_MESSAGE;
    }

    getLogLevel(): string {
        return process.env.LOG_LEVEL || 'info';
    }
}