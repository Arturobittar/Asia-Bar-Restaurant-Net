import React from 'react';
import { QrCode } from 'lucide-react';
import { getNetworkConfig } from '../config/network';
import './QRCodeButton.css';

class QRCodeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showQR: false,
            networkUrl: getNetworkConfig().serverUrl
        };
    }

    toggleQR = () => {
        this.setState(prevState => ({
            showQR: !prevState.showQR
        }));
    }

    render() {
        const { networkUrl } = this.state;
        
        return (
            <div className="qr-container">
                <button 
                    className="qr-button"
                    onClick={this.toggleQR}
                    title="Mostrar código QR para acceso móvil"
                >
                    <QrCode size={24} />
                    <span>Acceso Móvil</span>
                </button>
                
                {this.state.showQR && (
                    <div className="qr-modal">
                        <div className="qr-content">
                            <h3>Escanee para acceder</h3>
                            <div className="qr-code-holder">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(networkUrl)}`} 
                                    alt="Código QR de acceso"
                                />
                            </div>
                            <p className="qr-url">{networkUrl}</p>
                            <button 
                                className="close-button"
                                onClick={this.toggleQR}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default QRCodeButton;
