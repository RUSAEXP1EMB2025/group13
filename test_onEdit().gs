function test_onEdit() {
  const sheet = getSheet("post");
  const row = 2;  // テストしたい行番号
  const column = 2; // B列

  // 未来の日時（今から2分後）を作成してセルに書き込む
  const futureDate = new Date();
  futureDate.setMinutes(futureDate.getMinutes() + 2);
  sheet.getRange(row, column).setValue(futureDate);

  // 擬似のイベントオブジェクトを作る
  const fakeEvent = {
    range: sheet.getRange(row, column)
  };

  // onEdit をテスト実行
  onEdit(fakeEvent);
}
