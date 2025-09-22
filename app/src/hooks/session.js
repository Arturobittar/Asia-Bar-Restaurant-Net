import { useContext } from 'react';
import Session from "../utils/session.js";
import SessionContext from "../context/session.js";

export function useTableChanger(table) {
    const { session, setSession } = useContext(SessionContext);
  
    return () => setSession(new Session(session.rol, session.username, table, session.modifyID));
}

export function useLateTableChanger() {
    const { session, setSession } = useContext(SessionContext);
  
    return (table) => setSession(new Session(session.rol, session.username, table, session.modifyID));
};

export function useModifyIDChanger() {
    const { session, setSession } = useContext(SessionContext);
  
    return (id) => setSession(new Session(session.rol, session.username, session.table, id));
}

export function useModifyID() {
    const { session, setSession } = useContext(SessionContext);
    
    return session.modifyID;
}
