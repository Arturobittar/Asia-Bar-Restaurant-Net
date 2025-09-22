import { Router } from 'express';
import { getAllEndpointFunctions, getEndpointFunctions, postEndpointFunctions, deleteEndpointFunctions, putEndpointFunctions, searchEndpointFunctions } from '../controllers/crud.controllers.js';
import { getLastSaleID, getSaleSummary, addSale, deleteSale, getDetailedSale, updateSale, searchSale, getTopProducts } from '../libs/crudOperations.js';
import { validateToken } from '../middlewares/validateToken.js';

const crudRouter = Router();

crudRouter.use(validateToken);

Object.entries(getAllEndpointFunctions).forEach( ( [table, endpointFunction] ) => {
    crudRouter.get(`/${ table }`, endpointFunction); 
});

Object.entries(getEndpointFunctions).forEach( ( [table, endpointFunction ] ) => {
    crudRouter.get(`/${ table }/:id`, endpointFunction);
});

Object.entries(postEndpointFunctions).forEach( ( [table, endpointFunction ] ) => {
    crudRouter.post(`/${ table }`, endpointFunction);
});

Object.entries(deleteEndpointFunctions).forEach( ( [table, endpointFunction ] ) => {
    crudRouter.delete(`/${ table }/:id`, endpointFunction);
});

Object.entries(putEndpointFunctions).forEach( ( [table, endpointFunction ] ) => {
    crudRouter.put(`/${ table }/:id`, endpointFunction);
});

Object.entries(searchEndpointFunctions).forEach( ( [ table, endpointFunction ] ) => {
    crudRouter.get(`/${ table }/search/:query`, endpointFunction);
});;

crudRouter.get("/sales", getSaleSummary);
crudRouter.get("/sales/:id", getSaleSummary);
crudRouter.get("/sales/details/:id", getDetailedSale);
crudRouter.get("/search/sales/", searchSale);
crudRouter.get("/search/sales/:id", searchSale);
crudRouter.post("/sales", addSale);
crudRouter.delete("/sales/:id", deleteSale);
crudRouter.put("/sales/:id", updateSale);

crudRouter.get("/sales-id/last", getLastSaleID);
crudRouter.get("/top-products", getTopProducts);

export default crudRouter;
