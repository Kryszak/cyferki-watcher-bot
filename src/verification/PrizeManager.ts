import Globals from "../Globals";
import RoleAdder from "../discord/RoleAdder";
import NumbersUnderVerification from "./NumbersUnderVerification";
import MessageFetcher from "../discord/MessageFetcher";
import {injectable} from "inversify";
import "reflect-metadata";

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

  checkForWonRole(lastTwoNumbers: NumbersUnderVerification, lastMessage): void {
    if (lastTwoNumbers.currentNumber in this.globals.getRanks()) {
      this.messageFetcher.fetchMessage(lastMessage).then(() => {
        const wonRoleId = this.globals.getRanks()[lastTwoNumbers.currentNumber];
        this.roleAdder.addRoleToUser(lastMessage, wonRoleId);
      });
    }
  }
}