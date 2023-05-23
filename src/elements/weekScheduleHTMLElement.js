import {HourBooking} from './hourBookingHTMLElement';
import {BookingSession} from './bookingSessionHTMLElement';

const sessions = {};

export class WeekSchedule extends HTMLElement {

    constructor() {
        super();

        this.readyHandler = () => {};

        let template = document.createElement('template');
        template.innerHTML = /*html*/`
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
                .date-today-day-element {
                    color: blue;
                    text-decoration: underline;
                }
                .hour-item {
                    font-weight: bold;
                    text-align: center;
                    height: 22px;
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
                    height: 22px;
                    text-align: center;
                    font-weight: bold;
                    text-shadow: none;
                }
                .check-item {
                    background-color: #e9e9e9;
                    border: 1px solid rgba(0, 0, 0, 0.3);
                    border-radius: 3px;
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

        let days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];
        let months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

        this.weekGrid.html("");
        this.weekGrid
            .append($("<div>")
            .attr('id', 'weekNumberElement')
            .addClass('date-header-element')
            .html('v' + weekInfo.weekNo));

        for (let day = 0; day <= 6; day++) {

            let dayElement = $('<div>')
                .addClass('day-element')
                // .addClass(weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate) ? 'date-today-day-element' : '')
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
                        if ($(this).children().length === 0) {
                            $(this).append(new HourBooking($(this).data(), true));
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

        // this.weekGrid.append($('<div>').addClass('hour-item'));
        // for (let day = 0; day <= 6; day++) {
        //     let checkContainer = $('<div>').addClass('check-item').html('✔').appendTo(this.weekGrid)

        // }

        $.when(this.getBookings()).done(data => {
            // this.allBookings = data;

            const rightNow = new Date();
            rightNow.setHours(0);
            rightNow.setMinutes(0);
            rightNow.setSeconds(0);
            rightNow.setMilliseconds(0);

            // const myBookings = Object.values(data).filter(b => b.apartment === localStorage.getItem('apartment'));
            // const myOldBookings = myBookings.filter(b => {
            //     const bookingDate = new Date(b.year, b.month-1, b.day);
            //     return bookingDate < rightNow;
            // })
            // const myTodayBookings = myBookings.filter(b => {
            //     const bookingDate = new Date(b.year, b.month-1, b.day);
            //     return bookingDate.getTime() === rightNow.getTime();
            // })
            // console.log('ALL BOOKINGS', data);
            // console.log('MY BOOKINGS', myBookings);
            // console.log('MY OLD BOOKINGS', myOldBookings);
            // console.log('MY TODAY BOOKINGS', myTodayBookings);
            
            // manageOldBookings(localStorage.getItem('apartment'), new Date());

            data.forEach(b => {

                let slotElement = this.weekGrid.children('#' + b.year + '_' + b.month + '_' + b.day + '_' + b.hour);
                if (slotElement.length > 0) {
                    const bookingDate = new Date(b.year, b.month-1, b.day);
                    const sessionKey = b.apartment + '_' + b.year + '_' + b.month + '_' + b.day;

                    const bookingElement = new HourBooking(b, false);

                    bookingElement.isMyBooking = b.apartment === localStorage.getItem('apartment');               
                    bookingElement.isOldBooking = bookingDate < rightNow;
                    bookingElement.isTodayBooking = bookingDate.getTime() === rightNow.getTime();

                    if (!sessions.hasOwnProperty(sessionKey)) sessions[sessionKey] = new BookingSession(bookingDate);
                    sessions[sessionKey].bookings.push(bookingElement);
                    sessions[sessionKey].isMySession = bookingElement.isMyBooking;
                    sessions[sessionKey].isOldSession = bookingElement.isOldBooking;
                    sessions[sessionKey].isTodaySession = bookingElement.isTodayBooking;

                    slotElement.html('');
                    slotElement.append(bookingElement);
                }
            });

            console.log('SESSIONS', sessions);

            this.readyHandler(sessions);
            setWeekTask.resolve();
        });

        return setWeekTask;
    }


    getBookings() {

        let fetchTask = new $.Deferred();
    
        window.dropbox.filesListFolder({path: ''})
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
                            window.dropbox.filesDelete({path: db.path_lower}).then(() => { //delete when duplicates
                                console.log('duplicates deleted');
                                weekSchedule[0].reload();
                            });
                        })
                });
    
                fetchTask.resolve(bookings);
    
            }, console.error);
    
        return fetchTask;
    };

    reload() {
        this.setWeek(this.weekInfo);
    }

    onReady(handler) {
        this.readyHandler = handler;
    }

}
window.customElements.define('week-schedule', WeekSchedule);
