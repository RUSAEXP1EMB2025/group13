const REMO_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
const BASE_URL = "https://api.nature.global/1/signals/";

//チャンネル番号と対応する signalId のマップ
const CHANNEL_SIGNAL_MAP = {
  1: "sigID_CH1",
  2: "sigID_CH2",
  3: "sigID_CH3",
  4: "sigID_CH4",
  5: "sigID_CH5",
  6: "sigID_CH6",
  7: "sigID_CH7",
  8: "sigID_CH8",
  9: "sigID_CH9",
  10: "sigID_CH10",
  11: "sigID_CH11",
  12: "sigID_CH12"
};

//signalId を送信する基本関数
function sendRemoSignal(signalId) {
  const url = BASE_URL + signalId + "/send";
  const options = {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + REMO_ACCESS_TOKEN
    }
  };
  UrlFetchApp.fetch(url, options);
}

//電源ON
function turnOnTV() {
  sendRemoSignal("XXXXXX");  // テレビの電源ON（事前登録したID）
}

//チャンネル変更（数字 → signalId を変換）
function changeChannel(channelNum) {
  const signalId = CHANNEL_SIGNAL_MAP[channelNum];
  if (!signalId) {
    throw new Error(`チャンネル ${channelNum} に対応する signalId が見つかりません`);
  }
  sendRemoSignal(signalId);
}

//番組表などの操作
function openTVGuide() {
  sendRemoSignal("YYYYYY");
}
function moveCursorDown() {
  sendRemoSignal("ZZZZZZ");
}
function confirmSelection() {
  sendRemoSignal("WWWWWW");
}
function turnOffTV() {
  sendRemoSignal("TTTTTT");
}

//トリガーから呼ばれる録画関数（数字チャンネル対応済み）
function recordTVProgram(channelId) {
  turnOnTV();
  Utilities.sleep(5000);
  changeChannel(channelId);
  Utilities.sleep(3000);
  openTVGuide();
  Utilities.sleep(2000);
  moveCursorDown();
  Utilities.sleep(2000);
  confirmSelection();
  Utilities.sleep(2000);
  confirmSelection();
  Utilities.sleep(5000);
  turnOffTV();
}

