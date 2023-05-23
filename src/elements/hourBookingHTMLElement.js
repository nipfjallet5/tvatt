export class HourBooking extends HTMLElement {

    constructor(data, doFetch) {
        super();

        this.data = data;
        this.isMyBooking = false;
        this.isTodayBooking = false;
        this.isOldBooking = false;
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
            // else {
            //     // TODO ...
            //     $('#popupBasic').popup('open');
            // }
        });

        if (!this.doFetch) return;

        let searchPromises = [
            window.dropbox.filesSearch({path: '', query: this.data.identifier}),
            // dropbox.filesSearch({path: '', query: 'lgh' + this.data.apartment})
        ];

        Promise.all(searchPromises).then(data => {
            console.log('found', data[0].matches);
            if (data[0].matches.length === 0) {

                // if (!manageOldBookings(this.data.apartment, new Date())) {
                //     this.remove();
                // }
                // else {
                    window.dropbox.filesUpload({path: "/" + this.bookingName, contents: "content"}).then(() => {
                        this.container
                            .html(this.data.apartment);
                            console.log('booking created');
                    }, () => {console.log('an error occured');})
                // }
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

        const todaysDate = new Date();

        // if (Number.parseInt(this.data.year) === todaysDate.getFullYear() && Number.parseInt(this.data.month)-1 === todaysDate.getMonth() && Number.parseInt(this.data.day) === todaysDate.getDate()) {
        //     if (!manageOldBookings(localStorage.getItem('apartment'), new Date(todaysDate.getTime() + 2*1000*60*60*24), "Checka av dagens pass")) return;
        // }
        
        // if (!manageOldBookings(localStorage.getItem('apartment'), todaysDate)) {
        // }
        // else {
            this.container.html('...');
            window.dropbox.filesDelete({path: "/" + this.bookingName}) //delete when canceling
                .then((aaa) =>  {
                    console.log('booking deleted');
                    $(this).remove();
                }, () => {console.log('an error occured');})
        // }
    }
}
window.customElements.define('hour-booking', HourBooking);
