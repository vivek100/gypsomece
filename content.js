let highlightingEnabled = false;
let clickedElement = null;
let previousHighlightingState = false;
let recorder = null;
let events = [];
let chalcEvents =[];
let stopfn = null;
let videoUrl;
let isRecording;
var checkIfWaitWasClicked = [null,null];
//track if player was resized once on startup
let resizeAtStartup = false;
//adding code for video element where video will be shown
const video = document.createElement('video');
video.id = 'playerid';
video.style.position = 'fixed';
video.style.bottom = '20px'; // Padding from bottom
video.style.left = '20px'; // Padding from left
video.style.borderRadius = '5%'; // Makes the video circle
video.style.width = '200px'; // Set the width of the video
video.style.height = '112.5px'; // Set the height of the video
video.style.objectFit = 'cover'; // Ensures the video content is covered in the circle
video.style.zIndex = '100000'; // Ensure it's above most other items
video.style.transition = 'all 0.5s ease'; // Smooth transition for moving
video.setAttribute('data-rr-ignore','true');
//video.classList.add("rr-block");

const video2 = document.createElement('video');
video2.id = 'playerid2';
video2.style.position = 'fixed';
video2.style.bottom = '20px'; // Padding from bottom
video2.style.left = '20px'; // Padding from left
video2.style.borderRadius = '5%'; // Makes the video circle
video2.style.width = '200px'; // Set the width of the video
video2.style.height = '112.5px'; // Set the height of the video
video2.style.objectFit = 'cover'; // Ensures the video content is covered in the circle
video2.style.zIndex = '100000'; // Ensure it's above most other items
video2.style.transition = 'all 0.5s ease'; // Smooth transition for moving
video2.setAttribute('data-rr-ignore','true');
video2.classList.add("rr-block");

const playerDiv = document.createElement('div');
playerDiv.id = 'playerdiv';
playerDiv.style.position = 'fixed'; // Padding from bottom
//playerDiv.style.left = '10px'; // Padding from left
playerDiv.style.borderRadius = '95%'; // Makes the video circle
playerDiv.style.width = '100%'; // Set the width of the video
playerDiv.style.height = '0%'; // Set the height of the video
playerDiv.style.objectFit = 'cover'; // Ensures the video content is covered in the circle
playerDiv.style.zIndex = '100000'; // Ensure it's above most other items
playerDiv.style.transition = 'all 0.5s ease'; // Smooth transition for moving


//check if recording is already one or not
chrome.runtime.sendMessage({ action: 'whatIsMyTabID' });
//checkRecordingStatus()
function checkRecordingStatus(currentTabId) {
  chrome.storage.local.get(['isRecording'], data => {
    console.log(data.isRecording);
    if (data.isRecording === true) {
      chrome.storage.local.get(['activeTabID'], storageData =>  {
        // get current tab id
        //const currentTabId = await getCurrentTabId();
        console.log(storageData.activeTabID,currentTabId);
        if (storageData.activeTabID === currentTabId) {
          
          startRecording();
        }
      });
    }
  });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'startHighlighting') {
    startRecording()
  } else if (message.action === 'stopHighlighting') {
    highlightingEnabled = false;
    let lastZoomX = null;
    let lastZoomY = null;
    let maxScale = null;
    let currentWidth = null,currentHeight = null;
    //removeHighlight();
    recorder.stop();
    video.remove();
    //play the rrweb recording
    stopfn();
    const replayer = new rrwebPlayer({
      target: document.getElementById('playerdiv'), // customizable root element
      props: {
        events,
      },
    });

    replayer.play();


    
    //console.log(playerFrame[0].style.width,playerWrapper[0].style.width,playerFrame[0].style.height,playerWrapper[0].style.height);
    

    replayer.addEventListener('resize', (payload) => {
      console.log(payload);
        const theplayer = document.getElementsByClassName('rr-player');
        const playerWrapper = document.getElementsByClassName('replayer-wrapper');
        const playerFrame = document.getElementsByClassName('rr-player__frame');
        

        if (resizeAtStartup === false) {

          theplayer[0].style.width = playerWrapper[0].getBoundingClientRect().width + 'px';
          //theplayer[0].style.height = playerWrapper[0].getBoundingClientRect().height + 'px';
          playerFrame[0].style.width = playerWrapper[0].getBoundingClientRect().width + 'px';
          playerFrame[0].style.height = playerWrapper[0].getBoundingClientRect().height + 'px';
          maxScale = playerWrapper[0].getBoundingClientRect().width / playerWrapper[0].offsetWidth;
          currentWidth = playerWrapper[0].offsetWidth;
          currentHeight = playerWrapper[0].offsetHeight;
          const playerModal = document.getElementsByClassName('rr-player');
          playerModal[0].style.transform = 'scale(0.6) ';
          playerModal[0].style.transformOrigin = 'top right';
          playerModal[0].style.float = 'right';
          playerModal[0].style.marginTop =  '2%';
          playerModal[0].style.marginRight = '2%';
          playerModal[0].style.boxShadow = 'rgba(17, 16, 62, 0.5) 0px 24px 48px';
          var offetTopOfPlayerModal = playerModal[0].offsetTop;
          var offetLeftOfPlayerModal = playerModal[0].offsetLeft;
          playerModal[0].style.cursor = 'move';
          resizeAtStartup = true;

          // Make the DIV element draggable:
          dragElement(playerModal[0]);

          function dragElement(elmnt) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            if (document.getElementById(elmnt.id + "header")) {
              // if present, the header is where you move the DIV from:
              document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
            } else {
              // otherwise, move the DIV from anywhere inside the DIV:
              elmnt.onmousedown = dragMouseDown;
            }

            function dragMouseDown(e) {
              pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
              //offetTopOfPlayerModal = playerModal[0].offsetTop;
              //offetLeftOfPlayerModal = playerModal[0].offsetLeft;
              e = e || window.event;
              e.preventDefault();
              //console.log('beforeMouseDOwnUpdated',pos1,pos2,pos3,pos4,e.clientX,e.clientY);
              // get the mouse cursor position at startup:
              pos3 = e.clientX;
              pos4 = e.clientY;
              //console.log('afterMouseDOwnUpdated',pos1,pos2,pos3,pos4,e.clientX,e.clientY);
              // call a function whenever the cursor moves:
              elmnt.onmousemove = elementDrag;
              elmnt.onmouseup = closeDragElement;
            }

            function elementDrag(e) {
              e = e || window.event;
              e.preventDefault();
              // calculate the new cursor position:
              //console.log('beforeupdate',pos1,pos2,pos3,pos4,e.clientX,e.clientY);
              pos1 = pos3 - e.clientX;
              pos2 = pos4 - e.clientY;
              pos3 = e.clientX;
              pos4 = e.clientY;
              //console.log('afterupdate',pos1,pos2,pos3,pos4,e.clientX,e.clientY);
              // set the element's new position:
              //console.log(((elmnt.offsetLeft - offetLeftOfPlayerModal)+"px"),elmnt.style.left === null,elmnt.style.left === "",((elmnt.offsetLeft - offetLeftOfPlayerModal)+"px") === elmnt.style.left);
              if (elmnt.style.left === "") {
                //console.log('beforeFirst',elmnt.offsetLeft - offetLeftOfPlayerModal,elmnt.style.left,elmnt.offsetLeft,offetLeftOfPlayerModal,document.getElementsByClassName('rr-player')[0].offsetLeft);
                elmnt.style.top = (elmnt.offsetTop - offetTopOfPlayerModal - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - offetLeftOfPlayerModal - pos1) + "px";
                //console.log('afterFirst',elmnt.offsetLeft - offetLeftOfPlayerModal - pos1,elmnt.style.left);
                
              } else if (((elmnt.offsetLeft - offetLeftOfPlayerModal)+"px") === elmnt.style.left) {
                //console.log('before',elmnt.offsetLeft - offetLeftOfPlayerModal,elmnt.style.left,elmnt.offsetLeft,offetLeftOfPlayerModal,document.getElementsByClassName('rr-player')[0].offsetLeft);
                elmnt.style.top = (elmnt.offsetTop - offetTopOfPlayerModal - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - offetLeftOfPlayerModal - pos1) + "px";
                //console.log('after',elmnt.offsetLeft - offetLeftOfPlayerModal - pos1,elmnt.style.left);
              } else {
                //console.log('failed',elmnt.offsetLeft - offetLeftOfPlayerModal,elmnt.style.left,elmnt.offsetLeft,offetLeftOfPlayerModal,document.getElementsByClassName('rr-player')[0].offsetLeft);
                //the offset is changed adjust it for the difference
                offetLeftOfPlayerModal = (elmnt.offsetLeft - offetLeftOfPlayerModal) - parseInt(elmnt.style.left, 10) + offetLeftOfPlayerModal;
                offetTopOfPlayerModal = (elmnt.offsetTop - offetTopOfPlayerModal) - parseInt(elmnt.style.top,10) + offetTopOfPlayerModal;
                console.log('failed2',((elmnt.offsetLeft - offetLeftOfPlayerModal)+"px") === elmnt.style.left,elmnt.offsetLeft - offetLeftOfPlayerModal,elmnt.style.left,elmnt.offsetLeft,offetLeftOfPlayerModal,document.getElementsByClassName('rr-player')[0].offsetLeft);
                
              }
            }

            function closeDragElement() {
              // stop moving when mouse button is released:
              pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
              elmnt.onmouseup = null;
              elmnt.onmousemove = null;
            }
          }

          
          console.log(maxScale);
          
        }

    })
    
    replayer.addEventListener('custom-event', (payload) => {
      console.log(payload.data.tag,payload.data.payload);
      if (payload.data.tag === 'zoomIn') {
        const playerContainer = document.querySelector('.replayer-wrapper');
        console.log(payload.data.payload.x,currentWidth,payload.data.payload.windowWidth,maxScale)
        console.log(payload.data.payload.y,currentHeight,payload.data.payload.windowWidth)
        console.log(`scale(${maxScale*2}) translate(-${payload.data.payload.x}px, -${payload.data.payload.y}px)`);

        playerContainer.style.transform = `scale(${maxScale*2}) translate(-${payload.data.payload.x}px, -${payload.data.payload.y}px)`;
        playerContainer.style.transition = `transform 0.5s ease`;

      }
      if (payload.data.tag === 'zoomOut') {

        const playerContainer = document.querySelector('.replayer-wrapper');
        playerContainer.style.transform = `scale(${maxScale}) translate(-50%, -50%)`;
        playerContainer.style.transformOrigin = `0px 0px`;
        playerContainer.style.top = '50%';
        playerContainer.style.left = '50%';
        
        
      }
      if (payload.data.tag === 'camFocusIn') {
        const playerContainer = document.querySelector('.replayer-wrapper');
        const translateX = playerContainer.clientWidth/10;
        const translateY = playerContainer.clientHeight/10;
        console.log(translateX,translateY,`scale(4) translate(${translateX}px, -${translateY}px)`)
        video2.style.bottom = '0px';
        video2.style.left = '0px';
        video2.style.transform = `scale(4) translate(${translateX}px, -${translateY}px)`;
        //video2.style.borderRadius = '2%';

        
      }
      if (payload.data.tag === 'camFocusOut') {
        video2.style.transform = 'scale(1) translate(0%, 0%)';
        video2.style.bottom = '20px'; // Padding from bottom
        video2.style.left = '20px'; // Padding from left
      }

      if (payload.data.tag === 'waitForClick') {

        if (checkIfWaitWasClicked[0] === payload.data.payload.time && checkIfWaitWasClicked[1] === true) {
          
        } else {
            //Pause video and the replayer
            video2.pause();
            replayer.pause();
            //show message
            showMessageBox('Please click on the highlighted area to continue!');
            var targetElement = findElementByIdentifiers(payload.data.payload.identifiers);
            highlightElementWhilePlaying(targetElement)

            targetElement.addEventListener('click', function (event){
              checkIfWaitWasClicked[0] = payload.data.payload.time;
              checkIfWaitWasClicked[1] = true;
              removeHighlight();
              video2.play();
              replayer.play();
              closeMessageBox();
            })
        }
      }
    })

    replayer.addEventListener('start', (payload) => {
      console.log('start',payload);


    })

    replayer.addEventListener('pause', (payload) => {
      console.log('pause',payload);
    })

    replayer.addEventListener('finish', (payload) => {
      console.log('finish',payload);
    })
    
    //on('resize', (payload) => {
      //const playerWrapper = document.getElementsByClassName('replayer-wrapper');
      //const playerFrame = document.getElementsByClassName('rr-player__frame');
      //console.log(playerFrame[0].style.clientWidth,playerWrapper[0].clientWidth,playerFrame[0].style.clientHeight,playerWrapper[0].clientHeight);
      //playerFrame[0].style.width = playerWrapper[0].clientWidth;
      //playerFrame[0].style.height = playerWrapper[0].clientHeight;
      
    //})
    
    
    console.log(replayer.getMetaData());
    //add code to also save the events data on clicks and actions also
    //downloadObjectAsJson(chalcEvents,'events.json');
  } else if (message.action === 'thisIsYourTabID') {
    checkRecordingStatus(message.myTabID);
  }
});

//function to also download the events data as json
function downloadObjectAsJson(exportObj, exportName){
  var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href",     dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

//function to add zoom overlay
function updateOverlayBounds(pointerX, pointerY) {
  const radius = 150; // Radius around the pointer that will not be covered by the overlay
  const heightofwindow = (window.innerHeight * 0.5)/2;
  const widthofwindow = (window.innerWidth *0.5)/2;
  

  const overlayTop = document.getElementById('overlay-top');
  const overlayBottom = document.getElementById('overlay-bottom');
  const overlayLeft = document.getElementById('overlay-left');
  const overlayRight = document.getElementById('overlay-right');

  overlayTop.style.top = '0px';
  overlayTop.style.left = '0px';
  overlayTop.style.width = '100%';
  console.log(pointerX,pointerY,heightofwindow);
  if (pointerY >= heightofwindow) {
    overlayTop.style.height = `${pointerY - heightofwindow}px`;
  } else {
    overlayTop.style.height = `0px`;
  }
  

  overlayBottom.style.top = `${pointerY + heightofwindow}px`;
  overlayBottom.style.left = '0px';
  overlayBottom.style.width = '100%';
  overlayBottom.style.height = `${window.innerHeight - pointerY - heightofwindow}px`;

  overlayLeft.style.top = `${pointerY - heightofwindow}px`;
  overlayLeft.style.left = '0px';
  //overlayLeft.style.width = `${pointerX - radius}px`;
  overlayLeft.style.height = `${2 * heightofwindow}px`;
  if (pointerX >= widthofwindow) {
    overlayLeft.style.width = `${pointerX - widthofwindow}px`;
  } else {
    overlayLeft.style.width = `0px`;
  }

  overlayRight.style.top = `${pointerY - heightofwindow}px`;
  overlayRight.style.left = `${pointerX + widthofwindow}px`;
  overlayRight.style.width = `${window.innerWidth - pointerX - widthofwindow}px`;
  overlayRight.style.height = `${2 * heightofwindow}px`;
}
function showOverlay() {
  document.getElementById('overlay-top').style.display = 'block';
  document.getElementById('overlay-bottom').style.display = 'block';
  document.getElementById('overlay-left').style.display = 'block';
  document.getElementById('overlay-right').style.display = 'block';
}

function hideOverlay() {
  document.getElementById('overlay-top').style.display = 'none';
  document.getElementById('overlay-bottom').style.display = 'none';
  document.getElementById('overlay-left').style.display = 'none';
  document.getElementById('overlay-right').style.display = 'none';
}

function startRecording(){
  //highlightingEnabled = true;
  events = [];
  chalcEvents = [];
  
  //create overlay element
  const overlayTop = document.createElement('div');
  const overlayBottom = document.createElement('div');
  const overlayLeft = document.createElement('div');
  const overlayRight = document.createElement('div');
  overlayTop.style.display = 'none';
  overlayBottom.style.display = 'none';
  overlayLeft.style.display = 'none';
  overlayRight.style.display = 'none';
  overlayTop.style.zIndex = '100000';
  overlayBottom.style.zIndex = '100000';
  overlayLeft.style.zIndex = '100000';
  overlayRight.style.zIndex = '100000';

  //updateOverlayBounds(0, 0, window.innerWidth, window.innerHeight);

  [overlayTop, overlayBottom, overlayLeft, overlayRight].forEach(el => {
      //el.style.position = 'fixed';
      //el.style.backgroundColor =  'rgba(255, 255, 255, 0.5)'; // Semi-transparent black overlay
      document.body.appendChild(el);
  });
  overlayTop.id = 'overlay-top';
  overlayBottom.id = 'overlay-bottom';
  overlayLeft.id = 'overlay-left';
  overlayRight.id = 'overlay-right';
  



  //track last mouse pointer location
  var cursor_x = -1;
  var cursor_y = -1;

  document.addEventListener('mousemove', function(event) {
    cursor_x = event.pageX;
    cursor_y = event.pageY;
  });

  stopfn = rrweb.record({
  emit(event) {
      // push event into the events array for rrweb
      events.push(event);
      if (event.type === 3 && event.data.source === 0) {
        //console.log(event);
          
        //rrweb.record.takeFullSnapshot()
      }
      
      //maybe capture scroll event too, or mouse event might be cool if we can replay it
      
  },
  });

  //listen to the zoom command - send event & add overlay
  document.addEventListener('keydown', function(event) {
      console.log(event.key);
      if (event.altKey && event.key === 'z') {
          // Assuming rrweb is capturing these as custom events or you have a method to log the

          //show overlay
          //toggleRecordingOverlay(cursor_x,cursor_y);
          if (overlayTop.style.display === 'none') {
              rrweb.record.takeFullSnapshot();
              updateOverlayBounds(cursor_x, cursor_y);
              showOverlay();
              rrweb.record.addCustomEvent('zoomIn', {
                x: cursor_x,
                y: cursor_y,
                time: Date.now(),
                windowWidth: window.innerWidth,
                zoomLevel: 1.3 
              })
              
          } else {
              rrweb.record.addCustomEvent('zoomOut', {
                x: cursor_x,
                y: cursor_y,
                time: Date.now(),
                windowWidth: window.innerWidth,
                zoomLevel: 1.3 
              })
              hideOverlay();
          }

      }
      if (event.altKey && event.key === 's') {
        //update the video position
        
        //show overlay
        //toggleRecordingOverlay(cursor_x,cursor_y);
        console.log(video.style.bottom === '20px',video.style.bottom)
        if (video.style.bottom === '20px') {

          const translateX = window.innerWidth/7;
          const translateY = window.innerHeight/7;
          
          video.style.bottom = '0px';
          video.style.left = '0px';
          video.style.transform = `scale(3) translate(${translateX}px, -${translateY}px)`;
          video.style.borderRadius = '2%';
          

            rrweb.record.addCustomEvent('camFocusIn', {
              time: Date.now(),
              windowWidth: window.innerWidth
            })
        } else {

          video.style.transform = 'scale(1) translate(0%, 0%)';
          video.style.bottom = '20px'; // Padding from bottom
          video.style.left = '20px'; // Padding from left
          
            rrweb.record.addCustomEvent('camFocusOut', {
              time: Date.now(),
              windowWidth: window.innerWidth 
            })
        }

      }

      //capture wait moment
      if (event.altKey && event.key === 'w') {
        
        console.log(highlightingEnabled === false,highlightingEnabled)
        if (highlightingEnabled === false) {
          
          highlightingEnabled = true;

        } else {
          highlightingEnabled = false;
        }

      }
  });



  document.body.appendChild(video);
  document.body.appendChild(playerDiv);
  var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutationRecord) {
      console.log('style Changed for video',mutationRecord);
    });
  });
  
  var target = document.getElementById('playerid');
  observer.observe(target, {
    attributes: true,
    attributeFilter: ['style']
  });
  clearData("videoChunksDB","chunks");
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
          video.srcObject = stream;
          video.play();
  
          recorder = new MediaRecorder(stream);
          const chunks = [];
  
          recorder.ondataavailable = async (event) => {
            if (event.data.size > 0) {
              await saveChunk("videoChunksDB","chunks",event.data);
            }
          };
          recorder.onstop = async (e) => {
              
              //a.click();
              stream.getTracks().forEach(function(track) {
                track.stop();
              });
              await downloadRecordedVideo("videoChunksDB","chunks")
          };
          
          recorder.start();


          chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
              if (msg.command === "start-recording") recorder.start();
              else if (msg.command === "stop-recording") recorder.stop();
          });
      })
      .catch(error => {
          console.error("Permission Denied or UserMedia Error: ", error);
          video.remove(); // Optionally remove the video element if access is denied
          alert('You need to allow camera and microphone access to use this feature.');
      });
  
  document.addEventListener('mousemove', (event) => {
      if (event.clientX <= 50 || event.clientY <= 50) {
          //video.style.top = '10px'; // Padding from top when moved
          //video.style.bottom = 'auto';
      } else {
          //video.style.top = 'auto';
          //video.style.bottom = '10px'; // Padding from bottom when restored
      }
  });

  //######can also add code that is there is no mouse movement the video should come to center of the screen and should be in focus maybe in player we can show that

}

//function to store video data in indexdb in future move to ofscreen.html to be seamless
//const dbName = "videoChunksDB";
//const storeName = "chunks";

function openDB(dbName,storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = (event) => {
      console.error("Database error: " + event.target.errorCode);
      reject(event.target.error);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(storeName, { autoIncrement: true });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
}

async function saveChunk(dbName,storeName,chunk) {
  const db = await openDB(dbName,storeName);
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  store.add(chunk);
}

async function getAllChunks(dbName,storeName) {
  const db = await openDB(dbName,storeName);
  const transaction = db.transaction([storeName], "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      console.log("Chunks retrieved:", request.result);
      resolve(request.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function downloadRecordedVideo(dbName,storeName) {
  const chunks = await getAllChunks(dbName,storeName);
  console.log(chunks.length);
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  videoUrl = URL.createObjectURL(new Blob(chunks));
  a.download = 'recorded_video.webm';
  document.body.appendChild(a);
  //a.click();
  document.body.removeChild(a);
  const playerFrame = document.getElementsByClassName('replayer-wrapper');
  playerFrame[0].appendChild(video2);
  video2.style.position = 'absolute';
  video2.src = url;
  video2.load();
  video2.play();
  console.log(video2.duration);
}

async function clearData(dbName,storeName) {
  const db = await openDB(dbName,storeName);
  const transaction = db.transaction([storeName], "readwrite");
  const store = transaction.objectStore(storeName);
  const clearRequest = store.clear();
  clearRequest.onerror = (event) => {
    console.error("Error clearing the store: ", event.target.error);
  };
  clearRequest.onsuccess = () => {
    console.log("Store cleared successfully.");
  };
}


document.addEventListener('mouseover', function(event) {
  if (highlightingEnabled) {
    const element = event.target;
    if (element !== document.body) {
      highlightElement(element);
    }
  }
});

document.addEventListener('mouseout', function(event) {
  if (highlightingEnabled) {
    const element = event.target;
    if (element !== document.body) {
      removeHighlight();
    }
  }
});

function highlightElement(element) {
  element.classList.add('__element_highlighter_highlighted');
  
  
  element.addEventListener('contextmenu',async function (event) {
    console.log('listened to click')
    event.preventDefault();
    await chrome.storage.local.get(['isRecording'], async data => {
      //check if recording
      if (data.isRecording === true) {
        //adding code to find the identifiers
        
        console.log('reached here')
        if (await element.classList.contains('__element_highlighter_highlighted')) {
          console.log('class is present seding event')
          var identifiers = createIdentifiers(element);
          //send event to rrweb
          rrweb.record.addCustomEvent('waitForClick', {
            time: Date.now(),
            identifiers: identifiers,
            windowWidth: window.innerWidth 
          })
          highlightingEnabled = false;
          
          //event.click();
          //show message on top with timer that removes it
          showNotification(6000);
          removeHighlight();

        }

        
        
  
      }else{
        //event.click();
        removeHighlight();
      }

    });
    

    
  })
}

//function to highlight while playing
function highlightElementWhilePlaying(element) {

  element.classList.add('__element_highlighter_highlighted_playing');
  
}

//adding code to show wait message while playing
function createMessageBox(message = 'Default message') {
  const messageBox = document.createElement('div');
  messageBox.className = 'player-message-box hide-player-message-box';

  const messageParagraph = document.createElement('p');
  messageParagraph.textContent = message;
  messageParagraph.className = 'text-player-message-box'

  messageBox.appendChild(messageParagraph);
  const playerFrame = document.getElementsByClassName('rr-player__frame');
  playerFrame[0].appendChild(messageBox);
  //document.body.appendChild(messageBox);

  return messageBox;
}

function showMessageBox(message = 'Default message') {
  const existingBox = document.querySelector('.player-message-box');

  // If there's already a box present, update its message and show it
  if (existingBox) {
    existingBox.querySelector('p').textContent = message;
    existingBox.classList.remove('hide-player-message-box');
  } else {
    const messageBox = createMessageBox(message);
    messageBox.classList.remove('hide-player-message-box');
  }
}

function closeMessageBox() {
  const messageBox = document.querySelector('.player-message-box');

  if (messageBox) {
    messageBox.classList.add('hide-player-message-box');
    messageBox.remove(); // Remove from the DOM after hiding
  }
}


//adding code to show message timer
function createNotificationElement() {
  const notification = document.createElement('div');
  notification.id = 'notificationForWait';
  notification.className = 'notificationForWait hideNotifForWait';

  const closeButton = document.createElement('button');
  closeButton.className = 'close-notif-btn';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = function() {
    notification.classList.add('hideNotifForWait');
    clearTimeout(autoDismiss);
  };

  const messageParagraph = document.createElement('p');
  messageParagraph.textContent = 'Wait event added for the click!';
  messageParagraph.class = 'messageParagraph';

  const timerBar = document.createElement('div');
  timerBar.className = 'timer-bar';
  notification.classList.add("rr-block");

  notification.appendChild(closeButton);
  notification.appendChild(messageParagraph);
  notification.appendChild(timerBar);
  document.body.appendChild(notification);

  return notification;
}

function showNotification(duration = 5000) {
  const notification = createNotificationElement();
  const timerBar = notification.querySelector('.timer-bar');
  notification.classList.remove('hideNotifForWait');

  // Reset and animate the timer bar
  timerBar.style.width = '0%';
  setTimeout(() => timerBar.style.width = '100%', 10);

  // Set timeout to hide notification
  setTimeout(() => {
    notification.classList.add('hideNotifForWait');
    notification.remove(); // Remove the element from the DOM once hideNotifForWait
  }, duration);

  // Save timeout ID for cancellation if dismissed manually
  let autoDismiss = setTimeout(() => {
    notification.classList.add('hideNotifForWait');
    notification.remove();
  }, duration);
}


function removeHighlight() {
  const highlightedElements = document.querySelectorAll('.__element_highlighter_highlighted');
  highlightedElements.forEach(function(element) {
    element.classList.remove('__element_highlighter_highlighted');
    element.removeEventListener('contextmenu',null);
  });

  const highlightedforwait = document.querySelectorAll('__element_highlighter_highlighted_playing');
  highlightedforwait.forEach(function(element) {
    element.classList.remove('__element_highlighter_highlighted_playing');
    element.removeEventListener('click',null);
  });
}

// new code to create element identifiers and for finding them while playing
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
function getPathTo(element) {
  if (element.id!=='')
      return 'id("'+element.id+'")';
  if (element===document.body)
      return element.tagName;

  var ix= 0;
  var siblings= element.parentNode.childNodes;
  for (var i= 0; i<siblings.length; i++) {
      var sibling= siblings[i];
      if (sibling===element)
          return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
      if (sibling.nodeType===1 && sibling.tagName===element.tagName)
          ix++;
  }
}

function createIdentifiers(element) {
  const identifiers = {
      id: element.id,
      classes: element.className.trim().replace(/\s+/g, '.'),
      tagName: element.tagName.toLowerCase(),
      name: element.name,
      attributes: {}
  };

  // Collect all attributes
  Array.from(element.attributes).forEach(attr => {
      identifiers.attributes[attr.name] = attr.value;
  });

  // XPath and CSS Path
  identifiers.xpath = getXPath(element);
  identifiers.cssPath = getCssPath(element);
  identifiers.fullCssPath = getFullCssPath(element);
  identifiers.relativeCssSelector = getRelativeCssSelector(element);

  // Positional information
  identifiers.position = getElementPosition(element);

  // Unique text content pattern
  identifiers.textPattern = getTextPattern(element.textContent);

  // Style computation hash
  identifiers.styleHash = getStyleHash(element);

  // Computed role and content hash
  identifiers.computedRole = getComputedRole(element);
  identifiers.contentHash = getContentHash(element.textContent);

  // Nearest form or landmark
  identifiers.nearestLandmark = getNearestLandmark(element);

  return identifiers;
}

function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return `${rect.top.toFixed(0)}:${rect.left.toFixed(0)}`;
}

function getTextPattern(text) {
  const pattern = text.match(/[a-zA-Z0-9]{10,}/); // Example: Match any long alphanumeric string
  return pattern ? pattern[0] : null;
}

function getStyleHash(element) {
  const style = window.getComputedStyle(element);
  const relevantStyles = ['color', 'width', 'height'].map(prop => style[prop]).join(':');
  return btoa(relevantStyles);
}

function getNearestLandmark(element) {
  let parent = element.parentElement;
  while (parent && !['FORM', 'MAIN', 'ARTICLE', 'NAV'].includes(parent.tagName)) {
      parent = parent.parentElement;
  }
  return parent ? `${parent.tagName.toLowerCase()}#${parent.id}` : null;
}

function getComputedRole(element) {
  return window.getComputedStyle(element).getPropertyValue('role') || null;
}

function getContentHash(textContent) {
  let hash = 0, i, chr;
  if (textContent.length === 0) return hash;
  for (i = 0; i < textContent.length; i++) {
      chr = textContent.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
}

function getFullCssPath(element) {
  let path = [];
  for (; element && element.nodeType === Node.ELEMENT_NODE; element = element.parentNode) {
      let selector = element.nodeName.toLowerCase();
      if (element.parentNode) {
          const siblings = Array.from(element.parentNode.children);
          const index = siblings.indexOf(element) + 1;
          selector += ':nth-child(' + index + ')';
      }
      path.unshift(selector);
  }
  return path.join(' > ');
}

function getRelativeCssSelector(element) {
  const parent = element.parentNode;
  if (parent && (parent.id || parent.className)) {
      const parentSelector = parent.id ? `#${parent.id}` : `.${parent.className.trim().replace(/\s+/g, '.')}`;
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      const childSelector = `${element.tagName.toLowerCase()}:nth-child(${index})`;
      return `${parentSelector} > ${childSelector}`;
  }
  return null;
}
function getXPath(element) {
  if (element.id) {
      return `id("${element.id}")`;
  }
  const parts = [];
  while (element && element.nodeType === Node.ELEMENT_NODE) {
      let nbOfPreviousSiblings = 0;
      let hasNextSiblings = false;
      for (let sibling = element.previousSibling; sibling; sibling = sibling.previousSibling) {
          if (sibling.nodeType === Node.DOCUMENT_TYPE_NODE) {
              continue;
          }
          if (sibling.nodeName === element.nodeName) {
              nbOfPreviousSiblings++;
          }
      }
      for (let sibling = element.nextSibling; sibling && !hasNextSiblings; sibling = sibling.nextSibling) {
          if (sibling.nodeName === element.nodeName) {
              hasNextSiblings = true;
          }
      }
      const tagName = element.nodeName.toLowerCase();
      const part = hasNextSiblings || nbOfPreviousSiblings ? `${tagName}[${nbOfPreviousSiblings + 1}]` : tagName;
      parts.unshift(part);
      element = element.parentNode;
  }
  return parts.length ? "/" + parts.join('/') : null;
}

function getCssPath(element) {
  if (!element) {
      return null;
  }
  let path = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
      let selector = element.nodeName.toLowerCase();
      if (element.id) {
          selector += '#' + element.id;
          path.unshift(selector);
          break;
      } else if (element.className) {
          selector += '.' + Array.from(element.classList).join('.');
      }
      let sibling = element;
      let siblingSelectors = [];
      while (sibling !== null) {
          if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === element.nodeName) {
              siblingSelectors.unshift(selector);
          }
          sibling = sibling.previousSibling;
      }
      path.unshift(selector + ':nth-of-type(' + (siblingSelectors.indexOf(selector) + 1) + ')');
      element = element.parentNode;
  }
  return path.join(' > ');
}

function findElementByIdentifiers(identifiers) {
  let element = null;

  // Try ID
  if (identifiers.id) {
      element = document.getElementById(identifiers.id);
      if (element) return element;
  }

  // Try full CSS Path
  if (identifiers.fullCssPath) {
      element = document.querySelector(identifiers.fullCssPath);
      if (element) return element;
  }

  // Try CSS Path
  if (identifiers.cssPath) {
      element = document.querySelector(identifiers.cssPath);
      if (element) return element;
  }

  // Try XPath
  if (identifiers.xpath) {
      const result = document.evaluate(identifiers.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      if (result.singleNodeValue) return result.singleNodeValue;
  }

  // Try Name Attribute
  if (identifiers.name) {
      element = document.querySelector(`[name="${identifiers.name}"]`);
      if (element) return element;
  }

  // Try Relative CSS Selector
  if (identifiers.relativeCssSelector) {
      element = document.querySelector(identifiers.relativeCssSelector);
      if (element) return element;
  }

  // Try Classes
  if (identifiers.classes) {
      element = document.querySelector('.' + identifiers.classes);
      if (element) return element;
  }

  // Try Attributes (All attributes selector)
  let attributeSelector = Object.entries(identifiers.attributes).map(([key, value]) => `[${key}="${value}"]`).join('');
  if (attributeSelector) {
      element = document.querySelector(attributeSelector);
      if (element) return element;
  }

  // Try Computed Role
  if (identifiers.computedRole) {
      element = Array.from(document.querySelectorAll(identifiers.tagName)).find(el => el.getAttribute('role') === identifiers.computedRole);
      if (element) return element;
  }

  // Try Nearest Form or Landmark
  if (identifiers.nearestLandmark) {
      const landmark = document.querySelector(identifiers.nearestLandmark);
      if (landmark) {
          element = landmark.querySelector(identifiers.tagName);
          if (element) return element;
      }
  }

  // Try Text Content Pattern
  if (identifiers.textPattern) {
      element = Array.from(document.querySelectorAll(identifiers.tagName)).find(el => el.textContent.includes(identifiers.textPattern));
      if (element) return element;
  }

  // Try Style Hash
  if (identifiers.styleHash) {
      element = Array.from(document.querySelectorAll(identifiers.tagName)).find(el => btoa(window.getComputedStyle(el).cssText) === identifiers.styleHash);
      if (element) return element;
  }

  // Try Position
  if (identifiers.position) {
      const [x, y] = identifiers.position.split(':').map(Number);
      element = document.elementFromPoint(x, y);
      if (element && element.closest(identifiers.tagName)) return element;
  }

  // Try Content Hash
  if (identifiers.contentHash) {
      element = Array.from(document.querySelectorAll(identifiers.tagName)).find(el => getContentHash(el.textContent) === identifiers.contentHash);
      if (element) return element;
  }

  return null; // No element found
}