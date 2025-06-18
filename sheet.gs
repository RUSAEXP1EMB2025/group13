function getSheet(name) {
  const SPREADSHEET_ID = '1cSyQMLLVXcAzgjxqxWk1yZxlXQq150Qv2SvHKx5-NCI'
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    throw new Error('シートが見つかりません');
  }

  return sheet;
}

// 編集されたときのフック（A列：予約時刻）
function onEdit(e) {
  var range = e.range;
  var sheetName = "予約一覧";

  if (range.getSheet().getName() === sheetName &&
      range.getColumn() === 1 && range.getRow() > 1) {
        
    var date = new Date(range.getValue());

    if (date.getTime() > new Date().getTime()) {
      createTimeTrigger(date, range.getRow());
    }
  }
}


