import { errorAlert } from './alerts.js';

export default class PrintManager {
    constructor(content, afterPrint) {
        this.printElement = document.getElementById('ticket-print-content');

        if (this.printElement) {
            this.printElement.innerHTML = `
                <div class="ticket-container">
                    <pre>${content}</pre>
                </div>
            `;
            this.createdElement = false;
        } else {
            const markup = `
                <div id="ticket-print-content">
                    <div class="ticket-container">
                        <pre>${content}</pre>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', markup);
            this.printElement = document.getElementById('ticket-print-content');
            this.createdElement = true;
        }

        this.hasStarted = false;
        this.mediaQuery = window.matchMedia('print');
        this.isAndroid = /Android/i.test(navigator.userAgent);

        this.afterPrint = () => {
            afterPrint();
            this.#cleanup();
        };

        this.boundAfterPrint = this.afterPrint.bind(this);
        this.boundOnChange = this.#onChange.bind(this);
    }

    #cleanup() {
        if (!this.isAndroid) {
            if (this.createdElement && this.printElement) {
                this.printElement.remove();
            } else if (this.printElement) {
                this.printElement.innerHTML = '';
            }
        }

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

        const triggerPrint = () => {
            try {
                window.print();
            } catch (error) {
                this.#cleanup();
            }
        };

        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => setTimeout(triggerPrint, 50));
        } else {
            setTimeout(triggerPrint, 50);
        }
    };
}
