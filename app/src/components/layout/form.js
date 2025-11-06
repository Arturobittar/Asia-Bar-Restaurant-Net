import './form.css';

function Form({ title, children, onSubmit = () => {}}) {
    return (
        <div className='form-page'>
            <form onSubmit={ onSubmit } id={ title } class='frame-form'> 
                <h1>{ title }</h1>
                
                <hr></hr>

                { children }
            </form>
        </div>
    );
}  
function FormEmergente({ title, children, onSubmit = () => {} }) {
    return (
        <div className='formEmergente-page'>
            <form onSubmit={onSubmit} id={title} className='frame-form frame-formEmergente'>
                <h1>{title}</h1>
                <hr />
                {children}
            </form>
        </div>
    );
}

export { FormEmergente };
export { Form as default }; 
