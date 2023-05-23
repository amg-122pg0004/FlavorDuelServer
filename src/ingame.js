import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';

export let rooms = [];

function cardData(name,cg,flavortext,attack,defence) {
    this.name = name;
    this.cg = cg;
    this.flavortext = flavortext;
    this.attack = attack;
    this.defence = defence;
}

function playerData(id, deck, hand, win) {
    this.id = id;
    this.deck = deck;
    this.hand = hand;
    this.win = win;
}

function fieldData(pickCard,deck) {
    this.pickCard = pickCard;
    this.deck = deck;
}

function RoomData(player1Data,player2Data,fieldData) {
    this.player1Data = player1Data;
    this.player2Data = player2Data;
    this.fieldData = fieldData;
}

export default function CreateRoom(player1ID,player2ID){
    let player1 = new playerData(player1ID,0,0,0);
    let player2 = new playerData(player2ID,0,0,0);
    let field = new fieldData(0,0);
    rooms.push(new RoomData(player1,player2,field));
}

export default function SetDeckData(playerData,DeckData){
    playerData.deck = DeckData;
}



export default async function AnalyzeCardData(input) {
    const openai = new OpenAIApi(configuration);

    dotenv.config();
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `
          Json形式で回答しなさい。回答は"{"で始め"}"で終わりなさい。
          "attack"と,"defense"と"reason"をキーとした回答のみしなさい。
          カードの名前とその設定や世界観を示すテキストがあります。
  
          名前:${input.name}
          テキスト:${input.text}
          
          名前とテキストを参考にカードの"attack"と,"defense"を設定します。
          "attack"と,"defense"は0から10の間です。平均的な"attack"と,"defense"の値は5です。
          "atatck"はカードの名前とテキストの中に、強暴な気性、武器を持つ、鋭利な形状を持つ、攻撃的な能力を持つなどの要素を持つほど高く設定します。
          それらが無い場合は低く設定します。
          "defense"はカードの名前とテキストの中に、大らかな気性、鎧を身に着ける、盾を持つ、固い鱗や殻に覆われている、防御的な能力を持つなどの要素を持つほど高く設定します。
          それらが無い場合は低く設定します。
          そのカードの"atatck"と"defense"を設定した理由を"reason"として50代男性のくだけた口調で話す。
          短く一言でまとめる。「あいつは」という時は代わりに「そいつは」と言う。
          数字は話してはいけない。`,
        temperature: 0.6,
        max_tokens: 1500,
    });
    console.log(input.name);
    console.log(input.text);
    console.log(completion.data.choices[0].text);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    const encodeData = encodeURI(completion.data.choices[0].text);
    res.write(encodeData);
    res.end('post received:');
    return completion;
}