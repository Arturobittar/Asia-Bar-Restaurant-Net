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
                precio: Number(product.Price)  // Precio unitario, no total
            }));

            const productsTotalUsd = products.reduce((sum, product) => sum + (Number(product.Price) * Number(product.Quantity)), 0);
            const deliveryPriceUsd = Number(fetched.DeliveryPrice ?? 0);
            const totalUsdConDelivery = productsTotalUsd + deliveryPriceUsd;

            const totalBsNumber = fetched.TotalBs !== null && fetched.TotalBs !== undefined
                ? Number(fetched.TotalBs)
                : null;

            const exchangeRateFromSale = (totalBsNumber && totalUsdConDelivery)
                ? Number((totalBsNumber / totalUsdConDelivery).toFixed(4))
                : null;

            const deliveryPriceBs = exchangeRateFromSale && deliveryPriceUsd
                ? Number((deliveryPriceUsd * exchangeRateFromSale).toFixed(2))
                : null;

            await printOrderTicket({
                id: fetched.ID,
                type: fetched.Type,
                address: fetched.Address || null,
                note: fetched.Note || null,
                deliverymanName: fetched.DeliverymanName || null,
                tableNumber: fetched.TableNumber || null,
                paymentMethod: fetched.PaymentMethod || null,
                totals: {
                    totalBs: totalBsNumber,
                    exchangeRate: exchangeRateFromSale,
                },
                client: client,
                products: productsArray,
                deliveryPriceUsd,
                deliveryPriceBs
            });
        };

        print();
    }

    return printTicket;
}
