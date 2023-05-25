import * as judge2 from './judge.js'
import Sequence from './sequence-enum.js'
export { CardData, PlayerData, FieldData, RoomData }

class CardData {
    constructor(name, cg, flavortext) {
        this.name = name;
        this.cg = cg;
        this.flavortext = flavortext;
        this.attack = -1;
        this.defence = -1;
    }
}

class PlayerData {
    constructor(id, DeckData) {
        this.id = id;
        this.deck = DeckData;
        this.hand = [];
        this.battle = new CardData("", -1, "");
        this.oldBattle = new CardData("", -1, "");
        this.win = 0;
    }
    setHandData(HandData) {
        this.hand = HandData;
    }
    incrementWin() {
        this.win++;
    }
    getWin() {
        return this.win;
    }
}

class FieldData {
    constructor(pickCard, deck) {
        this.pickCard = pickCard;
        this.deck = deck;
    }
}

class RoomData {
    constructor(player1Data, player2Data, fieldData) {
        this.player1Data = player1Data;
        this.player2Data = player2Data;
        this.fieldData = fieldData;
        this.judge = judge2.judgeType.higherAttack;
        this.state = Sequence.waitPlay;
        this.messageLog = [];
    }
}