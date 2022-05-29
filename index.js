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
  extractNumberFromMessage, fetchMessage,
} = require('./discord/message_utils');
const {getLastMessagesFromWatchedChannel} = require('./discord/message_fetcher');
const {logger} = require('./logging');
const {addRoleToUser, hasRole} = require('./discord/role_manager');
const {getChannel, isSentToWatchedChannel, removeSendMessagePermissions} = require('./discord/channel_utils');

function loadPrizedNumbers() {
  return JSON.parse(process.env.RANKS);
}

function printRolesGrantedForNumberOnServer(server) {
  logger.debug(`[${server.name}] REWARD ROLES FOR NUMBERS >>`);
  Object.entries(PRIZED_NUMBERS).forEach((entry) => {
    const role = server.roles.cache.get(entry[1]);
    if (role) {
      logger.debug(`${entry[0]}: '${role.name}'`);
    }
  });
  logger.debug(`[${server.name}] REWARD ROLES FOR NUMBERS <<`);
}

const WATCHED_CHANNEL = process.env.WATCHED_CHANNEL;
const GAMEOVER_NUMBER = parseInt(process.env.GAMEOVER_NUMBER);
const PRIZED_NUMBERS = loadPrizedNumbers();

const WRONG_MESSAGE_FORMAT_ERROR = Error('WRONG_MESSAGE_FORMAT');
const WRONG_NUMBER_POSTED_ERROR = Error('WRONG_NUMBER');

function extractLastMessagesFrom(messages, count) {
  return Array.from(messages.reverse().filter((msg) => isSentFromUser(msg)).values()).slice(-count);
}

function getDuplicatedNumbers(messages, currentNumber) {
  return Array.from(messages.filter((msg) => isSentFromUser(msg) && msg.content.includes(currentNumber)).values());
}

function extractNumbersForChecks(messages) {
  return extractLastMessagesFrom(messages, 10).map((message) => extractNumberFromMessage(message));
}

function isNewlyPostedNumberCorrect(checkedNumbers) {
  return checkedNumbers.currentNumber - 1 === checkedNumbers.previousNumber;
}

function handleWrongMessageFormat(channel, lastMessage) {
  notifyWrongMessageFormat(channel, lastMessage.author.id);
  deleteMessage(lastMessage);
}

function handleWrongNumber(channel, lastMessage) {
  fetchMessage(lastMessage).then(() => {
    notifyWrongNumberProvided(channel, lastMessage.author.id);
    deleteMessage(lastMessage);
  });
}

function handlePrizedNumberPosted(number, lastMessage) {
  const wonRoleId = PRIZED_NUMBERS[number];
  if (!hasRole(lastMessage.member, wonRoleId)) {
    fetchMessage(lastMessage).then(() => {
      notifyPrizedNumber(lastMessage.channel, lastMessage.author.id, wonRoleId);
      addRoleToUser(lastMessage, wonRoleId);
    });
  }
}

function handleGameOver(channel) {
  new Promise((resolve) => {
    setTimeout(resolve.bind(null, notifyGameOver(channel)), 5000);
  }).then(() => {
    removeSendMessagePermissions(channel);
  });
}

function handleDuplicatedLastMessages(lastMessage, checkedNumbers, lastTwoNumbers, messages) {
  logger.debug(`[${lastMessage.guild.name}] last two numbers are the same, checking further`);
  const previousValidNumber = checkedNumbers.filter((number) => number !== lastTwoNumbers.currentNumber).pop();
  logger.debug(`[${lastMessage.guild.name}] last valid number: ${previousValidNumber}`);
  const duplicatedMessages = getDuplicatedNumbers(messages, lastTwoNumbers.currentNumber);
  lastMessage = duplicatedMessages.shift();
  duplicatedMessages.forEach((msg) => {
    // TODO dedicated duplicate message?
    handleWrongNumber(msg.channel, msg);
    deleteMessage(msg);
  });
  lastTwoNumbers['previousNumber'] = previousValidNumber;
  return lastMessage;
}

function verifySentMessage(lastMessage, messages) {
  const checkedNumbers = extractNumbersForChecks(messages);
  const lastTwoNumbers = {
    'previousNumber': checkedNumbers[checkedNumbers.length - 2],
    'currentNumber': checkedNumbers[checkedNumbers.length - 1],
  };
  if (isNaN(lastTwoNumbers.previousNumber) && isNaN(lastTwoNumbers.currentNumber)) {
    if (messages.every((msg) => !isContainingNumber(msg))) {
      logger.info(`[${lastMessage.guild.name}] Skipping further validation as counting doesn't start yet`);
      return;
    } else {
      logger.error(`[${lastMessage.guild.name}] Something really bad happen: two messages without numbers when there are other numbers in channel!`);
      throw WRONG_MESSAGE_FORMAT_ERROR;
    }
  }
  if ((isNaN(lastTwoNumbers.previousNumber)) && lastTwoNumbers.currentNumber !== 1) {
    logger.error(`[${lastMessage.guild.name} ${lastMessage.author.name}] tried to start game with value higher than 1!`);
    throw WRONG_NUMBER_POSTED_ERROR;
  }
  if (isNaN(lastTwoNumbers.currentNumber)) {
    logger.error(`[${lastMessage.guild.name}] ${lastMessage.author.name} sent message not starting with number.`);
    throw WRONG_MESSAGE_FORMAT_ERROR;
  }
  if (lastTwoNumbers.previousNumber === lastTwoNumbers.currentNumber) {
    lastMessage = handleDuplicatedLastMessages(lastMessage, checkedNumbers, lastTwoNumbers, messages);
  }
  if (!isNaN(lastTwoNumbers.previousNumber) && !isNewlyPostedNumberCorrect(lastTwoNumbers)) {
    throw WRONG_NUMBER_POSTED_ERROR;
  }
  if (lastTwoNumbers.currentNumber in PRIZED_NUMBERS) {
    fetchMessage(lastMessage).then(() => {
      handlePrizedNumberPosted(lastTwoNumbers.currentNumber, lastMessage);
    });
  }
  if (lastTwoNumbers.currentNumber === GAMEOVER_NUMBER) {
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
        .finally(() => logger.info(`[${lastMessage.guild.name}] Finished verification of message="${lastMessage.content}" from ${lastMessage.author.username}`));
  }
}

client.on('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('grę w cyferki', {type: 'WATCHING'});
  client.guilds.cache.forEach((server) => printRolesGrantedForNumberOnServer(server));
});

client.on('messageCreate', (message) => {
  verifyNewMessage(message);
});

client.login(process.env.CLIENT_TOKEN)
    .then(() => logger.info('Client logged in!'))
    .catch((error) => logger.error('Failed to login bot:', error));
