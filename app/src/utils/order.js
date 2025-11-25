export default class Order{
    constructor(
        clientID = "",
        clientName = "",
        type = "",
        address = null,
        deliveryPrice = 0,
        deliverymanName = "",
        tableNumber = null,
        paymentMethod = "",
        products = [],
        note = ""
    ) {
        this.clientID = clientID;
        this.clientName = clientName;
        this.type = type;
        this.address = address;
        this.deliveryPrice = deliveryPrice;
        this.deliverymanName = deliverymanName;
        this.tableNumber = tableNumber;
        this.paymentMethod = paymentMethod;
        this.products = products;
        this.note = note;
    }
}
