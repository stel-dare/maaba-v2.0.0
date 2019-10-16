function updateCredentials(){
  //validate form
  if(document.getElementById('username').value!='' && document.getElementById('password').value!=''){

let data={
  username:document.getElementById('username').value,
  password:document.getElementById('password').value
}
chrome.storage.sync.set({ "data":data}, function() {
  if (chrome.runtime.error) {
    console.log("Runtime error.");
  }
  else{
    document.getElementById('username').value='';
    document.getElementById('password').value='';
    document.getElementById('feedback').innerText='Update successful';
  }
});
  }

  else document.getElementById('feedback').innerText='Please fill all fields';
}

document.getElementById('update').addEventListener('click',updateCredentials);
