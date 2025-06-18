function setTriggerFromSheet() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Schedule");
    var cell = sheet.getRange("A1");  // A1セルから日時を取得
    var scheduledTime = cell.getValue();  // 取得した日時
    var triggerTime = new Date(scheduledTime); // GAS用のDateオブジェクトに変換

    if (triggerTime > new Date()) {
        Logger.log("設定するトリガー時刻: " + triggerTime);
        
        // 既存のトリガーを削除（重複防止）
        deleteExistingTrigger();

        // 指定した日時にcontrolTVSequenceを実行するトリガーを設定
        ScriptApp.newTrigger("recordTVProgram")
            .timeBased()
            .at(triggerTime)
            .create();

        Logger.log("トリガーを設定しました！");
    } else {
        Logger.log("指定した日時が過去のため、トリガーを設定できません。");
    }
}

// 既存のトリガーを削除する関数（重複を防ぐ）
function deleteExistingTrigger() {
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
        if (allTriggers[i].getHandlerFunction() === "controlTVSequence") {
            ScriptApp.deleteTrigger(allTriggers[i]);
        }
    }
}
