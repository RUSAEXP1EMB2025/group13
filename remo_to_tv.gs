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
  console.log(test[0])
}


//signalId を送信する基本関数
function sendRemoSignal(button) {
  const url = BASE_URL + 'appliances/' + 'cb0a4aa1-86dd-473c-93fc-79834b6116c4' + '/tv' ;
  const body = {
    'button': button
  }
  
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
  console.log(button)
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
  Utilities.sleep(4000);
  openTVGuide();
  Utilities.sleep(3000);
  moveCursorDown();
  Utilities.sleep(3000);
  confirmSelection();
  Utilities.sleep(3000);
  confirmSelection();
  Utilities.sleep(6000);
  turnOffTV();
}

function test() {
  const ch = 2;
  recordTVProgram(ch);
}
