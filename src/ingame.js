/**
 * @fileoverview /ingameエンドポイントの処理を記載するファイル
 */

import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';
import { CardData, PlayerData, FieldData, RoomData } from './data-struct.js'
import sequence from './sequence-enum.js'
import { judgeCards } from "./judge.js";
export { ingamePost, createRoom, getRoomData }
dotenv.config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * 対戦中の部屋データ全て
 * @type {Array<RoomData>}
 */
let rooms = [];

/**
 * post受信 部屋が存在すれば現在の部屋データをレスポンスに入れる
 *          typeがPlayCardの場合はカードを場に出す処理を行う
 * @param {*} receiveData クライアントから受信したデータ
 * @param {*} res httpレスポンス
 */
function ingamePost(receiveData, res) {
    let room = getRoomData(receiveData.id);
    if (room != null) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        let playerData = getPlayerData(receiveData.id, room);
        switch (receiveData.type) {
            case 'PlayCard':
                if (room.state == sequence.waitPlay) {
                    playCard(room, playerData, receiveData);
                }
                responseRoomdata(room, res);
                break;
            case 'CheckRoom':
                responseRoomdata(room, res);
                break;
        }
    }
    res.end('post received:');
}

/**
 * 手札のカードを場に出す
 * @param {RoomData} room 実行する部屋
 * @param {PlayerData} playerData 実行するプレイヤー
 * @param {*} receiveData httpレスポンス
 */
function playCard(room, playerData, receiveData) {
    playerData.battle = receiveData.play;
    playerData.hand = playerData.hand.filter(function (item) {
        return item.name != playerData.battle.name;
    });
    //二人が場にカードを出していたら勝敗判定
    if (room.player1Data.battle.name != "" && room.player2Data.battle.name != "") {
        analyzeAndJudge(room);
        room.state = sequence.waitAnalyze;
    }
}

/**
 * 部屋データをクライアントに返す
 * @param {RoomData} serverRoom 実行する部屋 レスポンスプロパティ名でroomを使うために、被り避けで名前をserverRoomとしている
 * @param {*} res httpレスポンス
 */
function responseRoomdata(serverRoom, res) {
    let response = null;
    response = {
        message: 'responseRoomData',
        room: serverRoom
    };
    res.write(JSON.stringify(response));
}

/**
 * 場に出ているカードの強さを設定した後、勝敗を決める
 * @param {RoomData} room 実行する部屋
 */
async function analyzeAndJudge(room) {
    await analyzeCardData(room, room.player1Data.battle);
    await analyzeCardData(room, room.player2Data.battle);
    await turnEnd(room);
}

/**
 * ターン終了時の処理 場のカードの勝敗を決定後、ゲームを終了するか次のターンを始める
 * @param {RoomData} room 実行する部屋
 */
async function turnEnd(room) {
    const result = judgeCards(room);
    if (result) {
        room.player2Data.win++;
    } else {
        room.player1Data.win++;
    }
    room.player1Data.oldBattle = room.player1Data.battle;
    room.player2Data.oldBattle = room.player2Data.battle;
    room.player1Data.battle = new CardData("", -1, "");
    room.player2Data.battle = new CardData("", -1, "");

    if (room.player1Data.win >= 3 || room.player2Data.win >= 3) {
        room.state = sequence.finishGame;
    } else {
        room.state = sequence.waitPlay;
        drawCard(room.player1Data);
        drawCard(room.player2Data);
    }
}

/**
 * 部屋を作成する
 * @param {string} player1ID プレイヤー1のID
 * @param {string} player2ID プレイヤー2のID
 * @param {Array<CardData>} deck1 プレイヤー1のデッキ
 * @param {Array<CardData>} deck2 プレイヤー2のデッキ
 */
function createRoom(player1ID, player2ID, deck1, deck2) {
    const player1 = new PlayerData(player1ID, deck1);
    const player2 = new PlayerData(player2ID, deck2);
    const field = new FieldData(0, 0);
    let room = new RoomData(player1, player2, field);
    shuffleDeck(room.player1Data);
    shuffleDeck(room.player2Data);
    for (let i = 0; i < 5; ++i) {
        drawCard(room.player1Data);
        drawCard(room.player2Data);
    }
    rooms.push(room);
}

/**
 * 特定のプレイヤーIDが存在する部屋を検索する
 * @param {string} playerID プレイヤーID
 * @returns 存在すれば部屋、存在しなければnullを返す
 */
function getRoomData(playerID) {
    for (let room of rooms) {
        if (room.player1Data.id === playerID || room.player2Data.id === playerID) {
            return room;
        }
    }
    return null;
}

/**
 * プレイヤーID、部屋からプレイヤーデータを取得する
 * @param {string} playerID プレイヤーID
 * @param {RoomData} room 検索する部屋
 * @returns 対応するプレイヤーデータ、存在しなければnull
 */
function getPlayerData(playerID, room) {
    if (room.player1Data.id === playerID) {
        return room.player1Data;
    }
    if (room.player2Data.id === playerID) {
        return room.player2Data;
    }
    return null;
}

/**
 * デッキのシャッフルを行う
 * @param {PlayerData} playerData 実行するプレイヤー
 */
function shuffleDeck(playerData) {
    const cloneArray = [...playerData.deck];
    for (let i = cloneArray.length - 1; i >= 0; i--) {
        let rand = Math.floor(Math.random() * (i + 1));
        // 配列の要素の順番を入れ替える
        let tmpStorage = cloneArray[i];
        cloneArray[i] = cloneArray[rand];
        cloneArray[rand] = tmpStorage;
    }

    playerData.deck = cloneArray;
}

/**
 * カードを1枚、デッキから手札に加える
 * @param {PlayerData} playerData 実行するプレイヤー
 */
function drawCard(playerData) {
    playerData.hand.push(playerData.deck.shift());
}

/**
 * カードの強さをChatGPTに設定してもらう
 * @param {RoomData} room 実行する部屋
 * @param {CardData} battle 強さを設定する、場に出ているカード
 */
async function analyzeCardData(room, battle) {
    const openai = new OpenAIApi(configuration);

    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `
          Json形式で回答しなさい。回答は"{"で始め"}"で終わりなさい。
          "attack"と,"defense"と"reason"をキーとした回答のみしなさい。
          カードの名前とその設定や世界観を示すテキストがあります。
  
          名前:${battle.name}
          テキスト:${battle.text}
          
          名前とテキストを参考にカードの"attack"と,"defense"を設定します。
          "attack"と,"defense"は0から10の間です。平均的な"attack"と,"defense"の値は5です。
          "atatck"はカードの名前とテキストの中に、強暴な気性、武器を持つ、鋭利な形状を持つ、攻撃的な能力を持つなどの要素を持つほど高く設定します。
          それらが無い場合は低く設定します。
          "defense"はカードの名前とテキストの中に、大らかな気性、鎧を身に着ける、盾を持つ、固い鱗や殻に覆われている、防御的な能力を持つなどの要素を持つほど高く設定します。
          それらが無い場合は低く設定します。
          そのカードの"atatck"と"defense"を設定した理由を"reason"として男性のくだけた口調で話す。
          短く一言でまとめる。「あいつは」という時は代わりに「そいつは」と言う。
          数字は話してはいけない。`,
        temperature: 0.6,
        max_tokens: 1500,
    });
    console.log(battle.name);
    console.log(battle.text);
    console.log(completion.data.choices[0].text);
    try {
        const parseData = JSON.parse(completion.data.choices[0].text);
        battle.attack = parseData.attack * 100;
        battle.defence = parseData.defense * 100;
        room.messageLog.push(parseData.reason);
    } catch (error) {
        console.log(error);
        analyzeCardData(room, battle);
    }

}