const SPREADSHEET_ID = '1QNwMOOJdy_wAieiYTr-pxlXUEK3emcSUGS8f_rC8Oys'; // ← あなたのスプレッドシートIDに変更

function getSheet(name) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error('シートが見つかりません');
  return sheet;
}

// スプレッドシート編集時のトリガー関数（A列：予約時刻）
function onEdit(e) {
  const range = e.range;
  const sheetName = "post";

  if (range.getSheet().getName() === sheetName &&
      range.getColumn() === 2 &&
      range.getRow() > 1) {

    const date = new Date(range.getValue());
    if (date.getTime() > new Date().getTime()) {
      createTimeTrigger(date, range.getRow());
    }
  }
}
