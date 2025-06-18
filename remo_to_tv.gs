const REMO_ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';
const BASE_URL = "https://api.nature.global/1/signals/";

// 指定の信号を送る関数
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

// 各リモコン操作 (事前にRemoアプリで登録した信号IDを使用)
function turnOnTV() {
  sendRemoSignal("XXXXXX");  // テレビの電源ON
}

function changeChannel(channelId) {
  sendRemoSignal(channelId);  // 設定したチャンネルへ変更
}

function openTVGuide() {
  sendRemoSignal("YYYYYY");  // 番組表を開く
}

function moveCursorDown() {
  sendRemoSignal("ZZZZZZ");  // 下ボタンでカーソルを移動
}

function confirmSelection() {
  sendRemoSignal("WWWWWW");  // 決定ボタンを押す
}

function turnOffTV() {
  sendRemoSignal("TTTTTT");  // テレビをオフにするリモコン信号ID
}

// すべての動作を実行するメイン関数
function recordTVProgram(channelId) {
  turnOnTV();
  Utilities.sleep(5000);  // 5秒待機
  changeChannel(channelId);
  Utilities.sleep(3000);
  openTVGuide();
  Utilities.sleep(2000);
  moveCursorDown();
  Utilities.sleep(2000);
  confirmSelection();
  Utilities.sleep(2000);
  confirmSelection();  // 予約完了の確認のため追加で押す
  Utilities.sleep(5000);
  turnOffTV();  
}

