/**
 * ゲームの進行状況を示す列挙型データ
 * @type {int}
 */
const Sequence ={
    beginGame:1,
    startTurn:2,
    waitPlay:3,
    waitAnalyze:4,
    judge:5,
    endTurn:6,
    finishGame:7,
}
export default Sequence;