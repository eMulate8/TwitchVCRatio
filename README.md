# TwitchVCRatio
A Chrome extension that provides real-time analytics for Twitch live streams, including viewer counts, active chatters, and engagement ratios.

## Features

- **Real-time Viewer Count**: Displays the current number of viewers
- **Active Chatters Tracking**: Shows unique users actively chatting
- **Engagement Metrics**:
  - Current chatter-to-viewer ratio
  - Average engagement ratio over time
- **Bot Filtering**: Automatically excludes known bot accounts
- **Visual Highlights**: Animated updates when numbers change
- **Streamer Identification**: Shows which channel you're viewing

## Installation

### Manual Installation
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder

## How It Works

The extension analyzes Twitch stream pages to provide:

1. **Viewer Data**: Extracts the live viewer count from Twitch's counter
2. **Chat Analysis**: Tracks all chatting users, filtering out bots
3. **Engagement Metrics**: Calculates ratios between viewers and active chatters
4. **Time Tracking**: Uses stream duration to determine active/inactive chatters

## Metrics Explained

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Current Viewers** | Total viewers watching the stream right now | Directly from Twitch's viewer counter |
| **Active Chatters** | Unique users who chatted in last 60 minutes | `chattersList.size` (excluding bots) |
| **Current Ratio** | Engagement level at this moment | `(active chatters ÷ current viewers)` |
| **Average Ratio** | Overall engagement during stream | `((active + inactive/2) ÷ average viewers)` |

## Data Collection Details

- **Viewer Count**: Updated every 30 seconds from Twitch's UI
- **Chatters**: Identified by chat messages in the DOM
- **Active Chatters**: Users who chatted within last 60 minutes of stream time
- **Inactive Chatters**: Users who chatted > 60 minutes ago but during this stream

## Installation

- Clone this repository
- In Chrome, go to chrome://extensions
- Enable "Developer mode"
- Click "Load unpacked" and select the extension directory

## Usage

- Navigate to any Twitch live stream
- Click the extension icon to view analytics
- Metrics will automatically update every 30 seconds

## Known Limitations

- Only works on live streams (not VODs)
- Requires chat to be loaded in the Twitch interface
- Some custom bots might not be filtered automatically

## Advanced Configuration and Features

### ⚙️ Update Frequency Customization

You can adjust the data refresh rate by modifying the interval variable:

`const updateInterval = 30000;` // value in milliseconds (default 30 seconds)

Refresh time = average time from when a message appears in the chat until it moves off the top edge of the chat
The current update time is suitable for channels with 100 - 300 viewers
  

### 📊 Inactive Viewers Calculation Formula

Current formula assumes:

Current assumption: 50% of inactive users left

`const averageRatio = ((activeChatters + (inactiveChatters * 0.5)) / averageViewers;`

You can adjust this setting if you do not agree with this proposal.


### 🗃️ Database Server Integration Potential

To enable historical data tracking and advanced analytics, you can set up a backend server with database support
	
Benefits of server integration:

- Historical engagement analysis
- Botting pattern detection
- Formula optimization based on statistics

### 🤖 Bot List Maintenance
Current bot list in array:

`const bots = ['twitchbot','moobot','nightbot', // ... other bots];`

Maintenance recommendations:

- Regularly check for new popular bots
- Add streamer-specific custom bots
