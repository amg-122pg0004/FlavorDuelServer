export { judgeType, judgeCards }
const judgeType = {
  higherAttack: 0,
  higherDefence: 1,
  higherTotal: 2,
  lowerAttack: 3,
  lowerDefence: 4,
  lowerTotal: 5,
}

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