import PrizeManager from "../../src/verification/PrizeManager";
import Globals from "../../src/Globals";
import RoleAdder from "../../src/discord/RoleAdder";
import MessageFetcher from "../../src/discord/MessageFetcher";
import VerifiedNumbers from "../../src/verification/VerifiedNumbers";
import mocked = jest.mocked;
import {Message} from "discord.js";

jest.mock('../../src/discord/RoleAdder')
jest.mock('../../src/discord/MessageFetcher')

const roleId = '123';
const mockGlobals: jest.Mocked<Globals> = {
  getClientToken: undefined,
  getGameOverMessageContent: jest.fn().mockReturnValue('gameOverMsg'),
  getGameoverNumber: undefined,
  getLogLevel: jest.fn().mockReturnValue('debug'),
  getRankWonMessageContent: jest.fn().mockReturnValue('rankWonMsg'),
  getRanks: jest.fn().mockReturnValue({'10': roleId}),
  getReadMessagesCount: undefined,
  getWatchedChannel: undefined,
  getWrongIncrementMessage: jest.fn().mockReturnValue('wrongIncrementMsg'),
  getWrongMessageContent: jest.fn().mockReturnValue('wrongMsg')
}
const mockedRoleAdder = mocked(new RoleAdder(null, null, null));
const mockedMessageFetcher = mocked(new MessageFetcher(null, null))
const subject = new PrizeManager(mockGlobals, mockedRoleAdder, mockedMessageFetcher);

test('Should not process number without rank', async () => {
  const lastTwoNumbers = new VerifiedNumbers(4, 5);
  const lastMessage = {} as Message;

  await subject.checkForWonRole(lastTwoNumbers, lastMessage);

  expect(mockedMessageFetcher.fetchMessage).not.toHaveBeenCalled();
  expect(mockedRoleAdder.addRoleToUser).not.toHaveBeenCalled();
})

test('Should process number with rank', async () => {
  const lastTwoNumbers = new VerifiedNumbers(9, 10);
  const lastMessage = {} as Message;

  mockedMessageFetcher.fetchMessage.mockReturnValue(Promise.resolve(lastMessage));

  await subject.checkForWonRole(lastTwoNumbers, lastMessage);

  expect(mockedRoleAdder.addRoleToUser).toHaveBeenCalledTimes(1);
  expect(mockedRoleAdder.addRoleToUser).toHaveBeenCalledWith(lastMessage, roleId);
})