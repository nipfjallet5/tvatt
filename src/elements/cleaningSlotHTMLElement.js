export class CleaningSlot extends HTMLElement {

    constructor(data) {
        super();
        this.cleaningData = data;
        console.log(data.cleanCode.split('').map(t => t==='1'));
        this.checkMap = data.cleanCode.split('').map(t => t==='1');
        this.apartmentInfo = JSON.parse(localStorage.getItem('apartmentInfo'));
        console.log(this.apartmentInfo);
        
        
    }

    connectedCallback() {
        let template = document.createElement('template');
        template.innerHTML = /*html*/`
            <style> 
                .cleaning-container {
                    margin-bottom: 5px;
                    padding: 5px;
                    background-color: lightgrey;
                }
                .cleantask-title {
                    padding-bottom: 5px;
                    font-weight: bold;
                }
                .cleaning-checked {
                    font-size: 14px;
                }
                .cleaning-unchecked {
                    color: darkred;
                    display: none;
                }
                .fa-check {
                    color: darkgreen;
                    font-weight: bold;
                }
            </style>

            <div class="cleaning-container">
                <div class="cleantask-title">${this.apartmentInfo.apartments_new[this.cleaningData.apartment].nick} (${this.cleaningData.day}/${this.cleaningData.month} ${this.cleaningData.start}:00)</div>
                <div class="cleantask, ${this.checkMap[2] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">sopat golvet <i class="fa fa-check" aria-hidden="true"></i></div></div>
                <div class="cleantask, ${this.checkMap[3] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">våttorkat golvet <i class="fa fa-check" aria-hidden="true"></i></div></div>
                <div class="cleantask, ${this.checkMap[4] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">våttorkat ytor <i class="fa fa-check" aria-hidden="true"></i></div></div>
                <div class="cleantask, ${this.checkMap[5] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">filter tumlare <i class="fa fa-check" aria-hidden="true"></i></div></div>
                <div class="cleantask, ${this.checkMap[6] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">filter torkskåp <i class="fa fa-check" aria-hidden="true"></i></div></div>
                <div class="cleantask, ${this.checkMap[7] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">rengjort fack <i class="fa fa-check" aria-hidden="true"></i></div></div>
                <div class="cleantask, ${this.checkMap[8] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">städade inte <i class="fa fa-check" aria-hidden="true"></i></div></div>
                <div class="cleantask, ${this.checkMap[9] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">tvättade aldrig <i class="fa fa-check" aria-hidden="true"></i></div></div>
            </div>

        `;
        this.appendChild(template.content.cloneNode(true));

    }

}

window.customElements.define('cleaning-slot', CleaningSlot);
