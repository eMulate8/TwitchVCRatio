
chrome.action.onClicked.addListener(async () => {
	
  const existingWindows = await chrome.windows.getAll();
  const myPopup = existingWindows.find(win => win.type === 'popup' && win.title === 'O/C Ratio');

  if (myPopup) {
    chrome.windows.update(myPopup.id, { focused: true });
  } else {
	const displays = await chrome.system.display.getInfo();
    const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
	const width = 250;
	const height = 350;
	const leftPos = Math.round(primaryDisplay.workArea.width - width - 20);
	const topPos = 100;
	
    chrome.windows.create({
      url: "popup.html",  
      type: "popup",
      width: width,
      height: height,
      left: leftPos,
      top: topPos,
      focused: true
    });
  }
});
