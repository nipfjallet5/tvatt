import { v4 as uuidv4 } from 'uuid';

export class LaundrySession extends HTMLElement {
    constructor(date) {
        super();

        this.bookings = [];
        this.isMySession = false;
        this.isTodaySession = false;
        this.isOldSession = false;
        this.followingSession = undefined;
        this.date = date;
        this.uuid = uuidv4(); 
        this.dateString = `${this.date.getDate()}/${this.date.getMonth()+1}`;
        this.daysAgo = Math.floor(((new Date()) - this.date)/1000/60/60/24);
        this.cleanCode = 0;
        this.onDeleteHandler = () => {};

        let template = document.createElement('template');
        template.innerHTML = /*html*/`
            <style>
                #older-booking-container {
                    background-color: lightgray;
                    margin: 10px 0 0 0;
                    padding: 5px;
                    position: relative;
                }
                #older-booking-container-overlay {
                    background-color: #55555599;
                    color: white;
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    text-align: center;
                    line-height: 100px;
                    visibility: hidden;
                }
                .bookingname {
                    /* font-family: monospace; */
                    font-weight: bold;
                }
                .cleantask {
                    display: grid;
                    grid-template-columns: auto 40px;
                    height: 20px;
                    margin: 5px 0 0 0;
                }
                .raderapass {
                    width: 50%;
                    height: 25px;
                    line-height: 25px;
                    text-align: center;
                    margin: 10px 0 0 0;
                    background-color: darkred;
                    color: white;
                    border-radius: 5px;
                    /* pointer-events: none; */
                }

                input[type=checkbox]{
                    height: 0;
                    width: 0;
                    visibility: hidden;
                  }
                  
                label {
                    cursor: pointer;
                    top: -20px;
                    width: 40px;
                    height: 20px;
                    background: darkred;
                    /* display: block; */
                    border-radius: 20px;
                    position: relative;
                }
                
                label:after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 16px;
                    height: 16px;
                    background: #fff;
                    border-radius: 16px;
                    transition: 0.3s;
                }
                
                input:checked + label {
                    background: darkgreen;
                }
                
                input:checked + label:after {
                    left: calc(100% - 2px);
                    transform: translateX(-100%);
                    }
                
                label:active:after {
                    width: 15px;
                }

            </style>
            <div id="older-booking-container">
            <div class=bookingname>pass: ${this.dateString} (${this.daysAgo === 0 ? 'idag' : this.daysAgo + ' dagar sedan'})</div>
            <div class="cleantasks">
                    <div class=cleantask><div style="height: 20px">sopat golvet</div><div style="height: 20px"><input type="checkbox" id="switch1_${this.uuid}" /><label for="switch1_${this.uuid}"></label></div></div>
                    <div class=cleantask><div style="height: 20px">våttorkat golvet</div><div style="height: 20px"><input type="checkbox" id="switch2_${this.uuid}" /><label for="switch2_${this.uuid}"></label></div></div>
                    <div class=cleantask><div style="height: 20px">våttorkat ytor</div><div style="height: 20px"><input type="checkbox" id="switch3_${this.uuid}" /><label for="switch3_${this.uuid}"></label></div></div>
                    <div class=cleantask><div style="height: 20px">ludd torktumlare</div><div style="height: 20px"><input type="checkbox" id="switch4_${this.uuid}" /><label for="switch4_${this.uuid}"></label></div></div>
                    <div class=cleantask><div style="height: 20px">filter torkskåp</div><div style="height: 20px"><input type="checkbox" id="switch5_${this.uuid}" /><label for="switch5_${this.uuid}"></label></div></div>
                    <div class=cleantask><div style="height: 20px">rengjort fack</div><div style="height: 20px"><input type="checkbox" id="switch6_${this.uuid}" /><label for="switch6_${this.uuid}"></label></div></div>
                    <div class=cleantask><div style="height: 20px">städade inte</div><div style="height: 20px"><input type="checkbox" id="switch7_${this.uuid}" /><label for="switch7_${this.uuid}"></label></div></div>
                    <div class=cleantask><div style="height: 20px">tvättade aldrig</div><div style="height: 20px"><input type="checkbox" id="switch8_${this.uuid}" /><label for="switch8_${this.uuid}"></label></div></div>
                </div>
                <div class="raderapass">skicka</div>
                <div id="older-booking-container-overlay">skickar ...<div>
            </div>
        `;
        this.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {

        // const cleantasks = $(this).children('.cleanAnswer');
        // const sendbuttons = $(this).children('.raderapass');
        const cleantasks = this.querySelectorAll('input[type=checkbox]');
        const sendbutton = this.querySelector('.raderapass');
        const overlay = this.querySelector('#older-booking-container-overlay');
        // .html(bookingText)
        // .addClass(bookingClass);

        cleantasks.forEach((element) => {
            $(element).on('change', event => {
                this.nChecked = [...cleantasks].filter(e => e.checked).length;
                console.log('TOGGELING', this.nChecked);
                sendbutton.style['background-color'] = this.nChecked > 0 ? 'darkgreen' : 'darkred';
                // sendbutton.style['pointer-events'] = nChecked > 0 ? 'auto' : 'none';
                this.cleanCode = [...cleantasks].map(element => element.checked).reduce((res, x) => res << 1 | x)
                console.log(this.cleanCode);
            });
        })

        $(sendbutton).on('click', event => {

            if (this.cleanCode === 0) {
                $('#popupMessageContent').html('Välj minst en städåtgärd. Eller "tvättade aldrig" om du inte använde passet.');
                $('#popupMessage').popup('open');
                return;
            }

            overlay.style.visibility = "visible";

            const checkName = "check_" +
            this.getApartment() + "_" +
            this.followingSession.getApartment() + "_" +
            this.bookings[0].data.year + "_" +
            this.bookings[0].data.month + "_" +
            this.bookings[0].data.day + "_" +
            this.cleanCode;

            Promise.all(this.bookings.map(b => b.delete())).then(statuses => {
                console.log(statuses);
                this.remove();
                this.onDeleteHandler(this);
                window.dropbox.filesUpload({path: "/checks/" + checkName, contents: "content"})
                    .then(() => {
                    }, () => {console.log('an error occured');})
                overlay.style.visibility = "hidden";
            })

            // this.bookings.forEach(b => {
            //     // b.delete();

            //     const checkName = "check_" +
            //     b.data.apartment + "_" +
            //     b.data.year + "_" +
            //     b.data.month + "_" +
            //     b.data.day + "_" +
            //     this.cleanCode;

            //     console.log('DELETING', checkName);
                

            //     // window.dropbox.filesDelete({path: "/" + bookingName}) //delete when checking off
            //     // .then(() =>  {
            //     //     console.log('booking deleted');
            //     //     this.remove();
            //     //     this.onDeleteHandler(this.key);
            //     //     weekSchedule[0].reload();
            //     //     overlay.style.visibility = "hidden";
            //     //     window.dropbox.filesUpload({path: "/" + checkName, contents: "content"})
            //     //         .then(() => {
            //     //         }, () => {console.log('an error occured');})

            //     // }, () => {console.log('an error occured');})
            // })
        });
    }

    addBookingHour(bookingHour) {
        this.bookings.push(bookingHour);
        this.bookings.sort((a,b) => a.startTime - b.startTime)
    }

    getStartTime() {
        return this.bookings[0].startTime;
    }

    getEndTime() {
        return this.bookings[this.bookings.length - 1].endTime;
    }

    getApartment() {
        return this.bookings[0].data.apartment;
    }

    onDelete(handler) {
        this.onDeleteHandler = handler;
    }

}

window.customElements.define('laundry-session', LaundrySession);
