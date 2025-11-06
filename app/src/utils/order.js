export default class Order{
    constructor(clientID = "", clientName = "", type = "", address = null, deliverymanName = "", tableNumber = null, products = [], note = "") {
        this.clientID = clientID;
        this.clientName = clientName;
        this.type = type;
        this.address = address;
        this.deliverymanName = deliverymanName;
        this.tableNumber = tableNumber;
        this.products = products;
        this.note = note;
    }
}
