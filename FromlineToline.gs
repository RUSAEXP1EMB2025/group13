function doPost(e) 
{
  /************************************************************************************/
  /*Webhookで取得したJSONデータをオブジェクト化し取得*/
  const eventData = JSON.parse(e.postData.contents).events[0];

  /*取得したデータから応答用のトークンを取得*/
  const replyToken = eventData.replyToken;
  /*取得したデータから、ユーザーが投稿したメッセージを取得*/
  var userMessage = eventData.message.text;
  
  /*ユーザの状態*/
  var userState = get_state();

  /*スプレッドシート*/
  const spreadsheetId = '1QNwMOOJdy_wAieiYTr-pxlXUEK3emcSUGS8f_rC8Oys';
  const sheetName = 'recept';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  const userId = eventData.userId;
  const timestamp = new Date();
  /**************************************************************************************/
  
  if(userMessage == "録画予約"){
    set_state("waiting for channel");
    var str = "録画予約ですね。\n録画予約を行いたい番組のチャンネルを送信して下さい。(1から12の半角整数1桁)";
    reply(replyToken, str);
    sheet.appendRow([timestamp, userId, userMessage]); /*シートへの書き込み*/
  } 
  else if (userState === "waiting for channel") {
    let num = parseInt(userMessage, 10); /* 文字列を数字に変換 */

    if (num >=1 && num<=12) {
      set_state("waiting for time");
      var str = `チャンネル ${userMessage} を受け付けました。\n\n録画開始時刻 (MMDDhhmm)\n（例：06132030）\n\nを送信してください。`;
      reply(replyToken, str);
      sheet.appendRow([timestamp, userId, userMessage]);
    } else {
      var str = "チャンネル番号は1〜12の数字で入力してください。";
      reply(replyToken, str);
    }
  } 
  else if (userState === "waiting for time") {
    var num = parseInt(userMessage, 10); /* 文字列を10進数に変換 */

    /*それぞれの要素を抽出*/
    var MM = Math.floor(num/1000000);
    var dd = (Math.floor(num/10000))%100;
    var hh = (Math.floor(num/100))%100;
    var mm = num%100;

    /*今日の日付を取得*/
    var today = get_date();

    if(MM>12|MM<1|dd>31|dd<1|hh>23|hh<0|mm>59|mm<0){
      var str = "正しい値を入力して下さい。\n(MMddhhmm 時間は24時間表記)";
      reply(replyToken, str);
    }

    if(dd>today+1 | dd<today){
      var str = "録画予約は明日分までです。";
      reply(replyToken, str);
    } else {
      var str = `録画開始時刻 ${MM}月${dd}日${hh}時${mm}分 を受け付けました。`;
      reply(replyToken, str);
      sheet.appendRow([timestamp, userId, userMessage]);
    }
  }
  else{
    messages.push({ type: "text", text: "録画予約を始めるには「録画予約」と送信してください。" });
  }
}

/*LINE返信*****************************************************************************/
function reply(replyToken, str)
{
  /*LINE Messaging APIのチャネルアクセストークン*/
  const token = "INsg8sldBg9Su5MWmq1fSaocNHICXVAZ1v1tzRyNqBvvdnApPG/7H6jssdfbzuQeTyfasVpJOdZWrqrS05/WsEI3hQBZbzQemZv4C720uzXffyPJjuMI31pBTicEYTVFIjuz8R7YUxoZWG3kkLZtWgdB04t89/1O/w1cDnyilFU=";

  /*応答メッセージ用のAPI URL*/
  const url = 'https://api.line.me/v2/bot/message/reply';

  var messages = [];

  messages.push({ type: "text", text: str});

  /*APIリクエスト時にセットするペイロード値を設定する*/
  const payload = {
    'replyToken': replyToken,
    'messages': messages
  };

  /*HTTPSのPOST時のオプションパラメータを設定する*/
  const options = {
    'payload': JSON.stringify(payload),
    'myamethod': 'POST',
    'headers': { "Authorization": "Bearer " + token },
    'contentType': 'application/json'
  };

  /*LINE Messaging APIにリクエストし、ユーザーからの投稿に返答*/
  UrlFetchApp.fetch(url, options);
}

/*今日の日付取得*****************************************************************************/
function get_date()
{
  var currentDate = new Date();
  var date = currentDate.getDay;

  return date;
}

/*ユーザの状態設定**********************************************************************/
function set_state(state)
{
  PropertiesService.getScriptProperties().setProperty("userState", state.toString());
}

/*ユーザの状態取得***********************************************************************/
function get_state()
{
  const state = PropertiesService.getScriptProperties().getProperty("userState");
  return state;
}
