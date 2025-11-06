import './buttons.css';
import { Link } from 'react-router-dom';

export function SubmitButton({text = "Continuar"}) {
    return (<button type="submit" className="submit-button">{text}</button>);
}

export function GoBackButton({text = "Volver", to = "/"}) {
    return (
        <Link className="go-back-button" to={to}>
            {text}
        </Link>
    );    
}

export function PrimaryButton({ text, onClick = null}) {
    return (<button className="primary-button" onClick={onClick}>{text}</button>);  
};
