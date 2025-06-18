// 時刻トリガーを作成（指定行に対する）
function createTimeTrigger(date, row) {
  ScriptApp.newTrigger("runRemoAtScheduledTime")
           .timeBased()
           .at(date)
           .create();

  // 行番号を Properties に記録（予約ごとに保存する必要がある場合、工夫要）
  PropertiesService.getScriptProperties().setProperty("targetRow", row.toString());
}

// トリガーで実行される本体
function runRemoAtScheduledTime() {
  var props = PropertiesService.getScriptProperties();
  var row = parseInt(props.getProperty("targetRow"), 10);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("post");

  var channel = sheet.getRange(row, 2).getValue();  // チャンネル（B列）
  setChannelSignal(channel);  // チャンネルをセット
  recordTVProgram(channelId)      // Remoで操作

  sheet.getRange(row, 3).setValue(true);  // 実行済み（C列）にtrue
  props.deleteProperty("targetRow");      // 情報削除（単発実行前提）
}
