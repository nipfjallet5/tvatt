export class HourBooking extends HTMLElement {

    constructor(data, doFetch) {
        super();

        this.data = data;
        this.isMyBooking = false;
        this.isTodayBooking = false;
        this.isOldBooking = false;
        this.doFetch = doFetch;
        this.startTime = new Date(data.year, Number.parseInt(data.month)-1, data.day, data.hour);
        this.endTime = new Date(this.startTime.getTime() + 1000*60*60);
        this.bookingName = "slot_" +
            data.apartment + "_" +
            data.year + "_" +
            data.month + "_" +
            data.day + "_" +
            data.hour + "_" +
            data.identifier + "_" +
            'lgh' + data.apartment;

        this.createHandler = () => {};
        this.deleteHandler = () => {};

        let template = document.createElement('template');
        template.innerHTML = `
            <style>
                #booking-container {
                    line-height: 22px;
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

        this.container[0].addEventListener('click', event => {
            console.log('BOOKING CLICKED', this.data.apartment, localStorage.getItem('apartment'));

            if (window.haveOldSessions) {
                console.log('HAVE OLD SESSIONS. NOT DELETING!');
                this.deleteHandler('haveOldSessionsDelete');
                return false;
            }

            if (window.activeSession) {
                console.log(window.activeSession.bookings.indexOf(this));
                if (window.activeSession.getApartment() === localStorage.getItem('apartment') && window.activeSession.bookings.indexOf(this) >= 0) {
                    
                    console.log('SESSION ACTIVE. NOT DELETING!', window.activeSession.getApartment(), localStorage.getItem('apartment'));
                    this.deleteHandler('sessionActive');
                    return false;
                }
            }

            if (this.data.apartment === localStorage.getItem('apartment') || localStorage.getItem('apartment') == 122) {
                this.delete();
            }
        });

        if (!this.doFetch) return;

        let searchPromises = [
            window.dropbox.filesSearch({path: '', query: this.data.identifier}),
            // dropbox.filesSearch({path: '', query: 'lgh' + this.data.apartment})
        ];

        Promise.all(searchPromises).then(data => {
            
            if (data[0].result.matches.length === 0) {
                const currentTime = new Date();

                if (currentTime > this.startTime) {
                    console.log('TOO EARLY. NOT ADDING!');
                    this.createHandler('tooEarlyBooking');
                    this.remove();
                    return;
                }

                if (window.haveOldSessions) {
                    console.log('HAVE OLD SESSIONS. NOT ADDING!');
                    this.createHandler('haveOldSessions');
                    this.remove();
                    return;
                }

                window.dropbox.filesUpload({path: "/" + this.bookingName, contents: "content"}).then(() => {
                    this.container
                        .html(this.data.apartment);
                        this.createHandler('success');
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
        // const todaysDate = new Date();
        // if (Number.parseInt(this.data.year) === todaysDate.getFullYear() && Number.parseInt(this.data.month)-1 === todaysDate.getMonth() && Number.parseInt(this.data.day) === todaysDate.getDate()) {
        //     if (!manageOldBookings(localStorage.getItem('apartment'), new Date(todaysDate.getTime() + 2*1000*60*60*24), "Checka av dagens pass")) return;
        // }
        // if (!manageOldBookings(localStorage.getItem('apartment'), todaysDate)) {
        // }
        // else {
        return new Promise(resolve => {
            if (this.container) this.container.html('...');
            console.log('DELETING', this.bookingName);
            window.dropbox.filesDelete({path: "/" + this.bookingName}) //delete when canceling
                .then((status) =>  {
                    $(this).remove();
                    resolve(status);
                    this.deleteHandler('success');
                }, () => {console.log('an error occured');})
        })

                // }
    }

    onCreate(handler) {
        this.createHandler = handler;
    }

    onDelete(handler) {
        this.deleteHandler = handler;
    }
}
window.customElements.define('hour-booking', HourBooking);
