const SPREADSHEET_ID = '1rfFl3MwWZsaPOiaP5IvrqnH8y5Vm677DochNqRHzJlA';

function getSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName('post');
  if (!sheet) throw new Error('シートが見つかりません');
  return sheet;
}

// 1分ごとの自動チェック用トリガーを作成（初回1回だけ実行）
function createAutoCheckTrigger() {
  ScriptApp.newTrigger("checkAndTrigger")
    .timeBased()
    .everyMinutes(1)
    .create();
}

// 予約データをチェックして、必要な行に対してトリガーを設定
function checkAndTrigger() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  for (let row = 2; row <= lastRow; row++) {
    const channel = sheet.getRange(row, 1).getValue(); // A列：チャンネル
    let dateValue = sheet.getRange(row, 2).getValue(); // B列：数値 (例: 6252200)
    const triggered = sheet.getRange(row, 3).getValue(); // C列：トリガー時刻

    if (!dateValue || triggered) continue;//録画時刻(B列)が空もしくはC列に値が入っている(トリガー作成済み)

    // 数値であることを確認し、文字列に変換してゼロ埋めする
    // 例: 6252200 -> "06252200"
    let dateStr;
    if (typeof dateValue === 'number') {
      // toString() で文字列化し、padStart(8, '0') で8桁になるまで先頭にゼロを埋める
      dateStr = String(dateValue).padStart(8, '0'); 
    } else {
      // 数値以外の予期せぬ値が入っていた場合、スキップするかエラーにする
      continue; 
    }

    // 変換後の文字列が本当に8桁か、数値のみで構成されているかを確認
    if (dateStr.length !== 8 || !/^\d{8}$/.test(dateStr)) {
      continue;
    }

    const month = parseInt(dateStr.substring(0, 2), 10) - 1; // mm
    const day   = parseInt(dateStr.substring(2, 4), 10);     // dd
    const hour  = parseInt(dateStr.substring(4, 6), 10);     // hh
    const min   = parseInt(dateStr.substring(6, 8), 10);     // mm
    const year  = new Date().getFullYear(); // 現在の年を使用

/*
    // parseIntの結果がNaNでないか確認
    if (isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(min)) {
        continue;
    }
*/
    const triggerTime = new Date(year, month, day, hour, min - 2);//録画開始時刻の２分前に録画

/*
    if (isNaN(triggerTime.getTime())) { // 無効な日付になっていないか確認
        continue;
    }
*/

    // 過去の時間なら無視
    if (triggerTime <= new Date()) {
        continue; 
    }

    // C列にトリガー実行予定時刻を記録（後で行を特定するため）
    sheet.getRange(row, 3).setValue(triggerTime);

    // トリガーを作成（共通の関数を実行）
    ScriptApp.newTrigger("runRemoAtScheduledTime")
      .timeBased()
      .at(triggerTime)
      .create();
  }
}

// 実行時刻と一致する行を検索して処理
function runRemoAtScheduledTime() {
  const sheet = getSheet();
  const now = new Date();
  const lastRow = sheet.getLastRow();


  for (let row = 2; row <= lastRow; row++) {
    const targetValue = sheet.getRange(row, 3).getValue(); // C列：トリガー時刻 (Dateオブジェクトまたは文字列"done")

    //C列が空もしくはdone
    if (!targetValue || (typeof targetValue === 'string' && targetValue.toLowerCase() === 'done')) {
      deleteSpecificRow(row);
      continue;
    }

    // targetValueがDateオブジェクトではない場合 (例えば、手動で入力された文字列) のためにDateオブジェクトに変換
    // Dateオブジェクトであればそのまま使用
    const targetTime = (targetValue instanceof Date) ? targetValue : new Date(targetValue);

    if (isNaN(targetTime.getTime())) { // 無効な日付の場合はスキップ
        continue;
    }

    const diff = Math.abs(now.getTime() - targetTime.getTime());
    
    if (diff <= 60 * 1000) { // ±1分の範囲で一致(トリガーの時間は正確でないため)用
      const channel = sheet.getRange(row, 1).getValue(); // A列：チャンネル

      test(row); // 実際の処理

      //sheet.getRange(row, 4).setValue(true); // D列：実行済みマーク

      sheet.getRange(row, 3).setValue("done"); // C列：完了印
    }
  }
}

function deleteSpecificRow(row) {
  const SHEET_NAME = 'post'; // 削除したいシート名に置き換えてください
  const rowToDelete = row;

  const sheet = getSheet();

  if (sheet) {
    // 指定した1行を削除
    sheet.deleteRow(rowToDelete);
    Logger.log(`${rowToDelete}行目を削除しました。`);
  } else {
    Logger.log(`シート「${SHEET_NAME}」が見つかりません。`);
  }
}

// テスト処理：E列に「1000」と書く
function test(row) {
  const sheet = getSheet();
  sheet.getRange(row, 5).setValue(1000); // E列に出力
   Logger.log(`Row ${row}: test function wrote 1000 to E column.`); // デバッグ用
}
