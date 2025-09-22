import { useState } from "react";
import { createContext } from "react";

const SaleContext = createContext(null);

export const SaleWrapper = ({ children }) => {
    const [id, setID] = useState(null);

    return (
        <SaleContext.Provider value={{ id, setID }}>
            {children}
        </SaleContext.Provider>
    );
};

export default SaleContext;
