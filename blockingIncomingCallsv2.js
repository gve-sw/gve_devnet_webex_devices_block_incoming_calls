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
const listOfDomains = ['test.com', 'example.com', 'example2.com'];
const listOfEmails = ['user@example.com'];


xapi.Status.Call
    .on(value => {
        console.log(`Call Status Message:`);
        console.log(value);

        let AnswerState = value['AnswerState'];
        let CallbackNumber = value['CallbackNumber'];
        let Direction = value['Direction'];
        let RemoteNumber = value['RemoteNumber'];
        let Status = value['Status'];

        // console.log(`Answer State = ${AnswerState}`);
        // console.log(`Callback Number = ${CallbackNumber}`);
        // console.log(`Direction = ${Direction}`);
        // console.log(`Remote Number = ${RemoteNumber}`);
        // console.log(`Status = ${Status}`);

        //Outgoing IF --- NO NEED FOR OUTGOING CALL TREATMENT
        // if(Direction == 'Outgoing') {
        //   console.log(`The call's direction is OUTGOING`);
        // }

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
                    console.log('Domain or Email blocked')
                    xapi.Command.UserInterface.Message.Alert.Display({Text: 'The incoming call was not allowed by a user script on the device', Duration: 15,});
                    xapi.Command.Call.Disconnect();
                    console.log(`Call NOT ALLOWED, Disconecting call from the following calling number: ${incomingCallingEmail1}`)
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
                        //IT IS IMPOSSIBLE TO VALIDATE WEBEX IDS FROM OTHER WEBEX ORGANIZATIONS, WE WOULD HAVE TO POSSESS THE ADMIN TOKEN OF EACH ORG TO BE ABLE TO VALIDATE. WE CAN ONLY VALIDATE WEBEX IDS FROM OUR OWN ORG
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
                                //Else the call is blocked
                                console.log('Domain or Email blocked');
                                xapi.Command.UserInterface.Message.Alert.Display({Text: 'The incoming call was not allowed by a user script on the device', Duration: 15,});
                                xapi.Command.Call.Disconnect();
                                console.log(`Call NOT ALLOWED, Disconecting call from the following calling number: ${incomingCallingEmail}`)
                            }
                        } else {
                            //WEBEX IDS FROM OTHER WEBEX ORGS OR UNKNOWEND ORGS WILL BE BLOCKED
                            console.log(`EMAIL NOT FOUND FROM WEBEX ID, CANNOT VALIDATE EMAIL OR DOMAIN`);
                            console.log('Not possible to validate - Domain or Email blocked');
                            xapi.Command.UserInterface.Message.Alert.Display({Text: 'The incoming could not be validated', Duration: 15,});
                            xapi.Command.Call.Disconnect();
                            console.log(`Call NOT ALLOWED`)
                        }
                    })
            }
        }
    })
