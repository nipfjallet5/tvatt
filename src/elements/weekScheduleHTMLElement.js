import {HourBooking} from './hourBookingHTMLElement';
import {LaundrySession} from './laundrySessionHTMLElement';

export class WeekSchedule extends HTMLElement {

    constructor() {
        super();

        this.sessions = {};
        this.cleanings = {};
        this.readyHandler = () => {};
        this.bookingClickHandler = () => {};
        this.cleaningClickHandler = () => {};

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
                .clean-slot-item {
                    /* background-color: #e9e9e9;
                    border: 1px solid rgba(0, 0, 0, 0.3); */
                    /* border-radius: 3px; */
                    height: 30px;
                    line-height: 30px;
                    text-align: center;
                    font-weight: bold;
                    text-shadow: none;
                }
                .clean-item {
                    font-size: 20px;
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

        const self = this;

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

        for (let hour = 7; hour<=23; hour++) {
            this.weekGrid.append($('<div>').addClass(hour<=22 ? 'hour-item' : 'check-row').html(hour<=22 ? hour : ''));

            for (let day = 0; day <= 6; day++) {

                let year = weekInfo.mondayDate.getDayOffset(day).getFullYear();
                let month = weekInfo.mondayDate.getDayOffset(day).getMonth() + 1;
                let date = weekInfo.mondayDate.getDayOffset(day).getDate();

                if (hour <= 22) {
    
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
    
                                const bookingElement = new HourBooking($(this).data(), true);
    
                                bookingElement.onCreate(status => {
                                    self.bookingClickHandler(status, this.sessions);
                                });
    
                                bookingElement.onDelete(status => {
                                    self.bookingClickHandler(status, this.sessions);
                                });
    
                                $(this).append(bookingElement);
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
                else {

                    if (currentDate - weekInfo.mondayDate.getDayOffset(day) >= 0) {
                        let checkContainer = $('<div>')
                        .addClass('clean-slot-item')
                        .attr('id', 'clean_' + year + month + date)
                        .appendTo(this.weekGrid);
                    }
                }
            }
        }

        $.when(this.getBookings(), this.getCleanings()).done((data, cdata) => {

            this.sessions = {}
            this.cleanings = {}

            const currentTime = new Date();
            const todayDate = new Date(currentTime.getFullYear(),0,0,0,0);
            // ; todayDate.setHours(0); todayDate.setMinutes(0); todayDate.setSeconds(0); todayDate.setMilliseconds(0);

            data.forEach(b => {

                const bookingDate = new Date(b.year, b.month-1, b.day);
                const sessionKey = b.apartment + '_' + b.year + '_' + b.month + '_' + b.day;

                const bookingElement = new HourBooking(b, false);

                bookingElement.onCreate(status => {
                    this.bookingClickHandler(status, this.sessions);
                });

                bookingElement.onDelete(status => {
                    this.bookingClickHandler(status, this.sessions);
                });

                bookingElement.isMyBooking = b.apartment === localStorage.getItem('apartment');               
                // bookingElement.isOldBooking = bookingDate < todayDate;
                bookingElement.isOldBooking = bookingElement.endTime < currentTime;
                bookingElement.isTodayBooking = bookingDate.getTime() === todayDate.getTime();

                if (!this.sessions.hasOwnProperty(sessionKey)) this.sessions[sessionKey] = new LaundrySession(bookingDate);
                this.sessions[sessionKey].addBookingHour(bookingElement);
                this.sessions[sessionKey].isMySession = bookingElement.isMyBooking;
                this.sessions[sessionKey].isOldSession = bookingElement.isOldBooking;
                this.sessions[sessionKey].isTodaySession = bookingElement.isTodayBooking;
 
                let slotElement = this.weekGrid.children('#' + b.year + '_' + b.month + '_' + b.day + '_' + b.hour);

                if (slotElement.length > 0) {
                    slotElement.html('');
                    slotElement.append(bookingElement);
                }
            });

            cdata.forEach(cd => {
                if (!this.cleanings.hasOwnProperty(cd.identifier)) this.cleanings[cd.identifier] = [];
                this.cleanings[cd.identifier].push(cd);
                const slotElement = this.weekGrid.children('#clean_' + cd.identifier);
                slotElement.html('');
                let checkContainer = $('<div>')
                .addClass('clean-item')
                .html('<i class="fa-solid fa-square-check"></i>')
                // .html('\u2714')
                .data(cd)
                .click(function() {
                    window.dropbox.filesListFolder({path: '/checks/'})
                    .then(data => {
                        self.cleaningClickHandler(self.cleanings[$(this).data().identifier])
                    })
                })
                .appendTo(slotElement);
                $('#clean_' + cd.identifier).css('display','block');
            })

            const sortedSessions = Object.values(this.sessions).sort((a,b) => a.getStartTime() - b.getStartTime());
            const allSessions = Object.values(this.sessions);
            allSessions.forEach(s => {
                const sessionIndex = sortedSessions.findIndex(ss => ss.getStartTime().getTime() === s.getStartTime().getTime());
                if (sessionIndex < allSessions.length - 1) s.followingSession = sortedSessions[sessionIndex + 1];
                if (s.getStartTime() < currentTime && s.getEndTime() > currentTime) window.activeSession = s;
                // console.log(sessionIndex, s.getApartment());
            })
            window.myOldSessions = Object.values(this.sessions).filter(s => s.isMySession && s.isOldSession);
            window.myTodaySessions = Object.values(this.sessions).filter(s => s.isMySession && s.isTodaySession);

            console.log('ALL SESSIONS', this.sessions);
            console.log('MY OLD SESSIONS', window.myOldSessions);
            console.log('MY TODAY SESSIONS', window.myTodaySessions);
            console.log('ACTIVE SESSION', window.activeSession);

            this.readyHandler(this.sessions);
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

    getCleanings() {
        let fetchTask = new $.Deferred();
        window.dropbox.filesListFolder({path: '/checks/'})
        .then(data => {
            fetchTask.resolve(data.entries.map(d => {
                const tokens = d.name.split('_')
                var cleanCode = (tokens[6]-0).toString(2);
                cleanCode = '0000000000'.substring(cleanCode.length) + cleanCode;
                return {
                    apartment: tokens[1],
                    nextApartment: tokens[2],
                    year: tokens[3]-0,
                    month: tokens[4]-1,
                    day: tokens[5]-0,
                    identifier: tokens[3] + tokens[4] + tokens[5],
                    cleanCode: cleanCode,
                    start: Number.parseInt(tokens[7])
                };
            }).sort((a,b) => a.start - b.start))
        })
        return fetchTask;
    }

    reload() {
        this.setWeek(this.weekInfo);
    }

    onBookingClick(handler) {
        this.bookingClickHandler = handler;
    }

    onCleaningClick(handler) {
        this.cleaningClickHandler = handler;
    }

    onReady(handler) {
        this.readyHandler = handler;
    }

}
window.customElements.define('week-schedule', WeekSchedule);
