import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useRolChanger } from '../hooks/session.js';

import Form from '../components/layout/form.js';
import { RequiredInputBox } from '../components/ui/form.js';
import { SubmitButton } from '../components/ui/buttons.js';

import { onLogin } from '../utils/api.js';

function Login() {

    const rolChanger = useRolChanger();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    return (
        <Form title="Inicio de Sesión" onSubmit={ (e) => onLogin(e, username, password, navigate, rolChanger) } >
            <RequiredInputBox title={ "Nombre de Usuario" } onChange={ setUsername } />
            <RequiredInputBox type='password' title={ "Contraseña" } onChange={ setPassword } />

            <SubmitButton text="Acceder" />
        </Form>
    );
}

export default Login;
