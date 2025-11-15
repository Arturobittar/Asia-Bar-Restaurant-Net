import { generateTicket } from './ticketImpresion.js'; 
import PrintManager from './print-manager.js';

import './ticket.css';

export async function printOrderTicket({ id, type, address, note, deliverymanName, tableNumber, paymentMethod, client, clock, products, totals }, afterPrint = () => {}) {
    const ticket = await generateTicket({
        numeroTicket: id,
        tipoVenta: type,
        direccion: address,
        deliverymanName: deliverymanName,
        mesa: tableNumber,
        metodoPago: paymentMethod,
        mensaje: note || '',
        clienteId: client.id,
        clienteNombre: client.name,
        fecha: clock ? clock.date : null,
        hora: clock ? clock.time : null,
        items: products,
        totalVentaBs: totals?.totalBs ?? null,
        tasaUsada: totals?.exchangeRate ?? null
    });

    const ticketPrinter = new PrintManager(ticket, afterPrint);

    ticketPrinter.print();
}
