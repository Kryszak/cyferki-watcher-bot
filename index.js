require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({intents: ['GUILDS', 'GUILD_MESSAGES']});

const {
  notifyWrongNumberProvided,
  notifyWrongMessageFormat,
  deleteMessage,
  notifyPrizedNumber, notifyGameOver,
} = require('./discord/message_sender');
const {
  isSentFromUser,
  isContainingNumber,
  extractNumberFromMessage,
} = require('./discord/message_utils');
const {getLastMessagesFromWatchedChannel} = require('./discord/message_fetcher');
const {logger} = require('./logging');
const {addRoleToUser} = require('./discord/role_adder');
const {getChannel, isSentToWatchedChannel, removeSendMessagePermissions} = require('./discord/channel_utils');

function loadPrizedNumbers() {
  return JSON.parse(process.env.RANKS);
}

const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;
const GAMEOVER_NUMBER = parseInt(process.env.GAMEOVER_NUMBER);
const PRIZED_NUMBERS = loadPrizedNumbers();

const WRONG_MESSAGE_FORMAT_ERROR = Error('WRONG_MESSAGE_FORMAT');
const WRONG_NUMBER_POSTED_ERROR = Error('WRONG_NUMBER');

function extractLastMessagesFrom(messages, count) {
  return Array.from(messages.reverse().filter((msg) => !msg.author.bot).values()).slice(-count);
}

function extractNumbersForChecks(messages) {
  const lastMessages = extractLastMessagesFrom(messages, 2);
  return {
    'previousNumber': extractNumberFromMessage(lastMessages[0]),
    'currentNumber': extractNumberFromMessage(lastMessages[1]),
  };
}

function isNewlyPostedNumberCorrect(checkedNumbers) {
  return checkedNumbers.currentNumber - 1 === checkedNumbers.previousNumber;
}

function handleWrongMessageFormat(channel, lastMessage) {
  notifyWrongMessageFormat(channel, lastMessage.author.id);
  deleteMessage(lastMessage);
}

function handleWrongNumber(channel, lastMessage) {
  notifyWrongNumberProvided(channel, lastMessage.author.id);
  deleteMessage(lastMessage);
}

function handlePrizedNumberPosted(number, lastMessage) {
  const wonRoleId = PRIZED_NUMBERS[number];
  notifyPrizedNumber(lastMessage.channel, lastMessage.author.id, wonRoleId);
  addRoleToUser(lastMessage, wonRoleId);
}

function handleGameOver(channel) {
  new Promise((resolve) => {
    setTimeout(resolve.bind(null, notifyGameOver(channel)), 5000);
  }).then(() => {
    removeSendMessagePermissions(channel);
  });
}

function verifySentMessage(lastMessage, messages) {
  const checkedNumbers = extractNumbersForChecks(messages);
  if (isNaN(checkedNumbers.previousNumber) && isNaN(checkedNumbers.currentNumber)) {
    if (messages.every((msg) => !isContainingNumber(msg))) {
      logger.info(`[${lastMessage.guild.name}] Skipping further validation as counting doesn't start yet`);
      return;
    } else {
      logger.error(`[${lastMessage.guild.name}] Something really bad happen: two messages without numbers when there are other numbers in channel!`);
      throw WRONG_MESSAGE_FORMAT_ERROR;
    }
  }
  if ((isNaN(checkedNumbers.previousNumber) || !checkedNumbers.previousNumber) && checkedNumbers.currentNumber !== 1) {
    logger.error(`[${lastMessage.guild.name} ${lastMessage.author.name}] tried to start game with value higher than 1!`);
    throw WRONG_NUMBER_POSTED_ERROR;
  }
  if (isNaN(checkedNumbers.currentNumber)) {
    logger.error(`[${lastMessage.guild.name}] ${lastMessage.author.name} sent message not starting with number.`);
    throw WRONG_MESSAGE_FORMAT_ERROR;
  }
  if (!isNaN(checkedNumbers.previousNumber) && !isNewlyPostedNumberCorrect(checkedNumbers)) {
    throw WRONG_NUMBER_POSTED_ERROR;
  }
  if (checkedNumbers.currentNumber in PRIZED_NUMBERS) {
    handlePrizedNumberPosted(checkedNumbers.currentNumber, lastMessage);
  }
  if (checkedNumbers.currentNumber === GAMEOVER_NUMBER) {
    handleGameOver(lastMessage.channel);
  }
}

function tryMessageVerifications(lastMessage, messages, channel) {
  try {
    verifySentMessage(lastMessage, messages);
  } catch (error) {
    switch (error) {
      case WRONG_MESSAGE_FORMAT_ERROR:
        handleWrongMessageFormat(channel, lastMessage);
        break;
      case WRONG_NUMBER_POSTED_ERROR:
        handleWrongNumber(channel, lastMessage);
        break;
      default:
        logger.error(`[${lastMessage.guild.name}] Unknown error occurred: `, error);
        break;
    }
  }
}

function verifyNewMessage(lastMessage) {
  const channel = getChannel(client, lastMessage);
  if (isSentToWatchedChannel(channel) && isSentFromUser(lastMessage)) {
    logger.info(`[${lastMessage.guild.name}] Verifying message="${lastMessage.content}" sent to channel ${WATCHED_CHANNEL} by ${lastMessage.author.username}`);
    getLastMessagesFromWatchedChannel(channel)
        .then((messages) => {
          tryMessageVerifications(lastMessage, messages, channel);
        })
        .catch((error) => logger.error(`[${lastMessage.guild.name}] Error while fetching last channel messages:`, error))
        .finally(() => logger.info(`[${lastMessage.guild.name}] Finished verification of message="${lastMessage.content}"`));
  }
}

client.on('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', (message) => {
  verifyNewMessage(message);
});

client.login(process.env.CLIENT_TOKEN)
    .then(() => logger.info('Client logged in!'))
    .catch((error) => logger.error('Failed to login bot:', error));
