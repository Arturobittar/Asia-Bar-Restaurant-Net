import app from './app.js';

const PORT = process.env.PORT || 9090;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
    console.log(`Acceso local: http://localhost:${PORT}`);
    console.log(`Acceso en red: http://10.221.47.59:${PORT}`);
});
