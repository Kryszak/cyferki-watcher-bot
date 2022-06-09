import MessageFetcher from '../../src/discord/MessageFetcher';
import Globals from "../../src/Globals";
import MessageUtils from "../../src/discord/MessageUtils";

const messageWithoutContent = {
  'guild': {
    'name': 'test guild',
  },
  'author': {
    'bot': false,
    'username': 'test username',
  },
  'channel': {
    'messages': {
      'fetch': () => Promise.resolve(),
    },
  },
  'content': undefined
};

const messageFromBot = {
  'guild': {
    'name': 'test guild',
  },
  'author': {
    'bot': true,
    'username': 'bot user',
  },
  'content': undefined
};

const mockGlobals: jest.Mocked<Globals> = {
  getClientToken: undefined,
  getGameOverMessageContent: undefined,
  getGameoverNumber: undefined,
  getLogLevel: jest.fn().mockReturnValue('debug'),
  getRankWonMessageContent: undefined,
  getRanks: undefined,
  getReadMessagesCount: jest.fn().mockReturnValue(20),
  getWatchedChannel: undefined,
  getWrongIncrementMessage: undefined,
  getWrongMessageContent: undefined
}

const subject = new MessageFetcher(mockGlobals, new MessageUtils());

test('Should fetch messages with given limit', async () => {
  const mockedFetch = jest.fn().mockReturnValue(Promise.resolve([
    {...messageWithoutContent, 'content': '1'},
    {...messageFromBot, 'content': 'qwe'},
    {...messageWithoutContent, 'content': '2'},
    {...messageFromBot, 'content': 'ewq'},
    {...messageWithoutContent, 'content': '3'},
  ]));
  const channel = {
    'messages': {
      'fetch': mockedFetch,
    },
  };

  const fetchedMessages = await subject.getLastMessagesFromWatchedChannel(channel);

  expect(mockedFetch).toHaveBeenCalledTimes(1);
  expect(mockedFetch).toHaveBeenCalledWith({'limit': 20});
  expect(fetchedMessages.length).toEqual(3);
  expect(fetchedMessages.map((msg: any) => msg.content)).toEqual(['3', '2', '1']);
});
