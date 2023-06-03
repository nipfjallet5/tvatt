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
                .cleaning-checked {
                    color: darkgreen
                }
                .cleaning-unchecked {
                    color: darkred
                }
            </style>

            <div class="cleaning-container">
                <div class="cleantask-title">${this.apartmentInfo.apartments_new[this.cleaningData.apartment].nick} (${this.cleaningData.apartment})<br> har checkat av:</div>
                <div class="cleantask, ${this.checkMap[2] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">sopat golvet</div></div>
                <div class="cleantask, ${this.checkMap[3] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">våttorkat golvet</div></div>
                <div class="cleantask, ${this.checkMap[4] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">våttorkat ytor</div></div>
                <div class="cleantask, ${this.checkMap[5] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">ludd torktumlare</div></div>
                <div class="cleantask, ${this.checkMap[6] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">filter torkskåp</div></div>
                <div class="cleantask, ${this.checkMap[7] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">rengjort fack</div></div>
                <div class="cleantask, ${this.checkMap[8] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">städade inte</div></div>
                <div class="cleantask, ${this.checkMap[9] ? 'cleaning-checked' : 'cleaning-unchecked'}"><div style="height: 20px">tvättade aldrig</div></div>
            </div>

        `;
        this.appendChild(template.content.cloneNode(true));

    }

}

window.customElements.define('cleaning-slot', CleaningSlot);
