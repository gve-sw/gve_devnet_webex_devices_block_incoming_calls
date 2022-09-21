/*
Copyright (c) 2020 Cisco and/or its affiliates.

This software is licensed to you under the terms of the Cisco Sample
Code License, Version 1.1 (the "License"). You may obtain a copy of the
License at

               https://developer.cisco.com/docs/licenses

All use of the material herein must be in accordance with the terms of
the License. All rights not expressly granted by the License are
reserved. Unless required by applicable law or agreed to separately in
writing, software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
or implied.
 */

import xapi from 'xapi';
const TOKEN = ''; //BOT Token

let domain1 = ''
let domain2 =  ''
let domain_length1 = domain1.length
let domain_length2 = domain2.length

// console.log(domain1_length)
// console.log(domain2_length)

let domain = domain1
let domain_length = domain_length1

xapi.Status.Call.Status.on(value => console.log(value));
xapi.Status.Call.on(value => {
    let callBackNumber = '';
    callBackNumber = value["CallbackNumber"];
    if(callBackNumber){
        console.log(`The CallBack Number is: ${callBackNumber.slice(6,42)}`);
    } else {
        console.log(`The Caller hung up`);
    }
    const POST_URL = `https://api.ciscospark.com/v1/people/${callBackNumber.slice(6,42)}`;
    const headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' + TOKEN
    ];
    xapi.Command.HttpClient.Get(
        {
            Header: headers,
            ResultBody: 'PlainText',
            Url: POST_URL
        })
        .then((result) => {
            let user_email = JSON.parse(result.Body)["emails"][0];
            console.log(`this is the users email: ${user_email} #######`)
            console.log(`Calling Number email: ${JSON.parse(result.Body)["emails"][0]}`);

            if((JSON.parse(result.Body)["emails"][0]).slice(-domain_length) != domain){ //THIS IS THE KEY, slice(xxx) has to match to the length of the domain: @XXX is -3, @XXXXX is -5 and so
                console.log('DEBUG POINT')
                xapi.Command.UserInterface.Message.Alert.Display({
                    Text: 'The incoming call was not allowed by a user script on the device',
                    Duration: 15,
                });
                xapi.Command.Call.Disconnect();
                console.log("Call NOT ALLOWED, Disconecting call from the following calling number:")
                console.log(JSON.parse(result.Body)["emails"][0])
            }
        }).catch((err) => {
        console.log('rejected', err)
    });

});

