// Copyright (c) 2020 Cisco and/or its affiliates.
//
//     This software is licensed to you under the terms of the Cisco Sample
// Code License, Version 1.1 (the "License"). You may obtain a copy of the
// License at
//
// https://developer.cisco.com/docs/licenses
//
//     All use of the material herein must be in accordance with the terms of
// the License. All rights not expressly granted by the License are
// reserved. Unless required by applicable law or agreed to separately in
// writing, software distributed under the License is distributed on an "AS
// IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
// or implied.


import xapi from 'xapi';
const TOKEN = ''; //BOT Token
const listOfDomains = ['test.com', 'example.com', 'example2.com']; //do not include the @ simbol eg: example.com, separate with commas if multiple domains present
const listOfEmails = ['example1@cisco.com']; //full email address, separate with commas if mutiple emails present
const personalDeviceModels = ['dx80','deskpro','roomkit']; //// list of device models that could appear in the URI of personal devices to check for.

const IGNORE=0;
const END=1;

const PERSONAL_UNKNOWN_ACTION = IGNORE; // Action to take on personal devices for unknown calls
const SHARED_UNKNOWN_ACTION =  END; // Action to take on shared devices for unknown calls
const PERSONAL_UNKNOWN_SHOW_ALERT = true; // Show alert message prompt for unknown calls on personal devices?
const SHARED_UNKNOWN_SHOW_ALERT = false; // Show alert message prompt for unknown calls on shared devices?


var susCallOffering=false;
var isPersonal=false;

async function getURI()
{
   let deviceURI = await xapi.Status.UserInterface.ContactInfo.ContactMethod[1].Number.get()
   return deviceURI
}


async function init() {

  let theURI=await getURI();
  console.log('URI: ',theURI);
  if (theURI.includes('.call.')) isPersonal=true;
  let ampPos=theURI.indexOf("@")
  if (ampPos>0) {
    let theName=theURI.substring(0,ampPos)
    let undPos=theName.lastIndexOf("_")
    if (undPos>0) {
      let deviceName=theName.substring(undPos+1)
      if (personalDeviceModels.includes(deviceName.toLowerCase())) isPersonal=true;
    }
  }
  console.log('isPersonal=',isPersonal)
}

function takeBlockedAction(CallId) {
    susCallOffering=true
    if (isPersonal) {
      // personal mode device
      if (PERSONAL_UNKNOWN_ACTION==IGNORE) {
        xapi.Command.Call.Ignore({ CallId: CallId });
        if (PERSONAL_UNKNOWN_SHOW_ALERT) displaySuspiciosCall();
      } else xapi.Command.Call.Reject({ CallId: CallId });
    } else {
      // shared mode device
      if (SHARED_UNKNOWN_ACTION==IGNORE) {
        xapi.Command.Call.Ignore({ CallId: CallId });
        if (SHARED_UNKNOWN_SHOW_ALERT) displaySuspiciosCall();
      } else xapi.Command.Call.Reject({ CallId: CallId });
  
    }
  }
  


function displaySuspiciosCall() {
    xapi.Command.UserInterface.Message.Prompt.Display(
      { FeedbackId: 'displayPrompt', 
      'Option.1':'Ok', 
      Text: '🛑 🛑 🛑  Call from possible fraudulent source‼️', 
      Title: 'SUSPICIOUS CALL' });
}

xapi.Event.CallSuccessful.on( (status) => {
    console.log(status);
    console.log("Detected successful call, Turning ON DND");
    console.log('User is in a meeting *********')
    susCallOffering=false;
    xapi.Command.Conference.DoNotDisturb.Activate();
    xapi.Command.UserInterface.Message.Prompt.Clear(
        { FeedbackId: 'displayPrompt' });
});

xapi.Event.CallDisconnect.on( () => {
    console.log("Detected call disconnect, Turning OFF DND");
    xapi.Command.Conference.DoNotDisturb.Deactivate();
    susCallOffering=false;
    xapi.Command.UserInterface.Message.Prompt.Clear(
    { FeedbackId: 'displayPrompt' });
});

xapi.event.on('UserInterface Message Prompt Response', (event) =>
{
  switch(event.FeedbackId){
    case 'displayPrompt':
      if (susCallOffering) {
          console.log("Redisplaying the prompt");
          displaySuspiciosCall();
        }
    break;
  }
});

xapi.event.on('UserInterface Message Prompt Cleared', (event) =>
{
  switch(event.FeedbackId){
    case 'displayPrompt':
      if (susCallOffering) {
          console.log("Redisplaying the prompt");
          displaySuspiciosCall();
        }
    break;
  }
});


xapi.Status.Call
    .on(value => {
        console.log(`Call Status Message:`);
        console.log(value);

        let AnswerState = value['AnswerState'];
        let CallbackNumber = value['CallbackNumber'];
        let Direction = value['Direction'];
        let RemoteNumber = value['RemoteNumber'];
        let Status = value['Status'];
        const CallId = value['id'];

        // console.log(`Answer State = ${AnswerState}`);
        // console.log(`Callback Number = ${CallbackNumber}`);
        // console.log(`Direction = ${Direction}`);
        // console.log(`Remote Number = ${RemoteNumber}`);
        // console.log(`Status = ${Status}`);

        //Incoming IF
        if(Direction == 'Incoming' && Status == 'Ringing') {
            console.log(`Call direction INCOMING`)

            //--- USED FOR CALL THAT DO HAVE @ SIMBOL
            if(CallbackNumber.search("@") > 0){
                console.log(`Callback Number HAS @, No need for API CALL`)

                //IF/Else to check for validation
                const incomingCallingEmail1 = CallbackNumber;
                console.log(`Incoming Calling Email: ${incomingCallingEmail1}`);

                //Gets DOMAIN from incoming email
                let incomingCallingDomain1 = incomingCallingEmail1.split("@").pop();
                console.log(`Incoming Domain from Email: ${incomingCallingEmail1}`);

                //IF/ELSE to check for validation - Either Email or Domain
                if(listOfDomains.includes(incomingCallingDomain1) || listOfEmails.includes(incomingCallingEmail1)){
                    //If it is a permited Email or Domain the call is allowed to connect
                    console.log('Domain or Email permited');

                } else {
                    //Else the call is blocked
                    console.log('Domain or Email not allowed')
                    // xapi.Command.UserInterface.Message.Alert.Display({Text: 'The incoming call was not allowed by a user script on the device', Duration: 15,});
                    //xapi.Command.Call.Disconnect({CallId: CallId});
                    console.log(`Call NOT ALLOWED, taking configurable action on call from the following calling number: ${incomingCallingEmail1}`)
                    takeBlockedAction(CallId);
                }

                //---USED FOR CALLS WITHOUT @ SIMBOL --- ELSE TO EXTRACT EMAIL FROM WEBEX ID AND API CALL
            } else {
                console.log(`Callback Number DOES NOT have @, need to for API Call`);
                const CallBackNumberWithOut = CallbackNumber.split(":").pop();
                console.log(`Callback Number: ${CallbackNumber}`);
                console.log(`Callback Number Without Colon: ${CallBackNumberWithOut}`);
                console.log(`Remote Number: ${RemoteNumber}`);

                //SEND API Request to Webex Cloud and Get answer
                const POST_URL = `https://api.ciscospark.com/v1/people/${CallBackNumberWithOut}`;
                const headers = ['Content-Type: application/json','Authorization: Bearer ' + TOKEN];
                xapi.Command.HttpClient.Get({Header: headers,ResultBody: 'PlainText',Url: POST_URL})
                    .then(result => {
                        if(result != undefined){
                            // console.log(result);
                            console.log(`EMAIL FOUND FROM WEBEX ID, VALIDATING EMAIL OR DOMAIN`);
                            //Gets EMAIL
                            let incomingCallingEmail = JSON.parse(result.Body)["userName"];
                            console.log(`Incoming Calling Email: ${incomingCallingEmail}`);

                            //Gets DOMAIN from incoming email
                            let incomingCallingDomain = incomingCallingEmail.split("@").pop();
                            console.log(`Incoming Domain from Email: ${incomingCallingDomain}`);

                            //IF/ELSE to check for validation - Either Email or Domain
                            if(listOfDomains.includes(incomingCallingDomain) || listOfEmails.includes(incomingCallingEmail)){
                                //If it is a permited Email or Domain the call is allowed to connect
                                console.log('Domain or Email permited');

                            } else {
                                // Else the call is blocked // BLOCKING CALL ########################################
                                console.log(`Domain or Email not allowed - ${CallId}`);
                                //xapi.Command.Call.Disconnect({CallId: CallId});
                                console.log(`Call NOT ALLOWED, WILL NOT ALERT call from the following calling number: ${incomingCallingEmail}`);
                                takeBlockedAction(CallId);
                            }
                        } else {
                            //WEBEX IDS FROM OTHER WEBEX ORGS OR UNKNOWNED ORGS WILL BE BLOCKED
                            console.log(`EMAIL NOT FOUND FROM WEBEX ID, CANNOT VALIDATE EMAIL OR DOMAIN`);
                            console.log('Not possible to validate - Domain or Email not allowed');
                            xapi.Command.UserInterface.Message.Alert.Display({Text: 'The incoming could not be validated', Duration: 15,});
                            //xapi.Command.Call.Disconnect();
                            takeBlockedAction(CallId);
                            console.log(`Call NOT ALLOWED`)
                        }
                    })
            }
        }
    })

    init();






