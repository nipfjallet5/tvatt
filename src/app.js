'use strict';

let dropbox;
let weekSelector;
let weekSchedule;
let version = 1;
let myBookings = {};

// let AESencrypt = function(str, key) {
//     return CryptoJS.AES.encrypt(str, key);
// };
//
// let AESdecrypt = function(str, key) {
//     return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);
// };

// function decryptFile(inFile, password) {
//     fs.readFile(inFile, (err, data) => {
//         if (err) throw err;
//         let dectrypted_b64 = CryptoJS.AES.decrypt(data.toString(), password).toString(CryptoJS.enc.Utf8);
//         console.log(dectrypted_b64);
//     });
// }
// Returns the ISO week of the date.

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

function isValidBooking(data) {
    return true;
}

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

let getBookings = function() {

    let fetchTask = new $.Deferred();

    dropbox.filesListFolder({path: ''})
        .then(data => {

            let bookings = data.entries
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
                });

            let duplicateBookings = data.entries
                .filter(booking => booking.name.startsWith("slot_"))
                .map(booking => {
                    // console.log(booking.name, booking.server_modified);
                    return booking.name.split('_').slice(2,6).join('_')
                })
                .reduce((acc, el, i, arr) => {
                    if (arr.indexOf(el) !== arr.lastIndexOf(el)) {
                        if (!acc.hasOwnProperty(el)) acc[el] = [];
                        acc[el].push(data.entries[i]);
                    }
                    return acc;
                }, {});

            Object.values(duplicateBookings).forEach(dbs => {
                return dbs
                    .sort((a, b) => (new Date(a.server_modified) - new Date(b.server_modified)))
                    .reduce((res, db, i, array) => array.slice(1), [])
                    .forEach(db => {
                        console.log('deleting', db.path_lower);
                        dropbox.filesDelete({path: db.path_lower}).then(() => {
                            console.log('duplicates deleted');
                            weekSchedule[0].reload();
                        });
                    })
            });

            fetchTask.resolve(bookings);

        }, console.error);

    return fetchTask;
};

class WeekSelector extends HTMLElement {
    constructor() {
        super();
        let template = document.createElement('template');
        template.innerHTML = `
            <style>
                .info-grid {
                  display: grid;
                  grid-template-columns: 45px auto;
                }
            </style>
            
            <div class="info-grid">
                <div id="infoWrapper"><input data-wrapper-class="infoButton" id="info" type="button"></div>
                <div id="headerWrapper"><input data-wrapper-class="headerButton" id="header" type="button"></div>
            </div>
            <div class="ui-grid-b">
                <div class="ui-block-a"><input class="weekSelectButton" id="previous" type="button" value="förra"></div>
                <div class="ui-block-b"><input class="weekSelectButton" id="current" type="button" value="denna vecka"></div>
                <div class="ui-block-c"><input class="weekSelectButton" id="next" type="button" value="nästa"></div>
            </div>
        `;
        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        this.appendChild(template.content.cloneNode(true));
        console.log('WeekSelector constructed');

        this.currentDate = new Date();
        this.currentWeek = this.currentDate.getWeek();
    }

    connectedCallback() {
        console.log('WeekSelector connected');

        $('week-selector #info')
            .button({
                mini: true,
                icon: 'bars',
                iconpos: 'notext'
            })
            .click(event => {
                $('#infoPanel').panel('open');
                // $('#infoPanel').panel({
                //     // display: 'overlay',
                //     animate: true,
                // }).panel('open');
            });


        let apartmentHeader = $('week-selector #header')
            .attr('value', localStorage.getItem('apartment') + ' ' + localStorage.getItem('name'))
            .button({mini: true})
            .click(event => {
                localStorage.clear();
                location.reload();
            });

        // let delay;
        // apartmentHeader[0].addEventListener('mousedown', function (e) {
        //     delay = setTimeout(() => {
        //         console.log('press detected');
        //         localStorage.clear();
        //         location.reload();
        //         }, 100);
        // }, true);
        // apartmentHeader[0].addEventListener('mouseup', function (e) {
        //     clearTimeout(delay);
        // });
        // apartmentHeader[0].addEventListener('mouseout', function (e) {
        //     clearTimeout(delay);
        // });

        $('.weekSelectButton').button({mini: true});

        $('.weekSelectButton#previous').click(event => {
            this.shiftDays(-7);
            // $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
            $(this).trigger('shiftWeekLeft');
        });

        $('.weekSelectButton#current')
            .click(event => {
                this.shiftDays(0);
                // $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
            })
            .on('taphold', event => {
                // $('#popupDatePicker').popup('open');
                $('<div>')
                    .datebox({mode:'calbox'})
                    .bind('datebox', (event, passed) => {
                        if ( passed.method === 'set' ) {
                            console.log(passed);
                        }
                    })
                    .datebox('open');
                $('.ui-title').html('Datum');
            });

        $('.weekSelectButton#next').click(event => {
            this.shiftDays(7);
            $(this).trigger('shiftWeekRight');
            // $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
        });
    }

    setDate(date) {
        this.currentDate = date;
        this.currentWeek = this.currentDate.getWeek();
        $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
    }

    shiftDays(nDays) {
        if (nDays !== 0) this.currentDate.addDays(nDays);
        else this.currentDate = new Date();
        this.currentWeek = this.currentDate.getWeek();
        $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
    }

    enable(value) {
        $('.weekSelectButton').prop("disabled", !value);
    }
}
window.customElements.define('week-selector', WeekSelector);

class WeekSchedule extends HTMLElement {

    constructor() {
        super();
        let template = document.createElement('template');
        template.innerHTML = `
            <style>
                #grid-container {
                    position: relative;
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    cursor: pointer;
                }
                .date-header-element {
                    font-weight: bold;
                    text-align: center;
                    text-shadow: none;
                    height: 40px;
                }
                .date-today {
                    background-color: #d1d1dc !important;
                }
                .hour-item {
                    font-weight: bold;
                    text-align: center;
                    border: 1px solid rgba(0, 0, 0, 0.3);
                }
                .date-element {
                    color: black;
                    font-size: 12px;
                    word-spacing: -2px;
                }
                .slot-item {
                    /*padding: 1px;*/
                    background-color: #e9e9e9;
                    border: 1px solid rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
                    /*height: 20px;*/
                    text-align: center;
                    font-weight: bold;
                    text-shadow: none;
                }
                #weekNumberElement {
                    background-color: black;
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    line-height: 40px;
                    text-shadow: none;
                }
            </style>
            <div id="grid-container">
        `;
        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        this.appendChild(template.content.cloneNode(true));

    }

    connectedCallback() {
        this.weekGrid = $('#grid-container')
    }

    slide(direction) {
        let elementWidth = this.weekGrid.width();
        let offsets = direction === 'right' ? [-elementWidth, elementWidth] : [elementWidth, -elementWidth];
        $('#weekNumberElement').css({color: 'black'});
        $('.date-element').css({color: 'white'});

        this.weekGrid.animate({
            left: offsets[0] + 'px'
        },200, () => {
            this.weekGrid.css({left: offsets[1] + 'px'});
            this.weekGrid.animate({
                left: "0px"
            },200, () => {
                $('#weekNumberElement').css({color: 'white'});
                $('.date-element').css({color: 'black'});
            })
        });
    }

    setWeek(weekInfo) {

        let setWeekTask = new $.Deferred();

        let currentDate = new Date();

        this.weekInfo = weekInfo;

        console.log('loading week', weekInfo);

        let days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
        let months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

        this.weekGrid.html("");
        this.weekGrid
            .append($("<div>")
            .attr('id', 'weekNumberElement')
            .addClass('date-header-element')
            .html('v.' + weekInfo.weekNo));

        for (let day = 0; day <= 6; day++) {

            console.log(weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate));

            let dayElement = $('<div>')
                .addClass('day-element')
                .html(days[day]);
            let dateElement = $('<div>')
                .addClass('date-element')
                // .html(weekInfo.mondayDate.getDayOffset(day).getDate() + "/"+ (weekInfo.mondayDate.getDayOffset(day).getMonth() + 1));
                .html(weekInfo.mondayDate.getDayOffset(day).getDate() + " "+ months[(weekInfo.mondayDate.getDayOffset(day).getMonth())]);

            let dateHeaderElement = $('<div>').addClass('date-header-element').append(dayElement).append(dateElement);
            // if (weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate)) dateHeaderElement.addClass('date-today');

            this.weekGrid.append(dateHeaderElement);
        }

        for (let hour = 7; hour<=22; hour++) {
            this.weekGrid.append($('<div>').addClass('hour-item').html(hour));

            for (let day = 0; day <= 6; day++) {

                let year = weekInfo.mondayDate.getDayOffset(day).getFullYear();
                let month = weekInfo.mondayDate.getDayOffset(day).getMonth() + 1;
                let date = weekInfo.mondayDate.getDayOffset(day).getDate();

                let slotContainer = $('<div>')
                    .addClass('slot-item')
                    .attr('id', year + '_' + month + '_' + date + '_' + hour)
                    .data({
                        apartment: localStorage.getItem('apartment'),
                        year: year,
                        month: month,
                        day: date,
                        hour: hour,
                        identifier: year + '' + month + '' + date + '' + hour
                    })
                    .click(function() {
                        console.log(Object.keys(myBookings).length);
                        if ($(this).children().length === 0 && isValidBooking($(this).data())) {
                            $(this).append(new Booking($(this).data(), true));
                        }
                        // else {
                        //     let booking = $(this).children('hour-booking');
                        //     if (booking[0].data.apartment === localStorage.getItem('apartment')) {
                        //         booking[0].delete();
                        //     }
                        //     else {
                        //         //TODO ...
                        //         // alert(booking[0].data.apartment)
                        //     }
                        // }
                    })
                    .appendTo(this.weekGrid);

                if (weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate)) slotContainer.addClass('date-today');

            }
        }

        $.when(getBookings()).done(data => {
            data.forEach(d => {
                let slotElement = this.weekGrid.children('#' + d.year + '_' + d.month + '_' + d.day + '_' + d.hour);
                if (slotElement.length > 0) {
                    // console.log(slotElement);
                    slotElement.append(new Booking(d, false));
                }
            });
            setWeekTask.resolve();
        });

        return setWeekTask;
    }

    reload() {
        this.setWeek(this.weekInfo);
    }
}
window.customElements.define('week-schedule', WeekSchedule);

class Booking extends HTMLElement {

    constructor(data, doFetch) {
        super();

        this.data = data;
        this.doFetch = doFetch;
        this.bookingName = "slot_" +
            data.apartment + "_" +
            data.year + "_" +
            data.month + "_" +
            data.day + "_" +
            data.hour + "_" +
            data.identifier + "_" +
            'lgh' + data.apartment;

        let template = document.createElement('template');
        template.innerHTML = `
            <style>
                #booking-container {
                    line-height: 20px;
                    font-size: 14px;
                    width: 100%;
                    height: 100%;
                    border-radius: 10px;
                }
                .my-booking {
                    background-color: green;
                    color: white;
                }
                .other-booking {
                    background-color: #ad0000;
                    color: white;
                }
            </style>
            <div id="booking-container">
        `;
        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {

        let bookingText = this.doFetch ? '...' : this.data.apartment;
        let bookingClass = this.data.apartment === localStorage.getItem('apartment') ? 'my-booking' : 'other-booking';

        this.container = $(this).children('#booking-container')
            .html(bookingText)
            .addClass(bookingClass);

        this.container.on('click', event => {
            console.log('BOOKING CLICKED', this.data.apartment, localStorage.getItem('apartment'));
            if (this.data.apartment === localStorage.getItem('apartment') || localStorage.getItem('apartment') == 122) {
                this.delete();
            }
            else {
                //TODO ...
                // $('#popupBasic').popup('open');
            }
        });

        if (this.data.apartment === localStorage.getItem('apartment')) {
            myBookings[this.data.identifier] = this;
            console.log(myBookings);
        }

        if (!this.doFetch) return;

        let searchPromises = [
            dropbox.filesSearch({path: '', query: this.data.identifier}),
            // dropbox.filesSearch({path: '', query: 'lgh' + this.data.apartment})
        ];

        Promise.all(searchPromises).then(data => {
            console.log('found', data[0].matches);
            // console.log('found', data[1].matches);
            if (data[0].matches.length === 0) {
                dropbox.filesUpload({path: "/" + this.bookingName, contents: "content"}).then(() => {
                    this.container
                        .html(this.data.apartment);

                    console.log('booking created');

                }, () => {console.log('an error occured');})
            }
            else {
                console.log("slot is taken");
                $(this).remove();
                weekSchedule[0].reload();
                alert('tiden har bokats av någon annan efter att du gick in på sidan');
            }
        });
    }

    delete() {
        this.container
            .html('...');
        dropbox.filesDelete({path: "/" + this.bookingName})
            .then(() =>  {
                console.log('booking deleted');
                $(this).remove();
                delete myBookings[this.data.identifier];
                console.log(myBookings);
            }, () => {console.log('an error occured');})
    }

}
window.customElements.define('hour-booking', Booking);


let loadApp = function(){

    dropbox = new Dropbox.Dropbox({
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

    content.append(weekSelector);
    content.append(weekSchedule);

    weekSelector[0].setDate((new Date()))

};

let accessToken = "U2FsdGVkX189p19Ob4DSM/9t8eIFgKOYYEKDM4ekNsC4VsMFP3pxSm7jPgao6UTwe89bkrrd2zgL+d0sISLA6jW7nc+7HUpUHw8YRxMeqPAsLGHpenmbNddMIYwNlB5N";

let fetchApartmentInfo = function(password){
    let fetchTask = new $.Deferred();
    $.get('/assets/enc/data.json.enc', data => {
        try {
            fetchTask.resolve(JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8)));
        }
        catch(e) {
            // alert('hej');
            fetchTask.resolve(null);
        }
    }, 'text');
    return fetchTask;
};

let loadApartments = function(password) {

    $.when(fetchApartmentInfo(password)).done(apartmentInfo => {

        if (apartmentInfo != null) {

            $('#apartmentList').html('<p>Välj din lägenhet i listan.</p>');

            $('#password').addClass('password-valid');

            hideKeyboard($('#password'));

            // hideKeyboard($(this));

            Object.entries(apartmentInfo.apartments).map(([apartmentNumber, name]) => {
                console.log(apartmentNumber, name);

                $('<input type="button">')
                    .attr('value', apartmentNumber + '. ' + name)
                    .appendTo($('#apartmentList'))
                    .button({mini: true}).button('refresh')
                    .click(event => {
                        console.log('selecting', apartmentNumber + '. ' + name);

                        localStorage.setItem('apartment', apartmentNumber);
                        localStorage.setItem('name', name);
                        localStorage.setItem('dbtoken', CryptoJS.AES.decrypt(accessToken, password).toString(CryptoJS.enc.Utf8));
                        localStorage.setItem('version', version);

                        console.log(localStorage);

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
    });
};

$(document).ready(function(){
    if (localStorage.getItem('version') !== null) {
        if (Number.parseInt(localStorage.getItem('version')) >= version) {
            loadApp();
        }
    }
    else {
        // $('#password').focus().click();
        // let password = CryptoJS.SHA256('password').toString();
        // loadApartments(password);
    }

});

$('#password').on('keyup',function(event) {
    $('#password').removeClass('password-valid');
    $('#password').removeClass('password-invalid');
    $('#apartmentList').html('');
    if ($(this).val().length === 4) {
        let password = CryptoJS.SHA256($(this).val()).toString();
        loadApartments(password);
    }
    else if (($(this).val().length > 4)) {
        $('#password').addClass('password-invalid');
    }


});