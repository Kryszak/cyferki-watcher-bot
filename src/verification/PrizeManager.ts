import Globals from "../Globals";
import RoleAdder from "../discord/RoleAdder";
import VerifiedNumbers from "./VerifiedNumbers";
import MessageFetcher from "../discord/MessageFetcher";
import {injectable} from "inversify";
import "reflect-metadata";
import {Message} from "discord.js";

@injectable()
export default class PrizeManager {
  private globals: Globals;
  private roleAdder: RoleAdder;
  private messageFetcher: MessageFetcher;

  constructor(globals: Globals,
              roleAdder: RoleAdder,
              messageFetcher: MessageFetcher) {
    this.globals = globals;
    this.roleAdder = roleAdder;
    this.messageFetcher = messageFetcher;
  }

  checkForWonRole(lastTwoNumbers: VerifiedNumbers, lastMessage: Message): void {
    if (lastTwoNumbers.currentNumber in this.globals.getRanks()) {
      this.messageFetcher.fetchMessage(lastMessage).then(() => {
        const wonRoleId: string = this.globals.getRanks()[lastTwoNumbers.currentNumber];
        this.roleAdder.addRoleToUser(lastMessage, wonRoleId);
      });
    }
  }
}