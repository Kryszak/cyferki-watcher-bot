import ChannelUtils from "../../src/discord/ChannelUtils";
import Globals from "../../src/Globals";
import LoggerFactory from "../../src/logging/LoggerFactory";
import {Client, GuildChannel, Message} from "discord.js";

const channelName = 'watched';

const mockGlobals: jest.Mocked<Globals> = {
    getClientToken: undefined,
    getGameOverMessageContent: undefined,
    getGameoverNumber: undefined,
    getLogLevel: jest.fn().mockReturnValue('debug'),
    getRankWonMessageContent: undefined,
    getRanks: undefined,
    getReadMessagesCount: undefined,
    getWatchedChannel: jest.fn().mockReturnValue(channelName),
    getWrongIncrementMessage: undefined,
    getWrongMessageContent: undefined
}

const subject: ChannelUtils = new ChannelUtils(mockGlobals, new LoggerFactory(mockGlobals));

test('Should return true for watched channel', () => {
    const channel = {
        'name': channelName,
    };
    expect(subject.isSentToWatchedChannel(channel as GuildChannel)).toBeTruthy();
});

test('Should return false for not watched channel', () => {
    const channel = {
        'name': 'general',
    };
    expect(subject.isSentToWatchedChannel(channel as GuildChannel)).toBeFalsy();
});

test('Should override permissions for channel', () => {
    const mockedEdit = jest.fn(() => Promise.resolve());
    const channel = {
        'permissionOverwrites': {
            'edit': mockedEdit,
        },
        'guild': {
            'name': 'test guild',
            'roles': {'everyone': true},
        },
    };
    subject.removeSendMessagePermissions(channel as unknown as GuildChannel);

    expect(mockedEdit.mock.calls.length).toBe(1);
});

test('Should return requested channel', () => {
    const mockedGetChannel = jest.fn();
    const client = {
        'channels': {
            'cache': {
                'get': mockedGetChannel,
            },
        },
    };

    const message = {
        'channelId': 123456,
    };

    subject.getChannel(client as unknown as Client, message as unknown as Message);

    expect(mockedGetChannel).toHaveBeenCalledTimes(1);
    expect(mockedGetChannel).toHaveBeenCalledWith(123456);
});
