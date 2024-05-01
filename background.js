let contentScriptTabId = null;
chrome.storage.local.get(['isRecording'], data => {
  console.log(data.isRecording);
  if (data.isRecording != null) {
    //do nothing
  } else{
    //if not present set to false;
    chrome.storage.local.set({ isRecording: false, activeTabID: null});
  }
});
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log(message.action)
  if (message.action === 'startHighlighting') {
    //contentScriptTabId = sender.tab.id;

    // need to add logic to show recording can be done on only one tab at a time

    console.log(message.action)
    chrome.storage.local.set({ isRecording: true});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.storage.local.set({ activeTabID: tabs[0].id});
      chrome.tabs.sendMessage(tabs[0].id, {action: "startHighlighting"});  
    });
  } else if (message.action === 'stopHighlighting') {
    chrome.storage.local.set({ activeTabID: null});
    chrome.storage.local.set({ isRecording: false});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {action: "stopHighlighting"});  
    });
      
  } else if (message.action === 'whatIsMyTabID') {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
          chrome.tabs.sendMessage(tabs[0].id, {action: "thisIsYourTabID",myTabID: sender.tab.id});  
    });
  }
});
