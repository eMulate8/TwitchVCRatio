let currentTabId = null;
let intervalId = null;
const chattersList = new Map();
const innactiveChatters = new Map();
const bots = ['twitchbot', 'twitchmod', 'moobot', 'nightbot', 'streamelements', 'streamlabs', 'phantombot', 'wizebot', 'deepbot', 'fossabot', 'blerpbot', 'commanderroot', 'xanbot'];
const ratioList = new Map();
const updateInterval = 30000;

class CachedSumList {
  constructor() {
    this.values = [];
    this.sum = 0;
  }
  
  add(value) {
    this.values.push(value);
    this.sum += value;
    return this;
  }
  
  getAverage() {
    return this.values.length === 0 ? 0 : this.sum / this.values.length;
  }
}

const onlineAmountList = new CachedSumList();


function highlightOnUpdate(element, newValue) {
    if (element.textContent !== newValue) {
        element.textContent = newValue;
        element.classList.remove('highlight');
        void element.offsetWidth;
        element.classList.add('highlight');
    }
}

function timeStringToSeconds(input) {
    const timeMatch = input.match(/^(\d{1,2}):(\d{2}):(\d{2})/);
    
    if (!timeMatch) {
        throw new Error("Invalid time format");
    }
    
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const seconds = parseInt(timeMatch[3], 10);
    
    return hours * 3600 + minutes * 60 + seconds;
}

async function getActiveTabHtml(tab) {
	try {
		const results = await chrome.scripting.executeScript({
		target: {tabId: tab.id},
		func: () => {
			return document.documentElement.outerHTML;
		}
		});
    
		return results[0].result;
	} catch (error) {
		console.error('Error getting body content:', error);
	}
}

async function processActiveTab(tab) {
	const content = await getActiveTabHtml(tab);
	if (!content) return;
	const streamer = document.getElementById('streamer');
	const viewers = document.getElementById('viewers');
	const chatters = document.getElementById('chatters');
	const currnetRatio = document.getElementById('cratio');	
	const avarageRatio = document.getElementById('aratio');	
	const parser = new DOMParser();
	const doc = parser.parseFromString(content, 'text/html');
	const selector = 'div.channel-root.channel-root--watch-chat.channel-root--live.channel-root--watch.channel-root--unanimated';
	const liveDiv = doc.querySelector(selector);
	if (liveDiv !== null) {
		const pathname = new URL(tab.url).pathname;
		const clearedPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
		if (clearedPath) {
			streamer.textContent = clearedPath;
		}
		const online = doc.querySelector('strong[data-a-target="animated-channel-viewers-count"]');
		const chatMembers = doc.querySelectorAll('.chat-line__username');
		const liveTime = doc.querySelector('.live-time');
		if (online) {
			const textCount = online.textContent;
			const cleanedCount = textCount.replace(/\D/g, '');
			const viewersCount = Number(cleanedCount);
			highlightOnUpdate(viewers, textCount);
			onlineAmountList.add(viewersCount);
			const currentChattersList = Array.from(chatMembers).map(chatMember => chatMember.innerText);
			const currentSeconds = timeStringToSeconds(liveTime.textContent);
			for (const chatter of currentChattersList) {
				if (!bots.includes(chatter.toLowerCase())){
					chattersList.set(chatter, currentSeconds);
				} 
			}
			for (const [key, value] of chattersList){
				if (value < currentSeconds - 3600) {
					inactiveChatters.set(key, value);
					chattersList.delete(key);
				}
			}

			const currentRatio = Math.round((chattersList.size / viewersCount) * 1000) / 1000;
			const averageRatio = Math.round(((chattersList.size + innactiveChatters.size / 2) / onlineAmountList.getAverage()) * 1000) / 1000;
			ratioList.set(currentSeconds, [currentRatio, averageRatio]);
			highlightOnUpdate(chatters, chattersList.size);
			highlightOnUpdate(currnetRatio, ratioList.get(currentSeconds)[0]);
			highlightOnUpdate(avarageRatio, ratioList.get(currentSeconds)[1]);
		}
	} else {
		streamer.textContent = 'This is not a live stream page';
	}
}

async function checkAndProcessTab(tab) {

	if (currentTabId !== tab.id) {
		clearInterval(intervalId);
		currentTabId = tab.id;
    
		await processActiveTab(tab);
		intervalId = setInterval(() => processActiveTab(tab), updateInterval);
	}
}


window.addEventListener('DOMContentLoaded', () => {
	const warnElement = document.getElementById('warn');

	chrome.tabs.query({active: true}, (tabs) => {
		if (chrome.runtime.lastError) {
		  console.error(chrome.runtime.lastError);
		  return;
		}
		const webTabs = tabs.filter(tab => !tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('chrome://'));
		const twitchTab = webTabs.find(tab => tab.url.includes('twitch.tv') || new URL(tab.url).hostname.endsWith('twitch.tv'));
		if (twitchTab) {
			warnElement.hidden = true;
			chrome.tabs.onActivated.addListener(() => checkAndProcessTab(twitchTab));
			chrome.windows.onFocusChanged.addListener(() => checkAndProcessTab(twitchTab));
			checkAndProcessTab(twitchTab);
		}
		else {
			warnElement.hidden = false;
		}
	});

});
