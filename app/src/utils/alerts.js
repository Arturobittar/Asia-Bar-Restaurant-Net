import Swal from 'sweetalert2';

import './alerts.css';

const redHue = "#D9534F";
const greenHue = "#5CB85C";
const textHue = "#333333";
const iconHue = "#777777";
const blueHue = "#406088";

export function questionAlert(title, message, onYes, onNo = () => {}, options = {}) {
    const {
        singleButton = false,
        confirmText,
        confirmColor,
        denyText,
        denyColor,
        showDenyButton: showDenyButtonOption,
        icon = "question",
        iconColor = iconHue,
    } = options;

    const showDenyButton = singleButton ? false : (showDenyButtonOption ?? true);
    const finalConfirmText = confirmText ?? (singleButton ? "Aceptar" : "Sí");
    const finalConfirmColor = confirmColor ?? (singleButton ? blueHue : greenHue);
    const finalDenyText = denyText ?? "No";
    const finalDenyColor = denyColor ?? redHue;

    Swal.fire({
        title: title,
        text: message,
        color: textHue,
        icon: icon,
        iconColor: iconColor,
        showDenyButton: showDenyButton,
        confirmButtonText: finalConfirmText,
        confirmButtonColor: finalConfirmColor,
        denyButtonText: finalDenyText,
        denyButtonColor: finalDenyColor,
    }).then((result) => {
        if (result.isConfirmed)
            onYes?.();
        else
            onNo?.();
    });
}

const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

function getProductsTable(data, totalGeneralBs = null, deliveryPriceUsd = 0, deliveryPriceBs = null) {
    let htmlString = "<h3 class=\"alert-subtitle\">Productos</h3>\n";
    
    htmlString += "<div class=\"products-table-container\">";
    
    let totalGeneral = 0;
    
    data.forEach((product) => {
        const name = product[0];
        const unitaryCost = parseFloat(product[1]);
        const quantity = parseInt(product[2]);
        const subtotal = unitaryCost * quantity;

        totalGeneral += subtotal;

        const getFieldHtml = (title, value) => "\t<p class=\"product-field\"><b>" + title + ":</b> " + value + "</p>\n";

        htmlString += getFieldHtml("Nombre", name) + getFieldHtml("Costo Unitario", unitaryCost.toFixed(2) + "$") + getFieldHtml("Cantidad", quantity);
       
        htmlString += "\t<p class=\"total-field\">" + "<span>Total:</span> <span>" + subtotal.toFixed(2) + "$</span>" + "</p>\n";
    });
    
    const totalBsNumber = (totalGeneralBs !== null && totalGeneralBs !== undefined) ? Number(totalGeneralBs) : null;
    const deliveryUsdNumber = Number(deliveryPriceUsd ?? 0);
    const deliveryBsNumber = (deliveryPriceBs !== null && deliveryPriceBs !== undefined)
        ? Number(deliveryPriceBs)
        : null;

    if (!Number.isNaN(deliveryUsdNumber) && deliveryUsdNumber > 0) {
        const costText = deliveryBsNumber !== null && Number.isFinite(deliveryBsNumber)
            ? `${deliveryUsdNumber.toFixed(2)}$ / Bs ${deliveryBsNumber.toFixed(2)}`
            : `${deliveryUsdNumber.toFixed(2)}$`;

        const getFieldHtml = (title, value) => "\t<p class=\"product-field\"><b>" + title + ":</b> " + value + "</p>\n";

        htmlString += getFieldHtml("Nombre", "Delivery")
            + getFieldHtml("Costo Unitario", costText)
            + getFieldHtml("Cantidad", 1);

        htmlString += "\t<p class=\"total-field\">" + "<span>Total:</span> <span>" + deliveryUsdNumber.toFixed(2) + "$</span>" + "</p>\n";

        totalGeneral += deliveryUsdNumber;
    }

    // Agregar total general
    htmlString += "\t<div class=\"grand-total\">";
    htmlString += "\t\t<p><b>TOTAL GENERAL:</b> <span>" + totalGeneral.toFixed(2) + "$</span></p>";
    if (totalBsNumber !== null && Number.isFinite(totalBsNumber)) {
        htmlString += "\t\t<p><b>TOTAL EN Bs:</b> <span>Bs " + totalBsNumber.toFixed(2) + "</span></p>";
    }
    htmlString += "\t</div>\n";

    htmlString += "</div>";

    return htmlString;
}

export default class InfoField {
    constructor(title, value) {
        this.title = title; 
        this.value = value;
    }
}

function getSaleInfoHtml(client, type, deliverymanName, address, tableNumber, note, paymentDetail, deliveryPriceUsd = 0, deliveryPriceBs = null) {
    let htmlString = "<h3 class=\"alert-subtitle\">Información del Pedido</h3>\n";

    const data = [
        new InfoField("Cliente", client.name),
        new InfoField("Documento de Identidad", client.id),
        new InfoField("Tipo de Pedido", type)
    ];

    // Mostrar mesa si es "Comer Aquí"
    const esParaComerAqui = type && 
        (type.toLowerCase().includes('comer') || 
         type.toLowerCase().includes('aquí'));
    
    if (esParaComerAqui && tableNumber) {
        data.push(new InfoField("Mesa", tableNumber));
    }

    if (address) {
        data.push(new InfoField("Dirección", address));
    }

    if (deliverymanName) {
        data.push(new InfoField("Repartidor", deliverymanName));
    }

    if (note) {
        data.push(new InfoField("Nota", note));
    }

    const formatPaymentSummary = () => {
        if (!Array.isArray(paymentDetail?.selections) || !paymentDetail.selections.length) {
            return {
                hasSelections: false,
                summary: "No registrado",
                tooltip: "No se registraron métodos para esta venta."
            };
        }

        const summarizeAmount = (fields = {}) => {
            const { montoDollar, montoBs } = fields;
            if (montoDollar && montoBs) {
                return `${montoDollar}$ / Bs ${montoBs}`;
            }
            if (montoDollar) {
                return `${montoDollar}$`;
            }
            if (montoBs) {
                return `Bs ${montoBs}`;
            }
            return "";
        };

        const detailLines = paymentDetail.selections.map(({ label, fields = {} }) => {
            const amount = summarizeAmount(fields) || "Sin monto";
            const extra =
                fields.referencia
                    ? ` | Ref: ${fields.referencia}`
                    : (fields.correo || fields.propietario)
                        ? ` | ${[fields.propietario, fields.correo].filter(Boolean).join(" - ")}`
                        : "";
            return `${label}: ${amount}${extra}`;
        });
        const summaryText = "Ver aquí como pagó";
        const tooltipHtml = [summaryText, ...detailLines]
            .map((line) => escapeHtml(line))
            .join("<br />");

        return {
            hasSelections: true,
            summary: summaryText,
            tooltipHtml
        };
    };

    const { hasSelections, summary: methodsSummary, tooltipHtml: methodsTooltipHtml } = formatPaymentSummary();
    if (hasSelections) {
        data.push(new InfoField(
            "Método de Pago",
            `<span class="payment-method-summary" tabindex="0">${methodsSummary}<span class="payment-method-tooltip">${methodsTooltipHtml}</span></span>`
        ));
    } else {
        data.push(new InfoField("Método de Pago", methodsSummary));
    }

    htmlString += "\t<div class=\"info-fields-container\">";

    data.forEach( (field) => {
        htmlString += "\t\t<p><b>" + field.title + ":</b> " + field.value + "</p>\n";
    });

    htmlString += "\t</div>";

    return htmlString;
}

function getSaleHtml(client, type, products, deliverymanName, address, tableNumber, note, paymentDetail, totalBs, deliveryPriceUsd = 0, deliveryPriceBs = null) {
    return getSaleInfoHtml(client, type, deliverymanName, address, tableNumber, note, paymentDetail, deliveryPriceUsd, deliveryPriceBs)
        + getProductsTable(products, totalBs, deliveryPriceUsd, deliveryPriceBs);
}

export function saleAlert(number, client, type, products, deliverymanName = null, address = null, tableNumber = null, note = null, paymentDetail = null, totalBs = null, deliveryPriceUsd = 0, deliveryPriceBs = null) {
    Swal.fire({
        title: `Orden #${number}`,
        html: getSaleHtml(client, type, products, deliverymanName, address, tableNumber, note, paymentDetail, totalBs, deliveryPriceUsd, deliveryPriceBs),
        confirmButtonText: "Vale",
        confirmButtonColor: redHue,
    });
}
