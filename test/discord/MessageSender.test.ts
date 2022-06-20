import MessageSender from '../../src/discord/MessageSender';
import Globals from "../../src/Globals";
import {GuildChannel} from "discord.js";

const mockGlobals: jest.Mocked<Globals> = {
    getClientToken: undefined,
    getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
    getGameoverNumber: undefined,
    getLogLevel: jest.fn().mockReturnValue('debug'),
    getRankWonMessageContent: jest.fn().mockReturnValue('${author} rankWonMsg ${role}!'),
    getRanks: undefined,
    getReadMessagesCount: undefined,
    getWatchedChannel: undefined,
    getWrongIncrementMessage: jest.fn().mockReturnValue('${author} wrongIncrementMsg'),
    getWrongMessageContent: jest.fn().mockReturnValue('${author} wrongMsg')
}

const subject = new MessageSender(mockGlobals);

test('Should send message about wrong number', () => {
    const mockedSend = jest.fn();
    const channel = {
        'send': mockedSend,
    };

    subject.notifyWrongNumberProvided(channel as unknown as GuildChannel, '123456');

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend).toHaveBeenCalledWith('<@123456> wrongIncrementMsg');
});

test('Should send message about wrong message format', () => {
    const mockedSend = jest.fn();
    const channel = {
        'send': mockedSend,
    };

    subject.notifyWrongMessageFormat(channel as unknown as GuildChannel, '123456');

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend).toHaveBeenCalledWith('<@123456> wrongMsg');
});

test('Should send message about won rank', () => {
    const mockedSend = jest.fn();
    const channel = {
        'send': mockedSend,
    };

    subject.notifyPrizedNumber(channel as unknown as GuildChannel, '123456', '12');

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend).toHaveBeenCalledWith('<@123456> rankWonMsg <@&12>!');
});

test('Should send message about game over', () => {
    const mockedSend = jest.fn();
    const channel = {
        'send': mockedSend,
    };

    subject.notifyGameOver(channel as unknown as GuildChannel);

    expect(mockedSend).toHaveBeenCalledTimes(1);
    expect(mockedSend).toHaveBeenCalledWith('gameOverMsg');
});
