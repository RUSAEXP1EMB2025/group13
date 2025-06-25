function sort() {
  const SPREADSHEET_ID = '1l1G-rU1pORLtc_MudwTK9nfIa_IQa5BnTnXk5-u179I';
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet2=ss.getSheetByName('post');

  let data=sheet2.getRange(1,1,100,3);
  data.sort({column:2,ascending: true})
}
