import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { ContextWrapper } from './context/session.js';
import { OrderWrapper } from './context/order.js';
import { SaleWrapper } from './context/sale.js';

import { pages } from './config/pages.js';
import { routes } from './config/routes.js';

function Content() {
    return (
        <Router>
            <Routes>
                <Route exact path = "/*" element = { <Navigate to={ routes['Inicio de Sesion'] } /> } />
                { pages.map((page) => ( <Route path={page.path} element={page.component} /> ))}
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <ContextWrapper>
            <OrderWrapper>
                <SaleWrapper>
                    <Content /> 
                </SaleWrapper>
            </OrderWrapper>
        </ContextWrapper>
    );
}

export default App;
