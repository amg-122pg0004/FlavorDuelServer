import * as data from './data-struct.js'
import * as ingame from './ingame.js'
export { Post, getMatchingIDList, setMatchingIDList,getDeckDataHashes }

let matchingIdList = [];//マッチング検索中のID配列
function getMatchingIDList() {
    return matchingIdList;
}
function setMatchingIDList(array) {
    matchingIdList = array;
}

let deckDataHashes = [];//IDとデッキデータの連想配列
function getDeckDataHashes() {
    return matchingIdList;
}

function Post(receiveData, res) {
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

//自身のマッチング状況の確認
function checkMatchingList(playerID, res) {
    let response = "";
    //マッチング更新
    updateMatching();
    //自身がマッチングされているか確認
    const room = ingame.getRoomData(playerID);
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

//自身のマッチング開始
function addMatchingList(playerID, deck, res) {
    //マッチングIDリストに自分のIDが無ければ追加
    if (!matchingIdList.includes(playerID)) {
        matchingIdList.push(playerID);
        if(deck!=null){
            deckDataHashes[playerID] = deck;
        }
    }
    checkMatchingList(playerID, res);
}

//自身のマッチング停止
function deleteMatchingList(playerID, res) {
    matchingIdList.filter(function (matchingID) {
        return playerID != matchingID;
    });

    const response = {
        message: 'StopMatching',
    };
    res.write(JSON.stringify(response));
}

//マッチングが可能であれば作成
function updateMatching() {
    while (matchingIdList.length >= 2) {
        const player1ID = matchingIdList.at(0);
        const player2ID = matchingIdList.at(1);
        const deck1 = deckDataHashes[player1ID];
        const deck2 = deckDataHashes[player2ID];
        ingame.createRoom(player1ID, player2ID, deck1, deck2);
        matchingIdList.splice(0, 2);
    }
}