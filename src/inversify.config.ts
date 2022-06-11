import {Container} from "inversify";
import ChannelUtils from "./discord/ChannelUtils";
import MessageFetcher from "./discord/MessageFetcher";
import MessageSender from "./discord/MessageSender";
import MessageUtils from "./discord/MessageUtils";
import RoleAdder from "./discord/RoleAdder";
import LoggerFactory from "./logging/LoggerFactory";
import ErrorHandler from "./verification/ErrorHandler";
import PrizeManager from "./verification/PrizeManager";
import MessageVerificator from "./verification/MessageVerificator";
import Globals from "./Globals";
import GameoverManager from "./verification/GameoverManager";
import MessageDeleter from "./discord/MessageDeleter";

const container: Container = new Container();
container.bind<Globals>(Globals).toSelf();
container.bind<ChannelUtils>(ChannelUtils).toSelf();
container.bind<MessageFetcher>(MessageFetcher).toSelf();
container.bind<MessageSender>(MessageSender).toSelf();
container.bind<MessageUtils>(MessageUtils).toSelf();
container.bind<RoleAdder>(RoleAdder).toSelf();
container.bind<LoggerFactory>(LoggerFactory).toSelf();
container.bind<ErrorHandler>(ErrorHandler).toSelf();
container.bind<PrizeManager>(PrizeManager).toSelf();
container.bind<GameoverManager>(GameoverManager).toSelf();
container.bind<MessageVerificator>(MessageVerificator).toSelf();
container.bind<MessageDeleter>(MessageDeleter).toSelf();

export {container};