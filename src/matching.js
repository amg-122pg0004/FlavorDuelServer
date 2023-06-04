/**
 * @fileoverview /matchingエンドポイントの処理を記載するファイル
 */
import { createRoom, getRoomData } from './ingame.js'
export { matchingPost }

/**
 * 対戦相手検索中のID配列
 * @type {Array<string>}
 */
let matchingIdList = [];

/**
 * IDとデッキデータの連想配列
 * @type {string: Array<CardData>}
 */
let deckDataHashes = [];

/**
 * post受信 typeによって対戦相手検索の開始、確認、停止を行う
 * @param {*} receiveData 受信したデータ
 * @param {*} res httpレスポンス
 */
function matchingPost(receiveData, res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    switch (receiveData.type) {
        case 'StartMatching':
            addMatchingList(receiveData.id, receiveData.deck, res);
            break;
        case 'CheckMatching':
            checkMatchingList(receiveData.id, res);
            break;
        case 'StopMatching':
            deleteMatchingList(receiveData.id, res);
            break;
    }
    res.end('post received:');
}

/**
 * 対戦相手検索状況の確認
 * @param {string} playerID 確認するプレイヤーID
 * @param {*} res httpレスポンス
 */
function checkMatchingList(playerID, res) {
    let response = "";
    //マッチング更新
    updateMatching();
    //自身がマッチングされているか確認
    const room = getRoomData(playerID);
    if (room != null) {
        //マッチングしていれば部屋情報を返す
        response = {
            message: 'MatchingSuccess',
            room: room
        };
    } else {
        response = {
            message: 'FindingNow',
        };
    }
    res.write(JSON.stringify(response));
}

/**
 * 対戦相手検索を開始する
 * @param {string} playerID 開始するID
 * @param {*} deck プレイするデッキデータ
 * @param {*} res httpレスポンス
 */
function addMatchingList(playerID, deck, res) {
    //マッチングIDリストに自分のIDが無ければ追加
    if (!matchingIdList.includes(playerID)) {
        matchingIdList.push(playerID);
        if (deck != null) {
            deckDataHashes[playerID] = deck;
        }
    }
    checkMatchingList(playerID, res);
}

/**
 * 対戦相手検索を停止する
 * @param {string} playerID 停止するID
 * @param {*} res httpレスポンス 
 */
function deleteMatchingList(playerID, res) {
    matchingIdList.filter(function (matchingID) {
        return playerID != matchingID;
    });
    deckDataHashes.filter(function (matchingID) {
        return playerID != matchingID;
    });

    const response = {
        message: 'StopMatching',
    };
    res.write(JSON.stringify(response));
}

/**
 * 対戦相手がいれば部屋を作成する
 */
function updateMatching() {
    while (matchingIdList.length >= 2) {
        const player1ID = matchingIdList.at(0);
        const player2ID = matchingIdList.at(1);
        const deck1 = deckDataHashes[player1ID];
        const deck2 = deckDataHashes[player2ID];
        createRoom(player1ID, player2ID, deck1, deck2);
        matchingIdList.splice(0, 2);
    }
}