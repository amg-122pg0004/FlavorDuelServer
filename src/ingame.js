/**
 * @fileoverview /ingameエンドポイントの処理を記載するファイル
 */

import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';
import { CardData, PlayerData, FieldData, RoomData } from './data-struct.js'
import sequence from './sequence-enum.js'
import { judgeCards, judgeResult } from "./judge.js";
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
                playCard(room, playerData, receiveData);
                break;
            case 'ConfirmJudge':
                clearBattle(room, playerData);
                break;
            case 'CheckRoom':
                break;
        }
        responseRoomdata(room, res);
    }
    res.end('post received:');
    if (room != null) {
        if (room.state == sequence.finishGame &&
            room.player1Data.judgeConfirm &&
            room.player2Data.judgeConfirm) {
            deleteRoom(room);
        }
    }
}

/**
 * 手札のカードを場に出す
 * @param {RoomData} room 実行する部屋
 * @param {PlayerData} playerData 実行するプレイヤー
 * @param {*} receiveData httpレスポンス
 */
function playCard(room, playerData, receiveData) {
    if (playerData.battle.name != "") {
        return;
    }
    playerData.battle = receiveData.play;
    playerData.hand = playerData.hand.filter(function (item) {
        return item.name != playerData.battle.name;
    });
    //二人が場にカードを出していたら勝敗判定
    if (room.player1Data.battle.name != "" &&
        room.player2Data.battle.name != ""
        && room.state != sequence.waitAnalyze) {
        analyzeAndJudge(room);
        room.state = sequence.waitAnalyze;
    }
}

/**
 * プレイ後のカードをクリアする
 * @param {RoomData} room 実行する部屋
 * @param {PlayerData} playerData 実行するプレイヤー
 */
function clearBattle(room, playerData) {
    playerData.judgeConfirm = true;

    if (room.player1Data.win >= 3 || room.player2Data.win >= 3) {
        room.state = sequence.finishGame;
    }
    else if (room.player1Data.judgeConfirm && room.player2Data.judgeConfirm) {
        room.player1Data.battle = new CardData("", -1, "");
        room.player2Data.battle = new CardData("", -1, "");
        room.player1Data.judgeConfirm = false;
        room.player2Data.judgeConfirm = false;

        room.state = sequence.waitPlay;
        drawCard(room.player1Data);
        drawCard(room.player2Data);
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
    if (room.player1Data.battle.attack == -1) {
        await analyzeCardData(room, room.player1Data.battle);
    }
    if (room.player2Data.battle.attack == -1) {
        await analyzeCardData(room, room.player2Data.battle);
    }
    if (room.player1Data.battle.attack != -1 && room.player2Data.battle.attack != -1) {
        await turnEnd(room);
    } else {
        await analyzeAndJudge(room);
    }
}

/**
 * 勝敗を決定して勝利数をカウントアップする
 * @param {RoomData} room 実行する部屋
 */
async function turnEnd(room) {
    const result = judgeCards(room);
    switch (result) {
        case judgeResult.Draw:
            room.player1Data.win++;
            room.player2Data.win++;
            break;
        case judgeResult.player1Win:
            room.player1Data.win++;
            break;
        case judgeResult.player2Win:
            room.player2Data.win++;
            break;
    }
    room.state = sequence.judge;
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
 * 部屋削除
 * @param {RoomData} room 削除する部屋
 */
function deleteRoom(room) {
    rooms = rooms.filter(function (item) {
        return item != room;
    });
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
          テキスト:${battle.flavortext}
          
          名前とテキストを参考にカードの"attack"と,"defense"を設定します。
          "attack"と,"defense"は0から10の間です。平均的な"attack"と,"defense"の値は5です。
          "atatck"はカードの名前とテキストの中に、強暴な気性、武器を持つ、鋭利な形状を持つ、攻撃的な能力を持つなどの要素を持つほど高くなります。
          優しい性格、武器を持たない、柔らかい材質、力が弱い、体が小さいなどの要素を持つほど低くなります。
          "defense"はカードの名前とテキストの中に、大らかな気性、鎧を身に着ける、盾を持つ、固い鱗や殻に覆われている、防御的な能力を持つなどの要素を持つほど高くなります。
          神経質な性格、服を着ていない、柔らかい材質、筋肉が少ない、体が小さいなどの要素を持つほど低くなります。
          "reason"はカードの強さの理由をユニークに2文でまとめる。
          "reason"は${battle.name}は、から始める。
          "reason"で数値は使いません。
          "reason"内でattack、攻撃力、defence、防御力、という言葉は使用禁止です。
          "reason"ではテキストに書かれていない事柄も追加します。{`,
        temperature: 0.6,
        max_tokens: 1500,
    });
    console.log(battle.name);
    console.log(battle.text);
    console.log(completion.data.choices[0].text);
    try {
        const parseData = JSON.parse('{' + completion.data.choices[0].text);
        battle.attack = parseData.attack * 100;
        battle.defence = parseData.defense * 100;
        room.messageLog.push(parseData.reason);
    } catch (error) {
        console.log(error);
    }

}