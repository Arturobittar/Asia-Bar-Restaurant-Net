/**
 * Función para generar un ticket de impresión térmica de 58mm
 * @param {Object} datos - Objeto con los datos del ticket
 * @param {string} datos.empresa - Nombre de la empresa
 * @param {string} datos.fecha - Fecha de la transacción
 * @param {string} datos.hora - Hora de la transacción
 * @param {string} datos.numeroTicket - Número de ticket/orden
 * @param {string} datos.tipoVenta - Tipo de venta (ej: "Para llevar", "Mesa X")
 * @param {string} datos.clienteNombre - Nombre del cliente
 * @param {string} datos.clienteId - Identificación del cliente
 * @param {Array} datos.items - Array de objetos con los productos
 * @param {string} datos.items[].nombre - Nombre del producto
 * @param {number} datos.items[].cantidad - Cantidad del producto
 * @param {number} datos.items[].precio - Precio unitario
 * @param {number} datos.subtotal - Subtotal de la compra
 * @param {number} datos.iva - Impuesto (si aplica)
 * @param {number} datos.total - Total a pagar
 * @returns {string} - Texto formateado para impresión
 */

// Función para dividir texto en líneas según el ancho máximo
const dividirEnLineas = (texto, maxCaracteres) => {
  if (!texto) return [''];
  if (texto.length <= maxCaracteres) return [texto];
  
  const palabras = texto.split(' ');
  const lineas = [];
  let lineaActual = '';
  
  palabras.forEach(palabra => {
    if (palabra.length > maxCaracteres) {
      // Si una palabra es más larga que el ancho máximo, la dividimos
      if (lineaActual) lineas.push(lineaActual.trim());
      for (let i = 0; i < palabra.length; i += maxCaracteres) {
        lineas.push(palabra.substring(i, i + maxCaracteres));
      }
      lineaActual = '';
    } else if ((lineaActual + ' ' + palabra).length <= maxCaracteres) {
      lineaActual = lineaActual ? `${lineaActual} ${palabra}` : palabra;
    } else {
      if (lineaActual) lineas.push(lineaActual);
      lineaActual = palabra;
    }
  });
  
  if (lineaActual) lineas.push(lineaActual);
  return lineas;
};

export const generarTicket = (datos) => {
  // Caracteres máximos por línea (para impresora de 58mm)
  const MAX_CHARS = 32;
  
  // Configuración de columnas para productos
  const COL_CANT = 4;     // Ancho columna cantidad
  const COL_DESC = 18;    // Ancho columna descripción
  const COL_TOTAL = 8;    // Ancho columna total
  const SEPARADOR = 2;    // Espacios entre columnos
  
  // Función para centrar texto
  const centrarTexto = (texto) => {
    if (!texto) return '';
    const lineas = dividirEnLineas(texto, MAX_CHARS);
    return lineas.map(linea => {
      const espacios = Math.max(0, Math.floor((MAX_CHARS - linea.length) / 2));
      return ' '.repeat(espacios) + linea;
    }).join('\n');
  };

  // Función para alinear a los lados
  const alinearLados = (izquierda, derecha) => {
    const espacio = MAX_CHARS - izquierda.length - derecha.length;
    if (espacio >= 0) {
      return izquierda + ' '.repeat(espacio) + derecha;
    } else {
      // Si no cabe, ponemos en líneas separadas
      return `${izquierda}\n${' '.repeat(MAX_CHARS - derecha.length)}${derecha}`;
    }
  };

  // Función para formatear línea de producto con columnas fijas
  const formatearLineaProducto = (cantidad, descripcion, total) => {
    // Formatear cantidad (alineada a la izquierda, máximo COL_CANT caracteres)
    const cantStr = cantidad.toString().padEnd(COL_CANT, ' ').substring(0, COL_CANT);
    
    // Formatear total (alineado a la derecha, máximo COL_TOTAL caracteres)
    const totalStr = total.padStart(COL_TOTAL, ' ').substring(0, COL_TOTAL);
    
    // Dividir descripción en líneas que quepan en COL_DESC
    const lineasDesc = dividirEnLineas(descripcion, COL_DESC);
    
    const resultado = [];
    
    lineasDesc.forEach((lineaDesc, index) => {
      // Ajustar descripción al ancho de columna
      const descStr = lineaDesc.padEnd(COL_DESC, ' ').substring(0, COL_DESC);
      
      if (index === 0) {
        // Primera línea: cantidad + descripción + total
        resultado.push(cantStr + descStr + totalStr);
      } else {
        // Líneas adicionales: solo descripción (con espacios para cantidad)
        const espaciosCant = ' '.repeat(COL_CANT);
        const espaciosTotal = ' '.repeat(COL_TOTAL);
        resultado.push(espaciosCant + descStr + espaciosTotal);
      }
    });
    
    return resultado;
  };

  // Función para crear una línea divisoria
  const lineaDivisoria = (caracter = '-') => caracter.repeat(MAX_CHARS);
  
  // Iniciar el ticket
  let ticket = [];
  
  // Encabezado de la empresa
  ticket.push(centrarTexto('RESTAURANTE ASIA'));
  ticket.push(''); // Línea en blanco
  
  // Línea divisoria superior
  ticket.push(lineaDivisoria('*'));
  
  // Información del ticket
  ticket.push(alinearLados(`Ticket #${datos.numeroTicket || '0000'}`, datos.fecha || ''));
  ticket.push(alinearLados(`${datos.hora || ''}`, ''));
  
  // Mostrar número de mesa solo si el tipo de venta es "Para comer aquí" o "Delivery"
  const esParaComerAqui = datos.tipoVenta && 
    (datos.tipoVenta.toLowerCase().includes('comer') || 
     datos.tipoVenta.toLowerCase().includes('aquí'));
     
  const esDelivery = datos.tipoVenta && datos.tipoVenta.toLowerCase().includes('delivery');
     
  // Mostrar el tipo de venta primero
  ticket.push(`TIPO: ${datos.tipoVenta || 'Para llevar'}`);
  
  // Luego mostrar mesa o dirección según corresponda
  if (esParaComerAqui && datos.mesa) {
    ticket.push(`Mesa: ${datos.mesa || ''}`);
  } else if (esDelivery && datos.direccion) {
    // Mostrar dirección para delivery en la misma línea
    const lineaDireccion = `Dirección: ${datos.direccion}`;
    const lineasDireccion = dividirEnLineas(lineaDireccion, MAX_CHARS);
    
    // Agregar cada línea de la dirección
    lineasDireccion.forEach(linea => {
      ticket.push(linea);
    });
  }

  // Mostrar información del cliente si está disponible
  if (datos.clienteNombre || datos.clienteId) {
    
    if (datos.clienteNombre) {
      ticket.push(`Cliente: ${datos.clienteNombre}`);
    }
    if (datos.clienteId) {
      ticket.push(`Identificación: ${datos.clienteId}`);
    }
  }
  
  ticket.push(lineaDivisoria('*'));
  
  // Línea en blanco antes de los productos
  ticket.push('');
  
  // Encabezado de productos con espaciado exacto
  const header = `${'CANT'.padEnd(5)}${'DESCRIPCION'.padEnd(19)}${'TOTAL'.padStart(6)}`;
  ticket.push(header);
  ticket.push('-'.repeat(32));
  
  ticket.push(''); // Línea en blanco después del encabezado
  
  // Procesar cada ítem del pedido
  datos.items.forEach(item => {
    const nombre = item.nombre || 'Producto';
    const cantidad = item.cantidad || 1;
    const totalItem = item.precio || 0;
    
    // Formatear el precio con símbolo de moneda
    const precioFormateado = `$ ${totalItem.toFixed(2)}`;
    
    // Generar las líneas del producto
    const lineasProducto = formatearLineaProducto(cantidad, nombre, precioFormateado);
    lineasProducto.forEach(linea => ticket.push(linea));
  });
  
  // Línea en blanco antes de los totales
  ticket.push('');
  
  // Línea divisoria antes del total
  ticket.push(lineaDivisoria('-'));
  
  // Total
  const totalFormateado = `$ ${datos.total.toFixed(2)}`;
  ticket.push(alinearLados('TOTAL:', totalFormateado));
  
  // Línea divisoria después del total
  ticket.push(lineaDivisoria('='));
  
  // Mensaje final (opcional)
  if (datos.mensaje) {
    ticket.push('');
    // Dividir el mensaje en líneas si es muy largo
    const lineasMensaje = dividirEnLineas(datos.mensaje, MAX_CHARS);
    lineasMensaje.forEach(linea => ticket.push(centrarTexto(linea)));
    ticket.push(''); // Línea en blanco después del mensaje
  }
  
  // Mensaje de agradecimiento
  ticket.push('');
 
  
  // Espacio para cortar el ticket
  ticket.push('');
  ticket.push('');
  ticket.push('');
  
  return ticket.join('\n');
};
