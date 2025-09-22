import Swal from 'sweetalert2';

import './alerts.css';

const redHue = "#D9534F";
const greenHue = "#5CB85C";
const textHue = "#333333";
const iconHue = "#777777";
const blueHue = "#406088";

export function questionAlert(title, message, onYes, onNo = () => {}) {
    Swal.fire({
        title: title,
        text: message,
        color: textHue,
        showDenyButton: true,
        icon: "question",
        iconColor: iconHue,
        confirmButtonText: "Sí",
        confirmButtonColor: greenHue,
        denyButtonText: "No",
        denyButtonColor: redHue,
    }).then( (result) => {
        if (result.isConfirmed) 
            onYes();
        else
            onNo();
    });
}

function simpleAlert(title, message, icon, iconColor, buttonText = "Vale") {
    Swal.fire({
        title: title,
        text: message,
        color: textHue,
        icon: icon,
        iconColor: iconColor,
        confirmButtonText: buttonText,
        confirmButtonColor: blueHue,
    });
}

export function iconlessAlert(title, message) {
    simpleAlert(title, message);
}

export function infoAlert(title, message) {
    simpleAlert(title, message, "info", iconHue);
}

export function successAlert(title, message) {
    simpleAlert(title, message, "success", greenHue, "Genial");
}

export function errorAlert(title, message) {
    simpleAlert(title, message, "error", redHue);
}

function getRowHtmlString(row) {
    let htmlString = "\t\t\t<tr>\n";
    
    row.map( (value) => {
        htmlString += "\t\t\t\t<td>" + value + "</td>\n";
    });
    
    htmlString += "\t\t\t</tr>\n";

    return htmlString;
}

function getProductsTable(data) {
    const fields = ["Nombre", "Precio Unitario", "Cantidad"];

    let htmlString = "<h3 class=\"alert-subtitle\">Productos</h3>\n";
    
    htmlString += "<div class=\"products-table-container\">";
    
    data.forEach((product) => {
        const name = product[0];
        const unitaryCost = product[1];
        const quantity = product[2];

        const getFieldHtml = (title, value) => "\t<p class=\"product-field\"><b>" + title + ":</b> " + value + "</p>\n";

        htmlString += getFieldHtml("Nombre", name) + getFieldHtml("Costo Unitario", unitaryCost + "$") + getFieldHtml("Cantidad", quantity);
       
        htmlString += "\t<p class=\"total-field\">" + "<span>Total:</span> <span>" + unitaryCost * quantity + "$</span>" + "</p>\n";
    });
        

    htmlString += "</div>";

    return htmlString;
}

export default class InfoField {
    constructor(title, value) {
        this.title = title; 
        this.value = value;
    }
}

function getSaleInfoHtml(client, type) {
    let htmlString = "<h3 class=\"alert-subtitle\">Información del Pedido</h3>\n";

    const data = [
        new InfoField("Cliente", client.name),
        new InfoField("Documento de Identidad", client.id),
        new InfoField("Tipo de Pedido", type)
    ];

    htmlString += "\t<div class=\"info-fields-container\">";

    data.forEach( (field) => {
        htmlString += "\t\t<p><b>" + field.title + ":</b> " + field.value + "</p>\n";
    });

    htmlString += "\t</div>";

    return htmlString;
}

function getSaleHtml(client, type, products) {
    return getSaleInfoHtml(client, type) + getProductsTable(products);
}

export function saleAlert(number, client, type, products) {
    Swal.fire({
        title: `Orden #${number}`,
        html: getSaleHtml(client, type, products),
        confirmButtonText: "Vale",
        confirmButtonColor: redHue,
    });
}
