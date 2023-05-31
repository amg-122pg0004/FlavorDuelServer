/**
 * @fileoverview カードの勝敗判定処理を記載するファイル
 */

export { judgeType, judgeCards }

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
      return (attack1 < attack2);
    case judgeType.higherDefence:
      return (defence1 < defence2);
    case judgeType.higherTotal:
      return (attack1 + defence1 < attack2 + defence2);
    case judgeType.lowerAttack:
      return (attack1 > attack2);
    case judgeType.lowerDefence:
      return (defence1 > defence2);
    case judgeType.lowerTotal:
      return (attack1 + defence1 > attack2 + defence2);
  }
}