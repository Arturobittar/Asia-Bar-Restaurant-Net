#!/usr/bin/env python3
"""
Script para configurar automáticamente las direcciones IP en el proyecto Asia Bar Restaurant
"""

import os
import socket
import re
import sys
from pathlib import Path

def get_local_ip():
    """Obtiene la dirección IP local"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception as e:
        print(f"Error al obtener la IP local: {e}")
        return "192.168.0.105"  # IP por defecto

def update_file(file_path, new_content):
    """Actualiza un archivo con el nuevo contenido"""
    try:
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"✅ Archivo actualizado: {file_path}")
        return True
    except Exception as e:
        print(f"❌ Error al actualizar {file_path}: {e}")
        return False

def get_api_js_content(ip):
    """Genera el contenido para api.js"""
    return f"""// Configuración de la API
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

// Usar localhost para desarrollo local, de lo contrario usar la IP
const API_BASE_URL = isLocalhost 
  ? 'http://localhost:9090/api' 
  : 'http://{ip}:9090/api';

export const apiAddress = API_BASE_URL;
"""

def get_app_js_content(ip):
    """Genera el contenido para app.js del servidor"""
    return f"""import express from 'express';
import morgan from 'morgan';
import CookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import crudRouter from './routes/crud.routes.js';
import cors from 'cors';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://{ip}:3000'
];

app.use(cors({{
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}}));

app.use(morgan('dev'));
app.use(express.json());
app.use(CookieParser());

app.use('/api', authRouter);
app.use('/api', crudRouter);

export default app;
"""

def get_server_index_js_content(ip):
    """Genera el contenido para index.js del servidor"""
    return f"""import app from './app.js';

const PORT = process.env.PORT || 9090;

app.listen(PORT, '0.0.0.0', () => {{
    console.log(`Servidor corriendo en http://0.0.0.0:${{PORT}}`);
    console.log(`Acceso local: http://localhost:${{PORT}}`);
    console.log(`Acceso en red: http://{ip}:${{PORT}}`);
}});
"""

def main():
    print("=== Configuración de Red para Asia Bar Restaurant ===")
    print("Obteniendo configuración de red...")
    
    # Obtener la ruta base del proyecto
    script_path = Path(__file__).resolve()
    project_root = script_path.parent
    local_ip = get_local_ip()
    
    print(f"\n📡 Tu dirección IP local es: {local_ip}")
    
    # Actualizar los archivos
    update_file(
        project_root / "app" / "src" / "config" / "api.js",
        get_api_js_content(local_ip)
    )
    
    update_file(
        project_root / "server" / "src" / "app.js",
        get_app_js_content(local_ip)
    )
    
    update_file(
    project_root / "server" / "src" / "index.js",
    get_server_index_js_content(local_ip)
)
    
    # Actualizar archivo .env
    env_path = project_root / "server" / ".env"
    env_content = f"FRONTEND_URL=http://{local_ip}:3000\nBACKEND_URL=http://{local_ip}:9090"
    
    try:
        env_path.parent.mkdir(parents=True, exist_ok=True)
        with open(env_path, 'w') as f:
            f.write(env_content)
        print(f"✅ Archivo actualizado: {env_path}")
    except Exception as e:
        print(f"❌ Error al actualizar {env_path}: {e}")
    
    print("\n✅ Configuración completada exitosamente!")
    print(f"\nPuedes acceder a la aplicación desde:")
    print(f"- Computadora: http://localhost:3000")
    print(f"- Dispositivos móviles: http://{local_ip}:3000")
    print("\nAsegúrate de que los dispositivos estén en la misma red WiFi.")

if __name__ == "__main__":
    main()