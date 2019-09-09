var channel_access_token = '';
var users_sheet = '';

function doPost(e){
  const event = JSON.parse(e.postData.contents).events;
  switch(event[0].type){
    case 'message':
      reply(event[0]);
      break;
    case 'follow':
      followed(event[0]);
      break;
    case 'unfollow':
      unfollowed(event[0]);
      break;
    default:
      break;
  }
}

// parrot
function reply(e){
  const message = {
    "replyToken" : e.replyToken,
    "messages" : [{
      "type" : "text",
      "text" : ((e.message.type === "text") ? e.message.text : "text only...")
    }]
  };
  const replyData = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json",
      "Authorization" : "Bearer " + channel_access_token
    },
    "payload" : JSON.stringify(message)
  };
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", replyData);
}

function followed(e){
  const sheet = SpreadsheetApp.openById(users_sheet).getActiveSheet();
  sheet.appendRow([e.source.userId]);
}

function unfollowed(e){
  const sheet = SpreadsheetApp.openById(users_sheet).getActiveSheet();
  const result = findTarget(sheet, e.source.userId);
  if(result > 0){
    sheet.deleteRows(result);
  }
}

function findTarget(sheet, targetID){
  const data = sheet.getDataRange().getValues(); 
  for(var i=0; i<data.length; i++){
    if(data[i][0] === targetID){
      return i+1;
    }
  }
  return 0;
}

function main(){
  const msg = 'Hello, World!';
  push(msg);
}

function push(msg) {
  const sheet = SpreadsheetApp.openById(users_sheet).getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const userlist = [];
  for(var i=0; i<data.length; i++){
    userlist.push(data[i][0]);
  }
  const postData = {
    "to" : userlist,
    "messages" : [{"type" : "text", "text" : msg}]
  };
  const option = {
    "method" : "post",
    "headers" : {
      "Content-Type" : "application/json; charset=UTF-8",
      "Authorization" : "Bearer " + channel_access_token
    },
    "payload" : JSON.stringify(postData)
  };
  return UrlFetchApp.fetch("https://api.line.me/v2/bot/message/multicast", option);
}
