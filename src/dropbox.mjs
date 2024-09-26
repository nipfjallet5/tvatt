import db from 'dropbox';
import CryptoJS from 'crypto-js';
import fetch from 'node-fetch';
import fs from 'fs';
import printf from 'printf';
import dateformat from 'dateformat';

function toUTC(date) {
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    // return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                // date.getUTCDate(), date.getUTCHours(),
                // date.getUTCMinutes(), date.getUTCSeconds()));

}

function toSE(date) {
      return new Date(date.toLocaleString('en-US', {timeZone: 'Europe/Stockholm'}))
    //   return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: 'Europe/Stockholm'}));   
}


export function fetchEnc(name, password){
    return new Promise(resolve => {
        fs.readFile(`assets/enc/${name}.json.enc`, 'utf8', (err, encData) => {
            resolve(JSON.parse(CryptoJS.AES.decrypt(encData, password).toString(CryptoJS.enc.Utf8)));
        })
    })
}

// async function loadEnc(password) {
//     const dum = await Promise.all([fetchEnc('dbtoken', password), fetchEnc('data', password)]);
//     const dbToken = dum[0].token;
//     const apartmentInfo = dum[1];
// }

async function listAllFiles(dropbox, path) {
    let hasMore = true;
    let cursor = null;
    let response;

    const reply = {result: {entries: []}};
    while (hasMore) {
        if (cursor) {
            // If a cursor is available, continue from where we left off
            response = await dropbox.filesListFolderContinue({ cursor });
        } else {
            // Initial request
            response = await dropbox.filesListFolder({ path });

        }
        reply.result.entries = [...reply.result.entries, ...response.result.entries];
        hasMore = response.result.has_more;
        if (hasMore) {
            cursor = response.result.cursor;
        }
        else {
            cursor = null;
        }
    }
    return reply;
}


export class Booking {

    constructor(data) {
        this.data = data;
        this.isMyBooking = false;
        this.isTodayBooking = false;
        this.isOldBooking = false;
        this.startTime = new Date(data.year, Number.parseInt(data.month)-1, data.day, data.hour);
        this.endTime = new Date(this.startTime.getTime() + 1000*60*60);
        this.startTimeUTC = toUTC(this.startTime);
        this.endTimeUTC = toUTC(this.endTime);
        this.name = "slot_" +
            data.apartment + "_" +
            data.year + "_" +
            data.month + "_" +
            data.day + "_" +
            data.hour + "_" +
            data.identifier + "_" +
            'lgh' + data.apartment;
    }

    // delete() {
    //     return new Promise(resolve => {
    //         if (this.container) this.container.html('...');
    //         console.log('DELETING', this.name);
    //         window.dropbox.filesDelete({path: "/bookings/" + this.name}) //delete when canceling
    //             .then((status) =>  {
    //                 $(this).remove();
    //                 resolve(status);
    //                 this.deleteHandler('success');
    //             }, () => {console.log('an error occured');})
    //     })
    // }
}


export class LaundrySession {

    constructor(date) {
        this.bookings = [];
        this.isMySession = false;
        this.isTodaySession = false;
        this.isOldSession = false;
        this.followingSession = undefined;
        this.date = date;
        this.dateString = `${this.date.getDate()}/${this.date.getMonth()+1}`;
        this.daysAgo = Math.floor(((new Date()) - this.date)/1000/60/60/24);
        this.cleanCode = 0;
        this.onDeleteHandler = () => {};
    }

    addBookingHour(booking) {
        this.bookings.push(booking);
        this.bookings.sort((a,b) => a.startTime - b.startTime)
    }

    getApartment() {
        return this.bookings[0].data.apartment;
    }

    getStartTime() {
        return this.bookings[0].startTime;
    }

    getEndTime() {
        return this.bookings[this.bookings.length - 1].endTime;
    }

    getStartTimeUTC() {
        return new Date(this.bookings[0].startTimeUTC);
    }

    getEndTimeUTC() {
        return new Date(this.bookings[this.bookings.length - 1].endTimeUTC);
    }
}

async function getAllSessions(password) {

    const dbcreds = (await fetchEnc('dbcreds', password));
    // console.log(dbcreds);

    const dropbox = new db.Dropbox({
        fetch: fetch,
        clientId: dbcreds.clientID,
        clientSecret: dbcreds.clientSecret,
        refreshToken: dbcreds.refreshToken
    });

    const currentDate = new Date();

    const currentTime = new Date();
    const todayDate = new Date(currentTime.getFullYear(),0,0,0,0);

    const data = await listAllFiles(dropbox, '/bookings');
    let laundrySessions = data.result.entries
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
        .reduce((sessions, b) => {
            const bookingDate = new Date(b.year, b.month-1, b.day);
            const sessionKey = b.apartment + '_' + b.year + '_' + b.month + '_' + b.day;
            const booking = new Booking(b);
            booking.isOldBooking = booking.endTime < currentTime;
            booking.isTodayBooking = bookingDate.getTime() === todayDate.getTime();
            if (!sessions.hasOwnProperty(sessionKey)) sessions[sessionKey] = new LaundrySession(bookingDate);
            sessions[sessionKey].addBookingHour(booking);
            sessions[sessionKey].isOldSession = booking.isOldBooking;
            sessions[sessionKey].isTodaySession = booking.isTodayBooking;
            return sessions;
        }, {})

    const sortedSessions = Object.values(laundrySessions).sort((a,b) => a.getStartTime() - b.getStartTime());
    const allSessions = Object.values(laundrySessions);
    allSessions.forEach(s => {
        const sessionIndex = sortedSessions.findIndex(ss => ss.getStartTime().getTime() === s.getStartTime().getTime());
        if (sessionIndex < allSessions.length - 1) s.followingSession = sortedSessions[sessionIndex + 1];
    })

    return allSessions;
    
}

export async function getRecentlyFinishedSession(password, delay) {
    const allSessions = await getAllSessions(password)
    const ct = toSE(new Date());

    // allSessions.forEach(s => console.log(ct.getHours(), s.getEndTimeUTC().getHours(), s.getEndTime().getHours()));

    allSessions.sort((a,b) => a.getStartTime() - b.getStartTime()).forEach(s => {
        const hoursAfterEndTime = (ct - s.getEndTime())/1000/60/60;
        console.log(printf('%-10s %-3i %s - %s %10.1f %s', 
            s.getApartment(), 
            s.bookings.length, 
            dateformat(ct, "HH.MM"), 
            dateformat(s.getEndTime(), "HH.MM mm-dd"), 
            hoursAfterEndTime, 
            hoursAfterEndTime > 0 && hoursAfterEndTime < delay
            ));
    })

    console.log(allSessions.filter(s => (Math.abs(s.getEndTimeUTC()-ct)/1000/60/60) < 1));
    return allSessions.filter(s => {
        const hoursAfterEndTime = (ct - s.getEndTime())/1000/60/60;
        return hoursAfterEndTime > 0 && hoursAfterEndTime < delay;
    });
    // return [allSessions[1]];

}

if (!(typeof module !== 'undefined' && !module.children)) {
    let password = CryptoJS.SHA256(process.argv[2]).toString();
    const allSessions = await getAllSessions(password);
    console.log(allSessions.length);
}