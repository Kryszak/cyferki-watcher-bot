import GameoverManager from "../../src/verification/GameoverManager";
import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import MessageSender from "../../src/discord/MessageSender";
import ChannelUtils from "../../src/discord/ChannelUtils";
import {GuildChannel} from "discord.js";
import mocked = jest.mocked;

jest.mock("../../src/discord/MessageSender");
jest.mock("../../src/discord/ChannelUtils");

const mockGlobals: jest.Mocked<Globals> = {
    getClientToken: undefined,
    getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
    getGameoverNumber: jest.fn().mockReturnValue(20),
    getLogLevel: jest.fn().mockReturnValue('debug'),
    getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
    getRanks: jest.fn().mockReturnValue({'10': '123'}),
    getReadMessagesCount: jest.fn().mockReturnValue(20),
    getWatchedChannel: undefined,
    getWrongIncrementMessage: jest.fn().mockReturnValue('wrongIncrementMsg'),
    getWrongMessageContent: jest.fn().mockReturnValue('wrongMsg')
}

const loggerFactory = new LoggerFactory(mockGlobals);
const mockChannelUtils = mocked(new ChannelUtils(mockGlobals, loggerFactory));
const mockMessageSender = mocked(new MessageSender(mockGlobals));
const gameoverManager = new GameoverManager(mockGlobals, mockChannelUtils, mockMessageSender);

afterEach(() => {
    mockMessageSender.notifyGameOver.mockClear();
});

test('Should handle game over', () => {
    gameoverManager.checkForGameOver(20, {} as GuildChannel);

    expect(mockMessageSender.notifyGameOver).toHaveBeenCalledTimes(1);
});

test('Should do nothing if gameover number is not posted', () => {
    gameoverManager.checkForGameOver(10, {} as GuildChannel);

    expect(mockMessageSender.notifyGameOver).not.toHaveBeenCalled();
});
