import { Roles } from "../config/roles.js";
import { tables } from "../config/tables.js";

export default class Session {
    constructor(rol = null, username = null, table = tables[0].name, modifyID = null) {
        this.rol = rol;
        this.username = username;
        this.table = table;
        this.modifyID = modifyID;
    }
}
