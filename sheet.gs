function getSheet(name) {
  const SPREADSHEET_ID = '1cSyQMLLVXcAzgjxqxWk1yZxlXQq150Qv2SvHKx5-NCI'
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(name);

  if (!sheet) {
    throw new Error('シートが見つかりません');
  }

  return sheet;
}

function getLastData(name) {
  return getSheet(name).getDataRange().getValues().length;
}
