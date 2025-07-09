/*スプレッドシート*/
const spreadsheetId = '1QNwMOOJdy_wAieiYTr-pxlXUEK3emcSUGS8f_rC8Oys';

const recept_sheetName = 'recept';
const r_sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(recept_sheetName); 

const post_sheetName = 'post';
const p_sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(post_sheetName);

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

  const userId = eventData.source.userId;
  const today = new Date();
  /**************************************************************************************/
  
  if(userMessage == "録画予約"){
    set_state("waiting for channel");
    var str = "録画予約ですね。\n録画予約を行いたい番組のチャンネルを送信して下さい。(1から12の半角整数1桁)";
    reply(replyToken, str);
    r_sheet.appendRow([today, userId, userMessage]); /*シートへの書き込み*/
    return;
  } 
  else if (userState === "waiting for channel") {
    let num = parseInt(userMessage, 10); /* 文字列を数字に変換 */

    if (num >=1 && num<=12) {
      set_state("waiting for time");
      var str = `チャンネル ${userMessage} を受け付けました。\n\n録画開始時刻 (MMDDhhmm)\n（例：06132030）\n\nを送信してください。`;
      reply(replyToken, str);
      r_sheet.appendRow([today, userId, userMessage]);
      return;
    } else {
      var str = "チャンネル番号は1〜12の半角数字で入力してください。";
      reply(replyToken, str);
      return;
    }
  } 
  else if (userState === "waiting for time") {
    var num = parseInt(userMessage, 10); /* 文字列を10進数に変換 */

    /*それぞれの要素を抽出*/
    var MM = Math.floor(num/1000000);
    var DD = (Math.floor(num/10000))%100;
    var hh = (Math.floor(num/100))%100;
    var mm = num%100;

    /*今日の日付を取得*/
    var date = today.getDate();

    if(MM>12||MM<1||DD>31||DD<1||hh>23||hh<0||mm>59||mm<0){
      set_state("waiting for time");
      var str = "正しい値を入力して下さい。\n(MMddhhmm 時間は24時間表記)";
      reply(replyToken, str);
      return;
    }

    if(DD>date+1 || date>DD){
      var str = "録画予約は明日分までです。";
      reply(replyToken, str);
      return;
    } else {
      set_state("complete")
      var str = `録画開始時刻 ${MM}月${DD}日${hh}時${mm}分 を受け付けました。`;
      reply(replyToken, str);
      r_sheet.appendRow([today, userId, userMessage]);

      relay(); /* recept から post への書き換え */
      sort();  /* post に書き込まれたデータの並び替え */
      createAutoCheckTrigger();

      return;
    }
  }
  else if(userState === "complete"){
    var str = "録画予約を始めるには、\n\n録画予約\n\nと送信してください。"
    reply(replyToken, str);
    return;
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

  //APIリクエスト時にセットするペイロード値を設定する
  const payload = {
    'replyToken': replyToken,
    'messages': messages
  };

  //HTTPSのPOST時のオプションパラメータを設定する
  const options = {
    'payload': JSON.stringify(payload),
    'myamethod': 'POST',
    'headers': { "Authorization": "Bearer " + token },
    'contentType': 'application/json'
  };

  //LINE Messaging APIにリクエストし、ユーザーからの投稿に返答する
  UrlFetchApp.fetch(url, options);
}

/*ユーザの状態設定**********************************************************************/
function set_state(state)
{
  PropertiesService.getScriptProperties().setProperty("userState", state.toString());
}
/*************************************************************************************/

/*ユーザの状態取得***********************************************************************/
function get_state()
{
  const state = PropertiesService.getScriptProperties().getProperty("userState");
  return state;
}
/**************************************************************************************/

function relay() {
  const valueC2 = r_sheet.getRange(2, 3).getValue();
  const valueC3 = r_sheet.getRange(3, 3).getValue();
  const valueC4 = r_sheet.getRange(4, 3).getValue();
  const NotTriggered = 0

  if (valueC2 === '録画予約' && typeof valueC3 === 'number' && typeof valueC4 === 'number') {
    Logger.log('入力受付');

    const lastRowSheet2 = p_sheet.getLastRow();
    p_sheet.getRange(lastRowSheet2 + 1, 1).setValue(valueC3);
    p_sheet.getRange(lastRowSheet2 + 1, 2).setValue(valueC4);
    p_sheet.getRange(lastRowSheet2 + 1, 4).setValue(NotTriggered);

    // 書き込み後、receptの内容をクリア
    const rangeToClear = r_sheet.getRange(2, 1, 3, 3);
    rangeToClear.clearContent();
  }
}

function sort() {
  let data=p_sheet.getRange(1,1,100,3);
  data.sort({column:2,ascending: true})
}

// 1分ごとの自動チェック用トリガーを作成（初回1回だけ実行）
function createAutoCheckTrigger() {
  ScriptApp.newTrigger("checkAndTrigger")
    .timeBased()
    .everyMinutes(1)
    .create();
}

// 予約データをチェックして、必要な行に対してトリガーを設定
function checkAndTrigger() {
  const lastRow = p_sheet.getLastRow();

  for (let row = 1; row <= lastRow; row++) {
    const channel = p_sheet.getRange(row, 1).getValue();   // A列：チャンネル
    let dateValue = p_sheet.getRange(row, 2).getValue();   // B列：数値 (例: 6252200)
    const triggered = p_sheet.getRange(row, 3).getValue(); // C列：トリガー時刻

    if (!dateValue || triggered) continue;//録画時刻(B列)が空もしくはC列に値が入っている(トリガー作成済み)

    // 数値であることを確認し、文字列に変換してゼロ埋めする
    // 例: 6252200 -> "06252200"
    let dateStr;
    if (typeof dateValue === 'number') {
      // toString() で文字列化し、padStart(8, '0') で8桁になるまで先頭にゼロを埋める
      dateStr = String(dateValue).padStart(8, '0'); 
    } else {
      // 数値以外の予期せぬ値が入っていた場合、スキップするかエラーにする
      continue; 
    }

    // 変換後の文字列が本当に8桁か、数値のみで構成されているかを確認
    if (dateStr.length !== 8 || !/^\d{8}$/.test(dateStr)) {
      continue;
    }

    const m_month = parseInt(dateStr.substring(0, 2), 10) - 1; // mm
    const m_day   = parseInt(dateStr.substring(2, 4), 10);     // dd
    const m_hour  = parseInt(dateStr.substring(4, 6), 10);     // hh
    const m_min   = parseInt(dateStr.substring(6, 8), 10);     // mm
    const m_year  = new Date().getFullYear(); // 現在の年を使用

    const triggerTime = new Date(m_year, m_month, m_day, m_hour, m_min - 2);//録画開始時刻の２分前に録画

    // 過去の時間なら無視
    if (triggerTime <= new Date()) {
        continue; 
    }

    // C列にトリガー実行予定時刻を記録（後で行を特定するため）
    p_sheet.getRange(row, 3).setValue(triggerTime);

    // トリガーを作成（共通の関数を実行）
    ScriptApp.newTrigger("runRemoAtScheduledTime")
      .timeBased()
      .at(triggerTime)
      .create();
  }
}

// 実行時刻と一致する行を検索して処理
function runRemoAtScheduledTime() {
  /*const sheet = getSheet();*/
  const m_now = new Date();
  const lastRow = p_sheet.getLastRow();

  for (let row = 1; row <= lastRow; row++) {
    const targetValue = p_sheet.getRange(row, 3).getValue(); // C列：トリガー時刻 (Dateオブジェクトまたは文字列"done")

    //C列が空もしくはdone
    if (!targetValue || (typeof targetValue === 'string' && targetValue.toLowerCase() === 'done')) {
      deleteSpecificRow(row);
      continue;
    }

    // targetValueがDateオブジェクトではない場合 (例えば、手動で入力された文字列) のためにDateオブジェクトに変換
    // Dateオブジェクトであればそのまま使用
    const targetTime = (targetValue instanceof Date) ? targetValue : new Date(targetValue);

    if (isNaN(targetTime.getTime())) { // 無効な日付の場合はスキップ
        continue;
    }

    const diff = Math.abs(m_now.getTime() - targetTime.getTime());
    
    if (diff <= 60 * 1000) { // ±1分の範囲で一致(トリガーの時間は正確でないため)用
      const channel = p_sheet.getRange(row, 1).getValue(); // A列：チャンネル

      test1(row); // 実際の処理

      //sheet.getRange(row, 4).setValue(true); // D列：実行済みマーク

      p_sheet.getRange(row, 3).setValue("done"); // C列：完了印
      recordTVProgram(channel);
    }
  }
}

function deleteSpecificRow(row) {
  const SHEET_NAME = 'post';
  const rowToDelete = row;

  /*const sheet = getSheet();*/

  if (p_sheet) {
    // 指定した1行を削除
    p_sheet.deleteRow(rowToDelete);
    Logger.log(`${rowToDelete}行目を削除しました。`);
  } else {
    Logger.log(`シート「${SHEET_NAME}」が見つかりません。`);
  }
}

// テスト処理：E列に「1000」と書く
function test1(row) {
  /*const sheet = getSheet();*/
  p_sheet.getRange(row, 5).setValue(1000); // E列に出力
   Logger.log(`Row ${row}: test function wrote 1000 to E column.`); // デバッグ用
}

const REMO_ACCESS_TOKEN = 'ory_at_oXU4cPyZXQjAoRP_2C8adYr2c3skbaV17NU8xSRh8ho.0hRRaKdAkTT5WwZBRcieQ9zSKMvy6CMrbq5zXv869TU';
const BASE_URL = "https://api.nature.global/1/";

//チャンネル番号と対応する signalId のマップ
const CHANNEL_SIGNAL_MAP = {
  1: "ch-1",
  2: "ch-2",
  3: "ch-3",
  4: "ch-4",
  5: "ch-5",
  6: "ch-6",
  7: "ch-7",
  8: "ch-8",
  9: "ch-9",
  10: "ch-10",
  11: "ch-11",
  12: "ch-12"
};

function getRemo(){
  const url = BASE_URL + 'appliances' ;
    const options = {
      'method':'GET',
      'headers':{
        "Authorization": "Bearer " + REMO_ACCESS_TOKEN
      }
    };
  const test = JSON.parse(UrlFetchApp.fetch(url, options));
  console.log(test[0]);
}


//signalId を送信する基本関数
function sendRemoSignal(button) {
  const url = BASE_URL + 'appliances/' + 'cb0a4aa1-86dd-473c-93fc-79834b6116c4' + '/tv' ;
  const body = {
    'button': button
  };
  
  const options = {
    'method':'POST',
    'headers':{
      "Authorization": "Bearer " + REMO_ACCESS_TOKEN
    },
    'payload': body
  };

  UrlFetchApp.fetch(url, options);
}

//電源ON
function turnOnTV() {
  sendRemoSignal('power');  // テレビの電源ON（事前登録したID）
}

//チャンネル変更（数字 → signalId を変換）
function changeChannel(signalId) {
  const button = CHANNEL_SIGNAL_MAP[signalId];
  console.log(button);
  if (!button) {
    throw new Error(`チャンネル ${channelNum} に対応する signalId が見つかりません`);
  }
  sendRemoSignal(button);
}

//番組表などの操作
function openTVGuide() {
  sendRemoSignal('tv-schedule');
}

function moveCursorDown() {
  sendRemoSignal('down');
}

function confirmSelection() {
  sendRemoSignal('ok');
}

function turnOffTV() {
  sendRemoSignal('power');
}

//トリガーから呼ばれる録画関数（数字チャンネル対応済み）
function recordTVProgram(channelId) {
  turnOnTV();
  Utilities.sleep(6000);
  changeChannel(channelId);
  Utilities.sleep(6000);
  openTVGuide();
  Utilities.sleep(6000);
  moveCursorDown();
  Utilities.sleep(6000);
  confirmSelection();
  Utilities.sleep(6000);
  confirmSelection();
  Utilities.sleep(6000);
  turnOffTV();
}