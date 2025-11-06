import { errorAlert } from './alerts.js';

export default class PrintManager {
    constructor(content, afterPrint) {
        const container= `
            <div id="ticket-print-content">
                <div class="ticket-container">
                    <pre>${content}</pre>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', container);

        this.hasStarted = false;
        this.mediaQuery = window.matchMedia('print');

        this.afterPrint = () => {
            afterPrint();
            this.#cleanup();
        };

        this.boundAfterPrint = this.afterPrint.bind(this);
        this.boundOnChange = this.#onChange.bind(this);
    }

    #cleanup() {
        const printElement = document.getElementById('ticket-print-content');
        
        if (printElement) 
            printElement.remove();

        window.removeEventListener('afterprint', this.boundAfterPrint);
        this.mediaQuery.removeEventListener('change', this.boundOnChange);
        clearTimeout(this.timeoutId);
    }

    #onChange(mql) {
        if (mql.matches)
            this.hasStarted = true;
        else if (this.hasStarted)
            this.#cleanup();
    }

    #startEvents() {
        this.mediaQuery.addEventListener('change', this.boundOnChange);
        window.addEventListener('afterprint', this.boundAfterPrint);
        
        this.timeoutId = setTimeout(() => {
            if (!this.hasStarted) 
                this.#cleanup();
        }, 30000);
    }
        
    print() {
        this.#startEvents();

        try {
            window.print();
        } catch (error) {
            this.#cleanup();
        }
    };
}
