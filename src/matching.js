import * as data from './data-struct.js'

class Pair {
    constructor(id1, id2) {
        this.player1 = new data.PlayerData(id1);
        this.player2 = new data.PlayerData(id2);
        this.player1comfirm = false;
        this.player2comfirm = false;
    }
}
let matchingIdList = [];//マッチング検索中のID配列
let pairList = [];//ペアクラス配列

export { Post, Get ,matchingIdList ,pairList }

function Post(receiveData, res) {
    switch (receiveData.type) {
        case 'StartMatching':
            addMatchingList(receiveData.id, res);
            break;
        case 'StopMatching':
            deleteMatchingList(receiveData.id, res);
            break;
    }
    res.end('post received:');
}

function Get(res) {
    if (matchingIdList.length() >= 2) {
        pairList.push(new Pair(matchingIdList.at(0), matchingIdList.at(1)));
        matchingIdList.splice(0, 2);
    }
    let pairCheck = false;
    let opponentData = null;
    for (let pair of pairList) {
        if (pair.player1.id === playerID) {
            pair.player1comfirm = true;
            pairCheck = true;
        }
        else if (pair.player2.id === playerID) {
            pair.player2comfirm = true;
            pairCheck = true;
        }
    }
    pairList.filter(function (pair) {
        return !(pair.player1comfirm && pair.player2comfirm)
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    const response = {
        message: 'BeginMatching',
        opponent: opponentData
    };

    res.write(JSON.stringify(response));
}

function addMatchingList(playerID, res) {
    if (!matchingIdList.includes(playerID)) {
        let pairCheck = false;
        for (let pair of pairList) {
            if (pair.player1.id === playerID || pair.player2.id === playerID) {
                pairCheck = true;
            }
        }
        if (!pairCheck) {
            matchingIdList.push(playerID);
        }
    }
    if (matchingIdList.length >= 2) {
        pairList.push(new Pair(matchingIdList.at(0), matchingIdList.at(1)));
        matchingIdList.splice(0, 2);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const response = {
        message: 'BeginMatching',
    };
    res.write(JSON.stringify(response));
}

function deleteMatchingList(playerID, res) {
    matchingIdList.filter(function (matchingID) {
        return playerID != matchingID;
    });

    let deletePair = null;
    for (let pair of pairList) {
        if (pair.player1.id === playerID) {
            matchingIdList.add(pair.player2.id);
            deletePair = pair;
            break;
        }
        else if (pair.player2.id === playerID) {
            matchingIdList.add(pair.player1.id);
            deletePair = pair;
            break;
        }
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const response = {
        message: 'StopMatching',
    };
    res.write(JSON.stringify(response));
}