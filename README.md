# gve_devnet_webex_devices_block_incoming_calls
Webex Device Macro that blocks unknown incoming callers

## Contacts
* Max Acquatella

## Solution Components
* RoomOS macros
* Webex devices


## Installation/Configuration

Configure a Webex BOT Token, for more information please see:

https://developer.webex.com/docs/bots

Copy the macro named "blockingIncomingCallsv2.js" to a new macro in your device and enable it.

Fill out the following information:
```javascript
//Copy your bot token here: 
const TOKEN = ''

//Domain you want to ALLOW:
const listOfDomains = [''] //do not include the @ simbol eg: example.com, separate with commas if multiple domains present
const listOfEmails = [''] //full email address, separate with commas if mutiple emails present
```

## Usage

Once the macro is enabled, it will block any incoming call that is not part of the domain listed in the domain1

# Screenshots

![/IMAGES/1image.png](/IMAGES/1image.png)

### LICENSE

Provided under Cisco Sample Code License, for details see [LICENSE](LICENSE.md)

### CODE_OF_CONDUCT

Our code of conduct is available [here](CODE_OF_CONDUCT.md)

### CONTRIBUTING

See our contributing guidelines [here](CONTRIBUTING.md)

#### DISCLAIMER:
<b>Please note:</b> This script is meant for demo purposes only. All tools/ scripts in this repo are released for use "AS IS" without any warranties of any kind, including, but not limited to their installation, use, or performance. Any use of these scripts and tools is at your own risk. There is no guarantee that they have been through thorough testing in a comparable environment and we are not responsible for any damage or data loss incurred with their use.
You are responsible for reviewing and testing any scripts you run thoroughly before use in any non-testing environment.
