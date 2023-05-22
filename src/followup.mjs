import db from 'dropbox';
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import gapi from 'googleapis';
import fs from 'fs';

let password = CryptoJS.SHA256('7475').toString();

async function sendMail(message) {

    const gauth = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync('assets/enc/gauth.json.enc').toString(), password).toString(CryptoJS.enc.Utf8));

    const OAuth2 = gapi.google.auth.OAuth2;
    const oauth2Client = new OAuth2(gauth.fakturor.client_id, gauth.fakturor.client_secret, 'https://developers.google.com/oauthplayground');
    console.log(gauth.fakturor.client_id);
    console.log(gauth.fakturor.client_secret);
    // oauth2Client.setCredentials({refresh_token: gauth.fakturor.refresh_token});
    // oauth2Client.setCredentials({refresh_token: '1//04qMKyLNBbd-XCgYIARAAGAQSNwF-L9IrrcpHVSxczvfQFE3DTmbU3tMfFXqiFo61E8_J-v2srBVshkhTQAr2PsWOoA4cIWAU5HU'});
    // oauth2Client.setCredentials({refresh_token: '1//04zMzuR4YCj6wCgYIARAAGAQSNwF-L9Ir1NDFT61P9QwkzIXnhoNPAdjN7_p-CzLnzeUxrgEvAriaj2MWSHCvvok5p-PW5uN88Y8'});
    // oauth2Client.setCredentials({refresh_token: '1//04NK8XQFITFEbCgYIARAAGAQSNwF-L9IrD9-wxnz91E1ReSA27l7uNAZF1JYJKGasXgEPZKFViifCQ5TFwEhO1l_U11ZV33zKQoU'});
    oauth2Client.setCredentials({refresh_token: '1//04jkkfxInOR9sCgYIARAAGAQSNwF-L9Ir_0CZuL2s34N48HF-3sfnFc0sr-WGfHP9cqG_nwEM4zi-VHsprTvXeOzEejcp-jHct5A'});
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: "nipfjallet5@gmail.com",
            clientId: gauth.fakturor.client_id,
            clientSecret: gauth.fakturor.client_secret,
            refreshToken: gauth.fakturor.refresh_token,
            accessToken: accessToken.token,
            // accessToken: 'ya29.a0AfH6SMCAmjLWF2i8H3PczgPbrBHRgxfq3lUEU-93M9MHi_ORcqOfwPbCPaMn-nBFrstnZVHuBWIoe-fXL2LqwuxIdSe4925iQeyn3nkkQOyhffCzVRh_SX-PMmlTep-NpB9OrHitXxgpwwTvuSHfOUWZ7w33',
            tls: {
                rejectUnauthorized: false
            }
        }
    });

    const mailOptions = {
        from: 'nipfjalet5@gmail.com',
        to: 'jolundq@gmail.com',
        subject: 'tvättpass',
        text: 'text version',
        html: message
    };

    console.log(mailOptions);
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

let accessToken = "U2FsdGVkX189p19Ob4DSM/9t8eIFgKOYYEKDM4ekNsC4VsMFP3pxSm7jPgao6UTwe89bkrrd2zgL+d0sISLA6jW7nc+7HUpUHw8YRxMeqPAsLGHpenmbNddMIYwNlB5N";
const ddd = CryptoJS.AES.decrypt(accessToken, password).toString(CryptoJS.enc.Utf8);

const dropbox = new db.Dropbox({
    fetch: fetch,
    accessToken: ddd
});

const currentDate = new Date();
console.log(currentDate.getDate());


dropbox.filesListFolder({path: ''})
.then(data => {

    let bookings = data.result.entries
    .filter(booking => booking.name.startsWith("slot_"))
    .map(booking => {
        let bookingData = {
            apartment: booking.name.split('_')[1],
            year: booking.name.split('_')[2],
            month: booking.name.split('_')[3],
            day: booking.name.split('_')[4],
            hour: booking.name.split('_')[5],
            identifier: booking.name.split('_')[6]
        };

        return bookingData;
    })
    .filter(booking => Number.parseInt(booking.year) == currentDate.getFullYear())
    .filter(booking => Number.parseInt(booking.month-1) == currentDate.getMonth())
    .filter(booking => Number.parseInt(booking.day) == currentDate.getDate())

    sendMail(/*html*/`

    <html>
    <head>
        <style>
        button {
            width: 200px;
        }
        </style>
    </head>
    <body>
        Hej!
        
        <p>Hoppas att tvättandet gick bra idag. </p>

        <p>
        <a href="http://localhost:5000/checkout.html?p=12320230522">Kryssa i</a> den städning du utfört efter passet.
        </p>

        <p>
        Tack för kvitteringen!
        </p>
        <p>
        Mvh
        Tvättappen
        </p>

    </body>
    </html>
    `);
    
});


// 
// console.log(dropbox);
