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
