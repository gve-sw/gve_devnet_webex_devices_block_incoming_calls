# GVE DevNet Webex Devices Block Incoming Calls

Webex Device Macro that blocks unknown incoming callers

## Contacts

- Max Acquatella
- Gerardo Chaves (gchaves@cisco.com)

## Solution Components

- RoomOS macros
- Webex devices

## Installation/Configuration

Configure a Webex BOT Token, for more information please see:

https://developer.webex.com/docs/bots

Copy the macro named "blockingIncomingCallsv2.js" to a new macro in your device and enable it.

Fill out the following information:

```javascript
//Copy your bot token here:
const TOKEN = "";

//Domain you want to ALLOW:
const listOfDomains = [""]; //do not include the @ simbol eg: example.com, separate with commas if multiple domains present
const listOfEmails = [""]; //full email address, separate with commas if mutiple emails present
const personalDeviceModels = ["dx80", "deskpro", "roomkit"]; // list of device models that could appear in the URI of personal devices to check for.
const PERSONAL_UNKNOWN_ACTION = IGNORE; // Action to take on personal devices for unknown calls
const SHARED_UNKNOWN_ACTION = END; // Action to take on shared devices for unknown calls
const PERSONAL_UNKNOWN_SHOW_ALERT = true; // Show alert message prompt for unknown calls on personal devices?
const SHARED_UNKNOWN_SHOW_ALERT = false; // Show alert message prompt for unknown calls on shared devices?
```

The values `END` and `IGNORE` above mean the following:  
`END`: Hang up the call as soon as possible. You might not even see it offered in the device or just for less then a second.  
`IGNORE`: The call will be offered on the device, but the ringer will be turned off.

NOTE: If you wish for the warning message prompt to completely cover the call control dialog that allows the user to answer the call, just edit the `xapi.Command.UserInterface.Message.Prompt.Display()` command in the displaySuspiciosCall() function and add two more Options as parameters, that will cause the dialog window to expand and cover the standard Answer and Decline buttons and since we are dissallowing the dismissal of the prompt, the user will not be able to take any action on the call from the Touch 10, Navigator or main screen of the device.  
Here is an example of how it could look if you want to expand it:

```javascript
function displaySuspiciosCall() {
  xapi.Command.UserInterface.Message.Prompt.Display({
    FeedbackId: "displayPrompt",
    "Option.1": "DO",
    "Option.2": "NOT",
    "Option.3": "ANSWER",
    Text: "🛑 🛑 🛑  Call from possible fraudulent source‼️",
    Title: "SUSPICIOUS CALL",
  });
}
```

## Usage

Once the macro is enabled, it will block any incoming call that is not part of the domain listed in the `listOfDomains`  
What action is taken to "block" the call will depend on if the device is a personal or workspace(shared) device and what values you use for the
PERSONAL_UNKNOWN_ACTION, SHARED_UNKNOWN_ACTION, PERSONAL_UNKNOWN_SHOW_ALERT and SHARED_UNKNOWN_SHOW_ALERT constants.

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
