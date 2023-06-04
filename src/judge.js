/**
 * @fileoverview カードの勝敗判定処理を記載するファイル
 */

export { judgeType, judgeResult, judgeCards }

/**
 * 判定の種類
 * @enum {number}
 */
const judgeType = {
  higherAttack: 0,//攻撃力が高い
  higherDefence: 1,//守備力が高い
  higherTotal: 2,//合計値が高い
  lowerAttack: 3,//攻撃力が低い
  lowerDefence: 4,//守備力が低い
  lowerTotal: 5,//合計値が低い
}
/**
 * 判定の種類
 * @enum {number}
 */
const judgeResult = {
  player1Win: 0,
  player2Win: 1,
  Draw: 2,
}

/**
 * カードの勝敗判定を行う
 * @param {*} room この部屋内の場に出ているカード2枚を比較する
 * @returns player2が勝った場合trueを返す
 */
function judgeCards(room) {
  const attack1 = room.player1Data.battle.attack;
  const attack2 = room.player2Data.battle.attack;
  const defence1 = room.player1Data.battle.defence;
  const defence2 = room.player2Data.battle.defence;

  switch (room.judge) {
    case judgeType.higherAttack:
      if (attack1 == attack2) {
        return judgeResult.Draw;
      } else if (attack1 > attack2) {
        return judgeResult.player1Win;
      } else {
        return judgeResult.player2Win;
      }
    case judgeType.higherDefence:
      if (defence1 == defence2) {
        return judgeResult.Draw;
      } else if (defence1 > defence2) {
        return judgeResult.player1Win;
      } else {
        return judgeResult.player2Win;
      }
    case judgeType.higherTotal:
      if (attack1 + defence1 == attack2 + defence2) {
        return judgeResult.Draw;
      } else if (attack1 + defence1 > attack2 + defence2) {
        return judgeResult.player1Win;
      } else {
        return judgeResult.player2Win;
      }
    case judgeType.lowerAttack:
      if (attack1 == attack2) {
        return judgeResult.Draw;
      } else if (attack1 < attack2) {
        return judgeResult.player1Win;
      } else {
        return judgeResult.player2Win;
      }
    case judgeType.lowerDefence:
      if (defence1 == defence2) {
        return judgeResult.Draw;
      } else if (defence1 < defence2) {
        return judgeResult.player1Win;
      } else {
        return judgeResult.player2Win;
      }
    case judgeType.lowerTotal:
      if (attack1 + defence1 == attack2 + defence2) {
        return judgeResult.Draw;
      } else if (attack1 + defence1 < attack2 + defence2) {
        return judgeResult.player1Win;
      } else {
        return judgeResult.player2Win;
      }
  }
}