/**
 * Apps Script — 新提交時通知審核員
 *
 * 安裝步驟:
 *   1. 開啟連動的 Google Sheet
 *   2. 擴充功能 → Apps Script → 貼入此檔內容
 *   3. 設定 → 指令碼屬性,新增:
 *        REVIEWER_EMAILS  = "reviewer1@gmail.com,reviewer2@gmail.com"
 *        DISCORD_WEBHOOK  = (可選) Discord 通知 webhook
 *   4. 觸發條件 → 新增觸發條件:
 *        函式: onFormSubmit
 *        事件: 來自試算表 → 表單提交時
 *   5. 第一次儲存會要求授權,允許即可
 */

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const emails = (props.getProperty('REVIEWER_EMAILS') || '').split(',').map(s => s.trim()).filter(Boolean);
  const discordWebhook = props.getProperty('DISCORD_WEBHOOK') || '';

  // e.namedValues 是 { 欄位名: [值] } 物件
  const v = e.namedValues || {};
  const get = (key) => (v[key] && v[key][0]) || '';

  const keyId = get('教案編號');
  const teacher = get('老師姓名');
  const school = get('學校 / 機構');
  const email = get('電子郵件地址');
  const date = get('試教日期');
  const sheetUrl = e.range && e.range.getSheet().getParent().getUrl();
  const rowNum = e.range && e.range.getRow();

  const subject = `[新改編提交] ${keyId} · ${teacher} (${school})`;
  const body = [
    `老師: ${teacher} <${email}>`,
    `學校: ${school}`,
    `教案編號: ${keyId}`,
    `試教日期: ${date}`,
    ``,
    `→ 開啟試算表審核 (第 ${rowNum} 列):`,
    sheetUrl,
    ``,
    `審核 SOP: https://github.com/yujchang2017/community-cce-tw/blob/main/forms/review_workflow.md`,
  ].join('\n');

  // Email 通知
  if (emails.length) {
    MailApp.sendEmail({
      to: emails.join(','),
      subject,
      body,
    });
  }

  // Discord 通知 (可選)
  if (discordWebhook) {
    try {
      UrlFetchApp.fetch(discordWebhook, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          content: `🆕 **${keyId}** 新改編提交\n👩‍🏫 ${teacher} · ${school}\n→ ${sheetUrl}`,
        }),
        muteHttpExceptions: true,
      });
    } catch (err) {
      Logger.log('Discord webhook failed: ' + err);
    }
  }
}

/**
 * 寄發審核結果通知 (手動觸發或 weekly-merge 用)
 *
 * 在 Sheet 中選一列,執行此函式 → 依該列的「狀態」欄寄信給老師
 */
function sendReviewResultEmail() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getActiveRange();
  const row = range.getRow();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const get = (name) => {
    const idx = headers.indexOf(name);
    return idx >= 0 ? rowData[idx] : '';
  };

  const status = get('狀態');
  const email = get('電子郵件地址');
  const keyId = get('教案編號');
  const teacher = get('老師姓名');
  const note = get('審核備註');

  if (!status || !email) {
    SpreadsheetApp.getUi().alert('狀態或 email 欄位是空的');
    return;
  }

  let subject, body;
  if (status === 'approved') {
    subject = `✅ 您的改編《${keyId}》已通過審核`;
    body = `${teacher} 您好:\n\n感謝您的分享!您的改編內容已通過審核,將於下次部署 (約 5 分鐘) 後出現在網站上。\n\n${note ? `審核員留言: ${note}\n\n` : ''}—— 氣候變遷教育平台`;
  } else if (status === 'needs-revision') {
    subject = `📝 您的改編《${keyId}》需要補充資訊`;
    body = `${teacher} 您好:\n\n您提交的內容需要補充以下:\n\n${note}\n\n請於 7 天內補件後再次提交。\n\n—— 氣候變遷教育平台`;
  } else if (status === 'rejected') {
    subject = `❌ 關於您提交的《${keyId}》`;
    body = `${teacher} 您好:\n\n${note}\n\n若有疑問歡迎回信。\n\n—— 氣候變遷教育平台`;
  } else {
    SpreadsheetApp.getUi().alert(`未知的狀態: ${status}`);
    return;
  }

  MailApp.sendEmail({ to: email, subject, body });
  SpreadsheetApp.getUi().alert(`已寄信給 ${email}`);
}
