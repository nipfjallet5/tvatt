import { HourBooking } from './hourBookingHTMLElement';
import { LaundrySession } from './laundrySessionHTMLElement';

export class WeekSchedule extends HTMLElement {

    constructor() {
        super();

        this.sessions = {}
        this.readyHandler = () => { };
        this.bookingClickHandler = () => { };

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
                    background-color: lightgrey;
                    pointer-events: none;
                    
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
                    background-color: lightgrey;
                    pointer-events: none;
                    /* background-color: #e9e9e9; */
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

    async listAllFiles(dropbox, path) {
        let files = [];
        let hasMore = true;
        let cursor = null;
        let response;

        const reply = {result: {entries: []}};
        while (hasMore) {
        // for (var i = 0; i < 10; i++) {
            console.log(cursor);

            // $('.slot-item').css({ 'background-color': 'pink' });

            if (cursor) {
                // If a cursor is available, continue from where we left off
                response = await window.dropbox.filesListFolderContinue({ cursor });
            } else {
                // Initial request
                response = await window.dropbox.filesListFolder({ path });

            }


            reply.result.entries = [...reply.result.entries, ...response.result.entries];
            //   files = files.concat(response.entries);

            hasMore = response.result.has_more;
            console.log(response);

            // If there are more files, get the cursor to continue
            if (hasMore) {
                cursor = response.result.cursor;
            }
            else {
                cursor = null;
            }
        }

        // $('.slot-item').css({ 'background-color': '#e9e9e9' });

        return reply;
    }


    slide(direction) {
        let elementWidth = this.weekGrid.width();
        let offsets = direction === 'right' ? [-elementWidth, elementWidth] : [elementWidth, -elementWidth];
        $('#weekNumberElement').css({ color: 'black' });
        $('.date-element').css({ color: 'white' });

        this.weekGrid.animate({
            left: offsets[0] + 'px'
        }, 200, () => {
            this.weekGrid.css({ left: offsets[1] + 'px' });
            this.weekGrid.animate({
                left: "0px"
            }, 200, () => {
                $('#weekNumberElement').css({ color: 'white' });
                $('.date-element').css({ color: 'black' });
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
                .html(weekInfo.mondayDate.getDayOffset(day).getDate() + " " + months[(weekInfo.mondayDate.getDayOffset(day).getMonth())]);

            let dateHeaderElement = $('<div>').addClass('date-header-element').append(dayElement).append(dateElement);
            // if (weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate)) dateHeaderElement.addClass('date-today');

            this.weekGrid.append(dateHeaderElement);
        }

        for (let hour = 7; hour <= 22; hour++) {
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
                    .click(function () {
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
        }


        // this.weekGrid.append($('<div>').addClass('hour-item'));
        // for (let day = 0; day <= 6; day++) {
        //     let checkContainer = $('<div>').addClass('check-item').html('✔').appendTo(this.weekGrid)

        // }


        $.when(this.getBookings()).done(data => {

            $('.slot-item').css({ 'background-color': '#e9e9e9' });
            $('.date-today').css({ 'background-color': '#d1d1dc' });
            $('.slot-item').css({ 'pointer-events': 'auto'});
            $('.date-today').css({ 'pointer-events': 'auto' });

            this.sessions = {}

            const currentTime = new Date();
            const todayDate = new Date(currentTime.getFullYear(), 0, 0, 0, 0);
            // ; todayDate.setHours(0); todayDate.setMinutes(0); todayDate.setSeconds(0); todayDate.setMilliseconds(0);

            data.forEach(b => {

                const bookingDate = new Date(b.year, b.month - 1, b.day);
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

            const sortedSessions = Object.values(this.sessions).sort((a, b) => a.getStartTime() - b.getStartTime());
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

        // this.listAllFiles
        this.listAllFiles(dropbox, '/bookings')
            // window.dropbox.filesListFolder({path: '/bookings'})
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
                    });

                let duplicateBookings = data.result.entries
                    .filter(booking => booking.name.startsWith("slot_"))
                    .map(booking => {
                        // console.log(booking.name, booking.server_modified);
                        return booking.name.split('_').slice(2, 6).join('_')
                    })
                    .reduce((acc, el, i, arr) => {
                        if (arr.indexOf(el) !== arr.lastIndexOf(el)) {
                            if (!acc.hasOwnProperty(el)) acc[el] = [];
                            acc[el].push(data.result.entries[i]);
                        }
                        return acc;
                    }, {});

                Object.values(duplicateBookings).forEach(dbs => {
                    return dbs
                        .sort((a, b) => (new Date(a.server_modified) - new Date(b.server_modified)))
                        .reduce((res, db, i, array) => array.slice(1), [])
                        .forEach(db => {
                            console.log('deleting', db.path_lower);
                            window.dropbox.filesDelete({ path: db.path_lower }).then(() => { //delete when duplicates
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

    onBookingClick(handler) {
        this.bookingClickHandler = handler;
    }

    onReady(handler) {
        this.readyHandler = handler;
    }

}
window.customElements.define('week-schedule', WeekSchedule);
