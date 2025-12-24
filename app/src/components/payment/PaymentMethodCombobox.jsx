import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatSequentialCurrencyInput, formatSequentialNumberInput } from "../../config/fn-reusables.js";
import "./paymentMethodCombobox.css";

const initialOptions = [
    { id: "unique", label: "Pago único" },
    { id: "mixed", label: "Pago mixto" }
];

const paymentMethods = [
    { id: "mobile", label: "Pago móvil" },
    { id: "cash", label: "Bs en efectivo" },
    { id: "pos", label: "Punto de venta" },
    { id: "zelle", label: "Zelle" },
    { id: "usd", label: "Divisas" }
];

function normalizeNumber(value) {
    if (value === undefined || value === null) {
        return "";
    }
    return String(value);
}

const sanitizeCurrencyInput = (value) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }
    return formatSequentialCurrencyInput(value);
};

const sanitizeNumberInput = (value) => {
    if (value === undefined || value === null || value === "") {
        return "";
    }
    return formatSequentialNumberInput(value);
};

export default function PaymentMethodCombobox({
    amountToPay = 0,
    exchangeRate = 0,
    onConfirm,
    onCancel
}) {
    const [phase, setPhase] = useState("initial");
    const [selectedInitial, setSelectedInitial] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [paymentFields, setPaymentFields] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [isInitialOpen, setIsInitialOpen] = useState(true);
    const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);

    const amountFormatted = useMemo(() => Number(amountToPay) || 0, [amountToPay]);
    const safeExchangeRate = useMemo(() => (Number(exchangeRate) || 0), [exchangeRate]);
    const amountInBolivares = useMemo(() => {
        if (!safeExchangeRate) {
            return null;
        }
        return Number((amountFormatted * safeExchangeRate).toFixed(2));
    }, [amountFormatted, safeExchangeRate]);

    const handleInitialSelect = (value) => {
        setSelectedInitial(value);
        setSelectedOptions([]);
        setPaymentFields({});
        setErrorMessage("");
        setPhase("secondary");
        setIsSecondaryOpen(true);
    };

    const handleSecondarySelect = (value) => {
        if (selectedInitial === "unique") {
            setSelectedOptions([value]);
            setPaymentFields({
                [value]: {
                    montoDollar: amountFormatted.toFixed(2),
                    montoBs: amountInBolivares !== null ? amountInBolivares.toFixed(2) : "",
                    referencia: "",
                    correo: "",
                    propietario: ""
                }
            });
            setErrorMessage("");
            setPhase("summary");
            return;
        }

        setSelectedOptions((prev) => {
            if (prev.includes(value)) {
                const updated = prev.filter((item) => item !== value);
                const nextFields = { ...paymentFields };
                delete nextFields[value];
                setPaymentFields(nextFields);
                return updated;
            }
            if (prev.length >= 3) {
                return prev;
            }
            return [...prev, value];
        });
        setErrorMessage("");
    };

    const clampDollarValue = (state, methodId, desiredDollar) => {
        if (!Number.isFinite(desiredDollar) || desiredDollar <= 0) {
            return 0;
        }
        const othersTotal = Object.entries(state).reduce((acc, [id, fields]) => {
            if (id === methodId) {
                return acc;
            }
            return acc + (Number(fields?.montoDollar) || 0);
        }, 0);
        const remaining = Math.max(0, amountFormatted - othersTotal);
        return Math.min(desiredDollar, remaining);
    };

    const handleFieldChange = (methodId, field, rawValue) => {
        let exceededTotal = false;
        const overpayMessage = `No puedes exceder los $${amountFormatted.toFixed(2)} a cancelar.`;

        setPaymentFields((prev) => {
            const next = { ...prev };
            const currentFields = next[methodId] ? { ...next[methodId] } : {};
            next[methodId] = currentFields;

            const applyDollarValue = (dollarValue) => {
                if (dollarValue > 0) {
                    currentFields.montoDollar = dollarValue.toFixed(2);
                    if (safeExchangeRate > 0) {
                        currentFields.montoBs = (dollarValue * safeExchangeRate).toFixed(2);
                    }
                } else {
                    currentFields.montoDollar = "";
                    if (safeExchangeRate > 0) {
                        currentFields.montoBs = "";
                    }
                }
            };

            if (field === "montoBs") {
                const formatted = sanitizeCurrencyInput(rawValue);
                if (!formatted) {
                    currentFields.montoBs = "";
                    currentFields.montoDollar = "";
                } else if (safeExchangeRate > 0 && !Number.isNaN(Number(formatted))) {
                    const bsValue = Number(formatted) || 0;
                    const desiredDollar = Number((bsValue / safeExchangeRate).toFixed(2));
                    const clampedDollar = clampDollarValue(prev, methodId, desiredDollar);
                    if (clampedDollar !== desiredDollar) {
                        exceededTotal = true;
                    }
                    applyDollarValue(clampedDollar);
                } else {
                    currentFields.montoBs = formatted;
                    currentFields.montoDollar = "";
                }
            } else if (field === "montoDollar") {
                const formatted = sanitizeCurrencyInput(rawValue);
                if (!formatted) {
                    currentFields.montoDollar = "";
                    if (safeExchangeRate > 0) {
                        currentFields.montoBs = "";
                    }
                } else {
                    const desiredDollar = Number(formatted) || 0;
                    const clampedDollar = clampDollarValue(prev, methodId, desiredDollar);
                    if (clampedDollar !== desiredDollar) {
                        exceededTotal = true;
                    }
                    applyDollarValue(clampedDollar);
                }
            } else if (field === "referencia") {
                currentFields.referencia = sanitizeNumberInput(rawValue);
            } else if (field === "correo") {
                currentFields.correo = rawValue.trim();
            } else if (field === "propietario") {
                currentFields.propietario = rawValue;
            }

            return next;
        });

        if (exceededTotal) {
            setErrorMessage(overpayMessage);
        } else {
            setErrorMessage((prev) => (prev === overpayMessage ? "" : prev));
        }
    };

    const handleBackToInitial = () => {
        setPhase("initial");
        setSelectedInitial(null);
        setSelectedOptions([]);
        setPaymentFields({});
        setErrorMessage("");
        setIsInitialOpen(true);
        setIsSecondaryOpen(true);
    };

    const ensureFieldsForSelections = (selections) => {
        setPaymentFields((prev) => {
            const next = { ...prev };
            selections.forEach((id) => {
                if (!next[id]) {
                    next[id] = {
                        montoDollar: "",
                        montoBs: "",
                        referencia: "",
                        correo: "",
                        propietario: ""
                    };
                }
            });
            return next;
        });
    };

    const handleContinueToSummary = () => {
        if (!selectedOptions.length) {
            setErrorMessage("Selecciona al menos un método de pago.");
            return;
        }
        ensureFieldsForSelections(selectedOptions);
        setPhase("summary");
    };

    const handleBackToSecondary = () => {
        setPhase("secondary");
    };

    const handleToggleInitial = () => setIsInitialOpen((prev) => !prev);
    const handleToggleSecondary = () => setIsSecondaryOpen((prev) => !prev);

    const getHeaderTitle = () => {
        if (!selectedInitial) {
            return "Método de pago";
        }
        const typeLabel = selectedInitial === "unique" ? "Pago único" : "Pago mixto";
        return `Método de pago (${typeLabel})`;
    };

    const totals = useMemo(() => {
        const paid = Object.values(paymentFields).reduce((acc, field) => {
            const value = Number(field?.montoDollar) || 0;
            return acc + value;
        }, 0);
        return {
            paid,
            remaining: Math.max(0, amountFormatted - paid)
        };
    }, [paymentFields, amountFormatted]);

    const hasPositiveAmount = (fields = {}) => {
        const dollar = Number(fields?.montoDollar);
        const bolivares = Number(fields?.montoBs);
        return (Number.isFinite(dollar) && dollar > 0) || (Number.isFinite(bolivares) && bolivares > 0);
    };

    const validateSelections = () => {
        if (!selectedOptions.length) {
            return { valid: false, message: "Selecciona al menos un método de pago." };
        }

        for (const methodId of selectedOptions) {
            const fields = paymentFields[methodId] || {};
            const methodLabel = paymentMethods.find((m) => m.id === methodId)?.label || "Método";

            if (!hasPositiveAmount(fields)) {
                return { valid: false, message: `Ingresa el monto para ${methodLabel}.` };
            }

            if (methodId === "mobile" && !fields.referencia?.trim()) {
                return { valid: false, message: `Ingresa la referencia para ${methodLabel}.` };
            }

            if (methodId === "zelle") {
                if (!fields.propietario?.trim()) {
                    return { valid: false, message: "Escribe el nombre del titular de Zelle." };
                }
                if (!fields.correo?.trim()) {
                    return { valid: false, message: "Escribe el correo del titular de Zelle." };
                }
            }
        }

        if (totals.remaining > 0) {
            return { valid: false, message: `Aún faltan $${totals.remaining.toFixed(2)} por registrar.` };
        }

        return { valid: true, message: "" };
    };

    const handleConfirm = () => {
        if (!selectedInitial) {
            setErrorMessage("Selecciona el tipo de pago antes de continuar.");
            return;
        }
        const validation = validateSelections();
        if (!validation.valid) {
            setErrorMessage(validation.message);
            return;
        }
        setErrorMessage("");
        if (onConfirm) {
            const detail = selectedOptions.map((methodId) => ({
                id: methodId,
                label: paymentMethods.find((method) => method.id === methodId)?.label || methodId,
                fields: paymentFields[methodId] || {}
            }));
            const methodLabel = selectedInitial === "unique" ? "Pago único" : "Pago mixto";
            onConfirm({
                phase: selectedInitial,
                method: selectedInitial,
                methodLabel,
                selections: detail,
                totals
            });
        }
    };

    const renderInitialPhase = () => (
        <div className="combobox-phase1">
            <div className="combobox-header" onClick={handleToggleInitial}>
                <span className="header-title">Selecciona el tipo de pago</span>
                <svg className={`dropdown-arrow ${isInitialOpen ? "open" : "closed"}`} viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                </svg>
            </div>
            {isInitialOpen && (
                <div className="options-container">
                    {initialOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`option ${selectedInitial === option.id ? "selected" : ""}`}
                            onClick={() => handleInitialSelect(option.id)}
                        >
                            <span>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSecondaryPhase = () => (
        <div className="combobox-phase2">
            <div className="combobox-header" onClick={handleToggleSecondary}>
                <span className="header-title">Selecciona los métodos</span>
                <svg className={`dropdown-arrow ${isSecondaryOpen ? "open" : "closed"}`} viewBox="0 0 20 20">
                    <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    />
                </svg>
            </div>
            {isSecondaryOpen && (
                <div className="options-container">
                    {paymentMethods.map((method) => (
                        <div
                            key={method.id}
                            className={`option ${selectedOptions.includes(method.id) ? "selected" : ""}`}
                            onClick={() => handleSecondarySelect(method.id)}
                        >
                            <span>{method.label}</span>
                            {selectedOptions.includes(method.id) && <div className="selection-circle" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderSummaryPhase = () => (
        <div className="phase-three-container">
            <div className="summary-header">
                <div className="summary-title">{getHeaderTitle()}</div>
                {amountInBolivares !== null && (
                    <div className="amount-row amount-row--highlight">
                        <span>Cantidad a pagar (Bs.)</span>
                        <span>Bs.{amountInBolivares.toFixed(2)}</span>
                    </div>
                )}
                <div className="amount-row">
                    <span>Cantidad a pagar (USD)</span>
                    <span>${amountFormatted.toFixed(2)}</span>
                </div>
                <div className="amount-row">
                    <span>Cantidad ya cancelada</span>
                    <span>${totals.paid.toFixed(2)}</span>
                </div>
                <div className="amount-row">
                    <span>Restante</span>
                    <span>${totals.remaining.toFixed(2)}</span>
                </div>
                <div className="divider-red" />
                <div className="selected-methods-label">Métodos elegidos</div>
            </div>

            <div className="scrollable-methods-container">
                {selectedOptions.length === 0 && (
                    <div className="empty-selection-hint">Selecciona al menos un método para registrar el pago.</div>
                )}
                {selectedOptions.map((id, index) => {
                    const method = paymentMethods.find((m) => m.id === id);
                    const fields = paymentFields[id] || {};
                    return (
                        <div key={id}>
                            <div className="method-card">
                                <div className="method-name">{method?.label}</div>
                                {(id === "mobile" || id === "cash" || id === "pos") && (
                                    <div className="method-fields">
                                        <input
                                            type="text"
                                            placeholder="Monto Bs"
                                            value={normalizeNumber(fields.montoBs)}
                                            onChange={(e) => handleFieldChange(id, "montoBs", e.target.value)}
                                            className="field-button"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Monto $"
                                            value={normalizeNumber(fields.montoDollar)}
                                            onChange={(e) => handleFieldChange(id, "montoDollar", e.target.value)}
                                            className={id === "mobile" ? "field-button-readonly" : "field-button"}
                                            readOnly={id === "mobile" || id === "cash" || id === "pos"}
                                        />
                                    </div>
                                )}
                                {id === "usd" && (
                                    <div className="method-fields">
                                        <input
                                            type="text"
                                            placeholder="Monto $"
                                            value={normalizeNumber(fields.montoDollar)}
                                            onChange={(e) => handleFieldChange(id, "montoDollar", e.target.value)}
                                            className="field-button"
                                        />
                                    </div>
                                )}
                                {id === "zelle" && (
                                    <>
                                        <div className="method-fields">
                                            <input
                                                type="text"
                                                placeholder="Nombre del titular"
                                                value={normalizeNumber(fields.propietario)}
                                                onChange={(e) => handleFieldChange(id, "propietario", e.target.value)}
                                                className="field-button"
                                            />
                                        </div>
                                        <div className="method-fields">
                                            <input
                                                type="email"
                                                placeholder="Correo electrónico"
                                                value={normalizeNumber(fields.correo)}
                                                onChange={(e) => handleFieldChange(id, "correo", e.target.value)}
                                                className="field-button"
                                            />
                                        </div>
                                        <div className="method-fields">
                                            <input
                                                type="text"
                                                placeholder="Monto $"
                                                value={normalizeNumber(fields.montoDollar)}
                                                onChange={(e) => handleFieldChange(id, "montoDollar", e.target.value)}
                                                className="field-button"
                                            />
                                        </div>
                                    </>
                                )}
                                {id === "mobile" && (
                                    <input
                                        type="text"
                                        placeholder="Número de referencia"
                                        value={normalizeNumber(fields.referencia)}
                                        onChange={(e) => handleFieldChange(id, "referencia", e.target.value)}
                                        className="reference-field"
                                    />
                                )}
                            </div>
                            {index < selectedOptions.length - 1 && <div className="method-divider" />}
                        </div>
                    );
                })}
            </div>
            <div className="rate-container">
                <div className="rate-callout-fixed">
                    Tasa del día: {safeExchangeRate ? `Bs. ${Number(safeExchangeRate).toFixed(2)}` : "Bs. N/D"}
                </div>
            </div>
        </div>
    );

    return (
        <div className="payment-combobox">
            <div className="combobox-container">
                {phase === "initial" && renderInitialPhase()}

                {phase === "secondary" && selectedInitial && renderSecondaryPhase()}

                {phase === "summary" && renderSummaryPhase()}

                {errorMessage && <div className="error-text">{errorMessage}</div>}

                {phase === "secondary" && (
                    <div className="button-row">
                        <button type="button" className="back-button-circular" onClick={handleBackToInitial}>
                            Regresar
                        </button>
                        <button
                            type="button"
                            className="continue-button-circular"
                            disabled={!selectedOptions.length}
                            onClick={handleContinueToSummary}
                        >
                            Continuar
                        </button>
                    </div>
                )}

                {phase === "summary" && (
                    <div className="button-row">
                        <button type="button" className="back-button-circular" onClick={handleBackToSecondary}>
                            Regresar
                        </button>
                        <div className="summary-actions">
                            <button type="button" className="confirm-arrow-button" onClick={handleConfirm} aria-label="Confirmar">
                                <ArrowRight size={24} strokeWidth={2.4} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
