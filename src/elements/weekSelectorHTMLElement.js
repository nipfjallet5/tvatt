export class WeekSelector extends HTMLElement {
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

        this.currentDate = new Date();
        this.currentWeek = this.currentDate.getWeek();
    }

    connectedCallback() {

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

    // reload() {
    //     this.currentDate = new Date();
    //     $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});
    // }

    enable(value) {
        $('.weekSelectButton').prop("disabled", !value);
    }
}
window.customElements.define('week-selector', WeekSelector);
