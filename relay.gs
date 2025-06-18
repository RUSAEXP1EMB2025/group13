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
