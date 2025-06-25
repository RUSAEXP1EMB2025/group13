const SPREADSHEET_ID = '1QNwMOOJdy_wAieiYTr-pxlXUEK3emcSUGS8f_rC8Oys';

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error('シートが見つかりません');
  return sheet;
}

// 毎分または定期的に呼ばれて予約をチェックする関数
function checkAndTrigger() {
  const sheet = getSheet("post");
  const now = new Date();
  const lastRow = sheet.getLastRow();

  for (let row = 2; row <= lastRow; row++) {
    const channel = sheet.getRange(row, 1).getValue(); // A列：チャンネル
    const date = sheet.getRange(row, 2).getValue();    // B列：予約日時
    const triggered = sheet.getRange(row, 4).getValue(); // D列：トリガー済みかどうか

    if (channel && date instanceof Date && !triggered && date > now) {
      // トリガーがまだ設定されていなければ
      createTimeTrigger(date, row);
      sheet.getRange(row, 4).setValue("triggered");  // D列にマーク
    }
  }
}



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
  var sheet = SpreadsheetApp.openById(Spreadsheet_ID).getSheetByName('post');

  var channel = sheet.getRange(row, 1).getValue();  // チャンネル（B列）
  recordTVProgram(channel)      // Remoで操作

  sheet.getRange(row, 3).setValue(true);  // 実行済み（C列）にtrue
  props.deleteProperty("targetRow");      // 情報削除（単発実行前提）
}
