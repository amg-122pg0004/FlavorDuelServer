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
    constructor(id) {
        this.id = id;
        this.deck = null;
        this.hand = null;
        this.battle = null;
        this.win = 0;
    }
    setDeckData(DeckData) {
        this.deck = DeckData;
    }
    setHandData(HandData) {
        this.hand = HandData;
    }
    incrementWin() {
        this.win++;
    }
    getWin(){
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
    }
}