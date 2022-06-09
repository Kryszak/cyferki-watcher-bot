import MessageFetcher from '../../src/discord/MessageFetcher';
import Globals from "../../src/Globals";

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

const subject = new MessageFetcher(mockGlobals);

test('Should fetch messages with given limit', () => {
  const mockedFetch = jest.fn();
  const channel = {
    'messages': {
      'fetch': mockedFetch,
    },
  };

  subject.getLastMessagesFromWatchedChannel(channel);

  expect(mockedFetch).toHaveBeenCalledTimes(1);
  expect(mockedFetch).toHaveBeenCalledWith({'limit': 20});
});
