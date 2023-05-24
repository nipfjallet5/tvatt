import buildInfo from '../buildInfo.json'
import {OlderBooking} from './elements/olderBookingHTMLElement'
import {WeekSchedule} from './elements/weekScheduleHTMLElement'
import {WeekSelector} from './elements/weekSelectorHTMLElement'

// let dropbox;
let weekSelector;
let weekSchedule;
let version = 1;
let allBookings = {};

Date.prototype.getWeek = function() {
    let date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    let week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
};

// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function() {
    let date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
};

Date.prototype.getPreviousMonday = function() {
    let date = new Date(this.valueOf());
    let day = this.getDay();
    let diff = this.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday
    return new Date(date.setDate(diff));
};

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    // let date = new Date(this.valueOf());
    // date.setDate(date.getDate() + days);
    // return date;
};

Date.prototype.getDayOffset = function(days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

Date.prototype.isSameDay = function(date) {
    return this.getFullYear() === date.getFullYear() &&
        this.getMonth() === date.getMonth() &&
        this.getDate() === date.getDate();
};

function hideKeyboard(element) {
    element.attr('readonly', 'readonly'); // Force keyboard to hide on input field.
    element.attr('disabled', 'true'); // Force keyboard to hide on textarea field.
    setTimeout(function() {
        element.blur();  //actually close the keyboard
        // Remove readonly attribute after keyboard is hidden.
        element.removeAttr('readonly');
        element.removeAttr('disabled');
    }, 100);
}

function manageOldBookings(apartment, startDate, message) {
    const rightNow = startDate;
    rightNow.setHours(0);
    rightNow.setMinutes(0);
    rightNow.setSeconds(0);
    rightNow.setMilliseconds(0);
    const oldBookings = {};
    Object.entries(allBookings).filter(([key, value]) => value.apartment === apartment).forEach(([key, b]) => {
        console.log(key, b.data);
        const bookingDate = new Date(b.year, b.month-1, b.day);
        const olderBookingKey = `${b.year}-${b.month<10?'0':''}${b.month}-${b.day-1<10?'0':''}${b.day}`;
        if (bookingDate < rightNow) {
            if (!oldBookings.hasOwnProperty(olderBookingKey)) oldBookings[olderBookingKey] = [];
            oldBookings[olderBookingKey].push({booking: b, date: bookingDate});
        }
    })
    if (Object.keys(oldBookings).length > 0) {
        $('#oldBookingsList').html('');
        Object.entries(oldBookings).forEach(([key, ob]) => {
            const olderBooking = new OlderBooking(ob, key);
            olderBooking.onDelete((key) => {
                delete oldBookings[key];
                if (Object.keys(oldBookings).length === 0) $('#dialogPanel').panel('close');
            })
            $('#oldBookingsList').append(olderBooking);
        })

        if (message) $('#dialogPanelMessage').html(message);
        $('#dialogPanel').panel('open');
        return false;
    }
    return true;
}

function manageSessions(sessions) {

    const myOldSessions = Object.values(sessions).filter(s => s.isMySession && s.isOldSession)
    const myTodaySessions = Object.values(sessions).filter(s => s.isMySession && s.isTodaySession)
    console.log(myOldSessions);
    console.log(myTodaySessions);

    Object.values(sessions).forEach(s => {
        console.log(s.getStartTime(), s.followingSession ? s.followingSession.getApartment() : '-');
    })

    // const sortedSessions = Object.values(sessions).sort((a,b) => a.getStartTime() - b.getStartTime());
    // const allSessions = Object.values(sessions);
    // allSessions.forEach(s => {
    //     const sessionIndex = sortedSessions.findIndex(ss => ss.getStartTime().getTime() === s.getStartTime().getTime());
    //     if (sessionIndex < allSessions.length - 1) s.followingSession = sortedSessions[sessionIndex + 1];
    //     console.log(s.getStartTime(), sessionIndex, s.followingSession ? s.followingSession.getStartTime() : '-');
    // })

    // console.log(Object.values(sessions).sort((a,b) => a.getStartTime() - b.getStartTime()).map(s => s.getStartTime()));
    
    // $('#dialogPanel').panel('open');

    // if (Object.keys(oldBookings).length > 0) {
    //     $('#oldBookingsList').html('');
    //     Object.entries(oldBookings).forEach(([key, ob]) => {
    //         const olderBooking = new OlderBooking(ob, key);
    //         olderBooking.onDelete((key) => {
    //             delete oldBookings[key];
    //             if (Object.keys(oldBookings).length === 0) $('#dialogPanel').panel('close');
    //         })
    //         $('#oldBookingsList').append(olderBooking);
    //     })

    //     if (message) $('#dialogPanelMessage').html(message);
    //     $('#dialogPanel').panel('open');
    //     return false;
    // }
    // return true;
}

let loadApp = function(){

    window.dropbox = new Dropbox.Dropbox({
        fetch: fetch,
        accessToken: localStorage.getItem('dbtoken')
    });

    let content = $('#content');
    content.html('');

    weekSelector = $(new WeekSelector());
    weekSchedule = $(new WeekSchedule())
        .on('swipeleft', event => {
            weekSelector[0].shiftDays(7);
            weekSchedule[0].slide('right');
        })
        .on('swiperight', event => {
            weekSelector[0].shiftDays(-7);
            weekSchedule[0].slide('left');
        });

        weekSelector.on('shiftWeekLeft', () => {
            weekSchedule[0].slide('left');
        });
        weekSelector.on('shiftWeekRight', () => {
            weekSchedule[0].slide('right');
        });

        weekSelector.on('setWeek', (event, weekInfo) => {
            weekSelector[0].enable(false);
            $.when(weekSchedule[0].setWeek(weekInfo)).done(() => {
                weekSelector[0].enable(true);
        });
    });

    weekSchedule[0].onReady(sessions => {
        manageSessions(sessions);
    })

    content.append(weekSelector);
    content.append(weekSchedule);

    weekSelector[0].setDate((new Date()))

    $('#buildhash').html(`(${buildInfo.buildHash})`)

};

let fetchEnc = function(name, password, key){
    return new Promise(resolve => {
        fetch(`assets/enc/${name}.json.enc`)
        .then(response => response.text())
        .then(encData => {
            resolve(JSON.parse(CryptoJS.AES.decrypt(encData, password).toString(CryptoJS.enc.Utf8)));
        })      
    })
}

let loadEnc = async function(password) {

    const dum = await Promise.all([fetchEnc('dbtoken', password), fetchEnc('data', password)]);
    const dbToken = dum[0].token;
    const apartmentInfo = dum[1];
    
    if (apartmentInfo != null) {

        $('#apartmentList').html('<p>Välj din lägenhet i listan.</p>');

        $('#password').addClass('password-valid');

        hideKeyboard($('#password'));

        Object.entries(apartmentInfo.apartments).map(([apartmentNumber, name]) => {
            $('<input type="button">')
                .attr('value', apartmentNumber + '. ' + name)
                .appendTo($('#apartmentList'))
                .button({mini: true}).button('refresh')
                .click(event => {
                    console.log('selecting', apartmentNumber + '. ' + name);

                    console.log('SAVING DATA IN LOCAL STORAGE AND LOADING APP.');

                    localStorage.setItem('apartment', apartmentNumber);
                    localStorage.setItem('name', name);
                    localStorage.setItem('dbtoken', dbToken);
                    localStorage.setItem('version', version);

                    loadApp();
                })
                .parent().each((index,item) => {
                    $(item).addClass('apartment-selector');
                });
        });
    }
    else {
        $('#password').addClass('password-invalid');
    }

}

$('#password').on('keyup',function(event) {
    $('#password').removeClass('password-valid');
    $('#password').removeClass('password-invalid');
    $('#apartmentList').html('');
    if ($(this).val().length === 4) {
        let password = CryptoJS.SHA256($(this).val()).toString();
        loadEnc(password);
    }
    else if (($(this).val().length > 4)) {
        $('#password').addClass('password-invalid');
    }
});

$(document).ready(function(){
    if (localStorage.getItem('version') !== null) {
        if (Number.parseInt(localStorage.getItem('version')) >= version) {
            loadApp();
        }
    }
    else {
        console.log('NO DATA IN LOCAL STORAGE. APP NOT LOADED.');
    }

});
