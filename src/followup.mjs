import CryptoJS from 'crypto-js';
import nodemailer from 'nodemailer';
import dateformat from 'dateformat';
import gapi from 'googleapis';
import fs from 'fs';
import {getRecentlyFinishedSession, fetchEnc} from './dropbox.mjs';

let password = CryptoJS.SHA256(process.argv[2]).toString();

async function sendMail(messageHtml, messageText, address) {

    const gauth = JSON.parse(CryptoJS.AES.decrypt(fs.readFileSync('assets/private/enc/gauth.json.enc').toString(), password).toString(CryptoJS.enc.Utf8));

    const OAuth2 = gapi.google.auth.OAuth2;
    const oauth2Client = new OAuth2(gauth.fakturor.client_id, gauth.fakturor.client_secret, 'https://developers.google.com/oauthplayground');
    console.log(gauth.fakturor.client_id);
    console.log(gauth.fakturor.client_secret);
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
        from: 'nipfjallet5@gmail.com',
        to: address,
        bcc: 'nipfjallet5@gmail.com',
        subject: 'ditt tvättpass',
        text: messageText,
        html: messageHtml
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

// (async () => {
//     const data = (await fetchEnc('data', password));
//     const apartment = '121';
//     sendMail(`Session for ${apartment} (${data.apartments_new[apartment].email}) ended.`)
// })()

getRecentlyFinishedSession(password, 1).then(async sessions => {
    const data = (await fetchEnc('data', password));
    if (sessions.length > 0) {
        console.log(sessions);
        console.log(sessions[0].getApartment());

        const messageHtml = `Hej!<br>
<br>
Ditt tvättpass mellan ${dateformat(sessions[0].getStartTime(),"HH")} - ${dateformat(sessions[0].getEndTime(),"HH")} är slut. Du kan nu gå in på <a href="https://nipfjallet5.se/tvatt/">appen</a> och checka av passet. Detta måste göras för att kunna boka ett nytt pass.<br>
<br>
Mvh<br>
Tvättappen<br>
`
const messageText = `Hej!

Ditt tvättpass mellan ${dateformat(sessions[0].getStartTime(),"HH")} - ${dateformat(sessions[0].getEndTime(),"HH")} är slut. Du kan nu gå in på appen (https://nipfjallet5.se/tvatt) och checka av passet. Detta måste göras för att kunna boka ett nytt pass.

Mvh
Tvättappen
`
        console.log('sending mail to', data.apartments_new[sessions[0].getApartment()].email);
        
        // sendMail(messageHtml, messageText, data.apartments_new[sessions[0].getApartment()].email)
    }
});

    
// sendMail(/*html*/`
// <html>
// <head>
//     <style>
//     button {
//         width: 200px;
//     }
//     </style>
// </head>
// <body>
//     Hej!
    
//     <p>Hoppas att tvättandet gick bra idag. </p>

//     <p>
//     <a href="http://localhost:5000/checkout.html?p=12320230522">Kryssa i</a> den städning du utfört efter passet.
//     </p>

//     <p>
//     Tack för kvitteringen!
//     </p>
//     <p>
//     Mvh
//     Tvättappen
//     </p>

// </body>
// </html>
// `);


