let highlightingEnabled = false;

document.getElementById('startButton').addEventListener('click', function() {
  chrome.runtime.sendMessage({ action: 'startHighlighting' });
  toggleButtons(true);
});

document.getElementById('stopButton').addEventListener('click', function() {
  chrome.runtime.sendMessage({ action: 'stopHighlighting' });
  toggleButtons(false);
});
chrome.storage.local.get(['isRecording'], data => {
  console.log(data.isRecording);
  if (data.isRecording != null) {
    //if present update the buttons
    toggleButtons(data.isRecording);
  } else{
    //if not present do nothing
  }
});

function toggleButtons(highlight) {
  const startButton = document.getElementById('startButton');
  const stopButton = document.getElementById('stopButton');


  if (highlight) {
    startButton.style.display = 'none';
    stopButton.style.display = 'block';
  } else {
    startButton.style.display = 'block';
    stopButton.style.display = 'none';
  }
}
