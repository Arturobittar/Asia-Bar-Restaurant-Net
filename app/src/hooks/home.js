import { getSaleDetails } from '../utils/api.js';
import { printOrderTicket } from '../utils/ticket.js';

export function useTicketPrinter() {
    const printTicket = (id) => {
        const print = async () => {
            const fetched = await getSaleDetails(id);
            
            if (!fetched) {
                console.error("No se pudieron cargar los datos de la venta");
                return;
            }
            
            const client = {
                id: fetched.ClientIdDocument,
                name: fetched.ClientName
            };
            
            const products = Array.isArray(fetched.products) ? fetched.products : [];

            const productsArray = [];

            products.forEach((product) => productsArray.push({
                nombre: product.Name, 
                cantidad: product.Quantity,
                precio: product.Price  // Precio unitario, no total
            }));

            await printOrderTicket({
                id: fetched.ID,
                type: fetched.Type,
                address: fetched.Address || null,
                note: fetched.Note || null,
                deliverymanName: fetched.DeliverymanName || null,
                client: client,
                products: productsArray
            });
        };

        print();
    }

    return printTicket;
}
