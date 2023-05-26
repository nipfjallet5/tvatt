import buildInfo from '../buildInfo.json'
import {WeekSchedule} from './elements/weekScheduleHTMLElement'
import {WeekSelector} from './elements/weekSelectorHTMLElement'

window.myOldSessions = [];
window.myTodaySessions = [];
window.haveOldSessions = false;

// let dropbox;
let weekSelector;
let weekSchedule;
let version = 1;

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

function manageOldSessions(message, init) {

    if (init) {
        $('#oldBookingsList').html('');
        if (window.myOldSessions.length > 0) {
            window.haveOldSessions = true;
            window.myOldSessions.forEach(mos => {
                mos.onDelete((deletedSession) => {
                    window.myOldSessions = window.myOldSessions.filter(mosInner => mosInner !== deletedSession);
                    if (window.myOldSessions.length === 0) {
                        window.haveOldSessions = false;
                        $('#oldSessionsPanel').panel('close');
                    }
                })
                $('#oldBookingsList').append(mos);
            })
            $('#oldSessionsPanelMessage').html(message);
            $('#oldSessionsPanel').panel('open');
        }
    }
    else {
        $('#oldSessionsPanelMessage').html(message);
        $('#oldSessionsPanel').panel('open');
    }
}

function manageTodaySessions(message) {
    const tds = window.myTodaySessions[0];
    $('#todaySessionPanelMessage').html(message);
    $('#todayBookingsList').html('');
    $('#todaySessionPanel').panel('open');
    tds.onDelete((deletedSession) => {
        $('#todaySessionPanel').panel('close');
    })
    $('#todayBookingsList').append(tds);
}

function manageActiveSessions(message) {
    const as = window.activeSession;
    $('#todaySessionPanelMessage').html(message);
    $('#todayBookingsList').html('');
    $('#todaySessionPanel').panel('open');
    as.onDelete((deletedSession) => {
        $('#todaySessionPanel').panel('close');
    })
    $('#todayBookingsList').append(as);
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
        manageOldSessions('Checka av gamla pass.', true);
    })
    
    weekSchedule[0].onBookingClick((status, sessions) => {
        if (status === 'haveOldSessions') {
            manageOldSessions('Checka av gamla pass innan du bokar ett nytt.', false);
        }
        if (status === 'haveOldSessionsDelete') {
            manageOldSessions('Checka av gamla pass innan du tar bort dem.', false);
        }
        if (status === 'sessionActive') {
            manageActiveSessions('Checka av pågående pass. Om du inte använde tiden välj "tvättade aldrig"', false);
        }
        if (status === 'isTodaySession') {
            manageTodaySessions('Checka av pass');
        }
    })

    content.append(weekSelector);
    content.append(weekSchedule);

    weekSelector[0].setDate((new Date()))

    $('#buildhash').html(`build: ${buildInfo.buildHash}`)

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
