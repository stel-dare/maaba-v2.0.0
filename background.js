window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
let username='test@gmail.com';
let password='pass';
let status='mark_in';

function countDown(){
  chrome.notifications.create(
      'Maaba',{
    type: "basic",
    title: "Maaba",
    message: "Mark In Succesful",
    iconUrl: "./icon.png"});
  let status = "mark_out";
  let now = new Date();
  let nowHours=now.getHours();
  let nowMinutes=now.getMinutes();
  let millisecondsBtn = ((16-nowHours)*60*60*1000)+((60-nowMinutes)*60*1000);
  console.log("Time Left "+millisecondsBtn);
  setTimeout(function(){
    serverReachable(function(res) {
     if (res) {
       console.log(JSON.parse(res));
       let response = JSON.parse(res);
       markOutStatus(response.status);
     }
     else {
       serverReachable(function(res) {
        if (res) isReachable();
        else isNotReachable();
      });
     }
   });
  },millisecondsBtn);
}

function wrongCredentials(){
  chrome.notifications.create(
      'Maaba',{
    type: "basic",
    title: "Maaba",
    message: "Wrong Credentials. Please update your credentials.",
    iconUrl: "./icon.png"});
    setTimeout(function(){
      isReachable();
    },10000);
}

function markOutStatus(state){
switch(state){
  case 200:
  chrome.notifications.create(
      'Maaba',{
    type: "basic",
    title: "Maaba",
    message: "Mark Out Succesful",
    iconUrl: "./icon.png"});
    break;

    case 208:
    chrome.notifications.create(
        'Maaba',{
      type: "basic",
      title: "Maaba",
      message: "Mark Out Succesful",
      iconUrl: "./icon.png"});
      break;

      case 401:
      wrongCredentials();
      break;

      case 400:
      wrongCredentials();
      break;

      case 503:
      serverReachable(function(res) {
       if (res) isReachable();
       else isNotReachable();
       });
     break;
}
}

function checkStatus(state){
  switch(state){
  case 208:
  countDown();
  break;

  case 200:
  countDown();
  break;

  case 503:
  serverReachable(function(res) {
   if (res) isReachable();
   else isNotReachable();
   });
 break;

  case 401:
  wrongCredentials();
  break;

  case 400:
  wrongCredentials();
  break;

  }
}

function dataStored(cb){
  chrome.storage.sync.get("data", function(items) {
    if (items) {
      cb(items.data);
    }
    else cb(false);
  });
}

function getMyIP (cb) {
  var pc = new RTCPeerConnection ({iceServers: []}),
      noop = () => {};

  pc.onicecandidate = ice =>
    cb = cb ((ice = ice && ice.candidate && ice.candidate.candidate)
                 ? ice.match (/(\d{1,3}(\.\d{1,3}){3}|[a-f\d]{1,4}(:[a-f\d]{1,4}){7})/)[1]
                 : 'unavailable') || noop;
  pc.createDataChannel ("");
  pc.createOffer (pc.setLocalDescription.bind (pc), noop);
}


function serverReachable(cb) {
  getMyIP((addr)=>{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText + ' '+ addr);
      cb(this.responseText);
    }
  };
  xhttp.open("POST", "http://192.168.100.33/maaba_api/"+status, false);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  try{
  xhttp.send("username="+username+"&password="+password+"&ip="+addr);
  console.log('Sent '+"username="+username+"&password="+password+"&ip="+addr);
}
catch(e){
  cb(false);
  console.log('error');
}
}
);
}


function isReachable(){
  console.log('Reachable ');
dataStored((result)=>{
  if(result){
   username=result.username;
   password=result.password;
    //console.log(username);
    serverReachable(function(res) {
     if (res) {
       console.log(JSON.parse(res));
       let response = JSON.parse(res);
      status==='mark_in'? checkStatus(response.status) : markOutStatus(response.status);
     }
     else {
       serverReachable(function(res) {
        if (res) isReachable();
        else isNotReachable();
      });
     }
   });
  }
  else {
    chrome.notifications.create(
        'Maaba',{
      type: "basic",
      title: "Maaba",
      message: "Please update your credentials",
      iconUrl: "./icon.png"});
      setTimeout(function(){
        isReachable();
      },10000);
  }
});
}

function isNotReachable(){
  //alert("Please connect to the Attendance network");
  chrome.notifications.create(
      'Maaba',{
    type: "basic",
    title: "Maaba",
    message: "Please connect to the right network to be marked",
    iconUrl: "./icon.png"});

  setTimeout(function(){
        serverReachable(function(res) {
        if (res) isReachable();
        else isNotReachable();
      });},10000);
}



chrome.runtime.onStartup.addListener(function() {
  let theDate = new Date();
   //Check if work hours
  if (theDate.getDay() > 0 && theDate.getDay() < 6 && theDate.getHours() < 17) {
    //Check if user is connected to right network
     serverReachable(function(res) {
      if (res) isReachable();
      else isNotReachable();
    });

}

  //If not work hours
  else console.log('Not Work hours');
});
