function relay() {
  const SPREADSHEET_ID = '1QNwMOOJdy_wAieiYTr-pxlXUEK3emcSUGS8f_rC8Oys';
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet1 = ss.getSheetByName('recept');
  const sheet2 = ss.getSheetByName('post');

  if(typeof sheet1.getRange('C4')==='number'&&typeof sheet1.getRange('C3').getValue()==='number'&&sheet1.getRange('C2').getValue()==='録画予約'){
      const valueC3 = sheet1.getRange('C3').getValue();
      const valueC4 = sheet1.getRange('C4').getValue();

      Logger.log('入力受付');

      const lastRowSheet2 = sheet2.getLastRow();
      const targetRowSheet2 = lastRowSheet2 + 1;

      sheet2.getRange(targetRowSheet2,1).setValue(valueC3);
      sheet2.getRange(targetRowSheet2,2).setValue(valueC4);

      const rangeToClear = sheet1.getRange("A2:C4");
      const blankValues = Array(rangeToClear.getNumRows()).fill('').map(() => Array(rangeToClear.getNumColumns()).fill(''));
      rangeToClear.setValues(blankValues);
  }
}


/* 動くバージョン */
function relay() {
  const ss = SpreadsheetApp.openById(自分のシートID);
  const sheet1 = ss.getSheetByName('recept');
  const sheet2 = ss.getSheetByName('post');

  const valueC2 = sheet1.getRange(2, 3).getValue();
  const valueC3 = sheet1.getRange(3, 3).getValue();
  const valueC4 = sheet1.getRange(4, 3).getValue();
  const NotTriggered = 0

  if (valueC2 === '録画予約' && typeof valueC3 === 'number' && typeof valueC4 === 'number') {
    Logger.log('入力受付');

    const lastRowSheet2 = sheet2.getLastRow();
    sheet2.getRange(lastRowSheet2 + 1, 1).setValue(valueC3);
    sheet2.getRange(lastRowSheet2 + 1, 2).setValue(valueC4);
    sheet2.getRange(lastRowSheet2 + 1, 4).setValue(NotTriggered);

    // 書き込み後、receptの内容をクリア
    const rangeToClear = sheet1.getRange(2, 1, 3, 3);
    rangeToClear.clearContent();
  }
}
