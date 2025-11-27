const DIGIT_REGEX = /[^0-9]/g;

export function formatSequentialCurrencyInput(inputValue = "") {
    const digits = `${inputValue ?? ""}`.replace(DIGIT_REGEX, '');

    if (digits === '') return '0.00';

    const lastDigits = digits.slice(-7);
    const len = lastDigits.length;

    let number = '0000000';
    number = number.slice(0, -len) + lastDigits;

    const integerPart = parseInt(number.slice(0, -2), 10).toString();
    const decimalPart = number.slice(-2);

    return `${integerPart}.${decimalPart}`;
}

export function formatSequentialNumberInput(inputValue = "") {
    const digits = `${inputValue ?? ""}`.replace(DIGIT_REGEX, '');

    if (digits === '') return '0';

    const normalized = digits.slice(-7);
    const trimmed = normalized.replace(/^0+(?=\d)/, '') || '0';

    return trimmed;
}



// fn-reusables.js

// ... (código existente)

/**
 * Crea un componente de combobox reutilizable
 * @param {Object} props - Propiedades del combobox
 * @param {string} props.value - Valor seleccionado actualmente
 * @param {Function} props.onChange - Función que se ejecuta al cambiar la selección
 * @param {Array} props.options - Opciones del combobox
 * @param {string} [props.placeholder="Selecciona"] - Texto de marcador de posición
 * @param {string} [props.dropdownId] - ID único para el dropdown
 * @returns {JSX.Element} Componente de combobox
 */
export function createDropdown({ value, onChange, options, placeholder = "Selecciona", dropdownId }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const closeDropdown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener('mousedown', closeDropdown);
        document.addEventListener('touchstart', closeDropdown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', closeDropdown);
            document.removeEventListener('touchstart', closeDropdown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
        buttonRef.current?.focus();
    };

    return (
        <div className="custom-dropdown" ref={containerRef}>
            <button
                type="button"
                className="custom-dropdown__toggle"
                onClick={() => setIsOpen((prev) => !prev)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        setIsOpen(true);
                    }
                }}
                ref={buttonRef}
                id={dropdownId}
            >
                <span>{value || placeholder}</span>
                <span className="custom-dropdown__icon">▾</span>
            </button>

            {isOpen && (
                <div className="custom-dropdown__menu" role="listbox">
                    {options.map((option) => (
                        <button
                            key={`${dropdownId}-option-${option}`}
                            type="button"
                            className={`custom-dropdown__option ${option === value ? 'is-selected' : ''}`}
                            onClick={() => handleSelect(option)}
                            role="option"
                            aria-selected={option === value}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}

            <select
                className="custom-dropdown__native-select"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
                tabIndex={-1}
                required
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((option) => (
                    <option key={`${dropdownId}-hidden-${option}`} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}