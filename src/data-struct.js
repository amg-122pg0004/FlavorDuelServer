/**
 * @fileoverview 使用する構造体を記載するファイル
 */

import { judgeType } from './judge.js'
import Sequence from './sequence-enum.js'
export { CardData, PlayerData, FieldData, RoomData }

/**
 * カード1枚のデータ構造
 */
class CardData {
    /**
     * @param {string} name カード名
     * @param {int} cg カードの画像番号
     * @param {string} flavortext カードの説明文
     */
    constructor(name, cg, flavortext) {
        this.name = name;
        this.cg = cg;
        this.flavortext = flavortext;
        this.attack = -1;//攻撃力
        this.defence = -1; //守備力
    }
}

/**
 * プレイヤー1人のデータ構造
 */
class PlayerData {
    /**
     * @param {string} id ユーザーID
     * @param {Array<CardData>} DeckData デッキデータ
     */
    constructor(id, DeckData) {
        this.id = id;
        this.deck = DeckData;
        this.hand = [];//手札
        this.battle = new CardData("", -1, "");//場に出ているカード
        this.oldBattle = new CardData("", -1, "");//前に場に出ていたカード
        this.win = 0;//勝利数
    }
}

/**
 * フィールドカードのデータ構造
 */
class FieldData {
    constructor(pickCard, deck) {
        this.pickCard = pickCard;
        this.deck = deck;
    }
}

/**
 * 部屋のデータ構造
 */
class RoomData {
    /**
     * @param {PlayerData} player1Data プレイヤー1のデータ
     * @param {PlayerData} player2Data プレイヤー2のデータ
     * @param {*} fieldData フィールドカードデータ
     */
    constructor(player1Data, player2Data, fieldData) {
        this.player1Data = player1Data;
        this.player2Data = player2Data;
        this.fieldData = fieldData;
        this.judge = judgeType.higherAttack;//勝敗判定タイプ
        this.state = Sequence.waitPlay;//現在のゲーム状態
        this.messageLog = [];//メッセージの文字列配列
    }
}