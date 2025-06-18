function onEdit(e) {
  const ss=e.source;
  const sheet1 = ss.getSheetByName('シート１');
  const sheet2 = ss.getSheetByName('シート2');

  if(e.range.getSheet().getName()===sheet1.getName()&&e.range.getColumn()===3){
    const edRow=e.range.getRow();
    const edValue=e.range.getValue();

    if(edValue==='録画予約'&&edRow===2){
      Logger.log('録画予約確認。待機状態');
    }

    if(typeof edValue==='number'&&edRow===4&&typeof sheet1.getRange('C3').getValue()==='number'&&sheet1.getRange('C2').getValue()==='録画予約'){
      const valueC3 = sheet1.getRange('C3').getValue();
      const valueC4 = sheet1.getRange('C4').getValue();

      Logger.log('入力受付');

      const lastRowSheet2 = sheet2.getLastRow();
      const targetRowSheet2 = lastRowSheet2 + 1;

      sheet2.getRange(targetRowSheet2,1).setValue(valueC3);
      sheet2.getRange(targetRowSheet2,2).setValue(valueC4);

      Logger.log('転記完了シート１内容削除');

      sheet1.clearContents();
      sheet1.getRange('C2').setValue('');
    }
  }
}
