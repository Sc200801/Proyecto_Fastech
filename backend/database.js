// database.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configura tu conexión a MySQL aquí
const db = mysql.createConnection({
    host: 'localhost',
    user: 'fastech_user',      // Tu usuario de MySQL
    password: '1278SC',      // Tu contraseña de MySQL
    database: 'fastech_db'
});

// 1. RUTA DE REGISTRO (Para usuarios normales)
app.post('/api/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        const query = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, "cliente")';
        
        db.query(query, [nombre, email, passwordEncriptada], (err, result) => {
            if (err) {
                // El código 'ER_DUP_ENTRY' o el número 1062 es el que manda MySQL para duplicados
                if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
                    return res.status(400).json({ error: 'Este correo electrónico ya está registrado. Intenta con otro.' });
                }
                return res.status(500).json({ error: 'Hubo un error al registrar al usuario.' });
            }
            res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Error interno en el servidor' });
    }
});

// 2. RUTA DE LOGIN (Para ambos: Admins y Clientes)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en el servidor' });
        if (results.length === 0) return res.status(400).json({ error: 'Usuario no encontrado' });

        const usuario = results[0];

        // Comparar la contraseña ingresada con el hash encriptado de la DB
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) return res.status(400).json({ error: 'Contraseña incorrecta' });

        // Si todo está bien, devolvemos los datos del usuario incluyendo su ROL
        res.json({
            mensaje: 'Login exitoso',
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol // Aquí viaja si es 'admin' o 'cliente'
            }
        });
    });
});

// Ruta para obtener productos
app.get('/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Ruta para agregar un producto
app.post('/productos', (req, res) => {
    const { nombre, precio, stock, categoria, especificaciones, imagen } = req.body;
    db.query('INSERT INTO productos (nombre, precio, stock, categoria, especificaciones, imagen) VALUES (?, ?, ?, ?, ?, ?)', 
    [nombre, precio, stock, categoria, especificaciones, imagen || 'default.png'], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, ...req.body });
    });
});

// RUTA PARA ELIMINAR UN PRODUCTO PERMANENTEMENTE
app.delete('/productos/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error("Error al eliminar producto:", err);
            return res.status(500).send(err);
        }
        res.json({ mensaje: 'Producto eliminado con éxito', id });
    });
});

// RUTA PARA EDITAR UN PRODUCTO EXISTENTE POR SU ID
app.put('/productos/:id', (req, res) => {
  const { id } = req.params;
  // Recibimos todos los campos del formulario, incluyendo las especificaciones
  const { nombre, precio, stock, categoria, especificaciones, imagen } = req.body;

  // Query SQL para actualizar los valores en la fila correspondiente
  const query = `
    UPDATE productos 
    SET nombre = ?, precio = ?, stock = ?, categoria = ?, especificaciones = ?, imagen = ? 
    WHERE id = ?
  `;

  db.query(
    query, 
    [nombre, precio, stock, categoria, especificaciones, imagen || 'default.png', id], 
    (err, result) => {
      if (err) {
        console.error("Error al actualizar el producto en MySQL:", err);
        return res.status(500).json({ error: "Error interno del servidor al actualizar" });
      }

      // Si el ID no existía en la base de datos
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }

      // Respuesta exitosa que React está esperando recibir
      res.json({ message: "¡Producto actualizado con éxito en la base de datos!" });
    }
  );
});

// RUTA ACTUALIZADA PARA SUMAR STOCK (CON ENFOQUE DE REABASTECIMIENTO)
app.put('/productos/:id/stock', (req, res) => {
    const { id } = req.params;
    const { cantidadASumar } = req.body; // Ahora recibimos las unidades que se van a agregar

    const cantidadValidada = cantidadASumar ? parseInt(cantidadASumar) : 0;

    // Usamos 'stock = stock + ?' para que MySQL haga la suma automáticamente
    const query = 'UPDATE productos SET stock = stock + ? WHERE id = ?';
    
    db.query(query, [cantidadASumar, id], (err, result) => {
        if (err) {
            console.error("Error al reabastecer el stock:", err);
            return res.status(500).send(err);
        }
        res.json({ mensaje: 'Stock sumado con éxito', id, cantidadAgregada: cantidadValidada });
    });
});

app.post('/api/checkout', (req, res) => {
  const { productosComprados } = req.body; 

  if (!productosComprados || productosComprados.length === 0) {
    return res.status(400).json({ error: "El carrito está vacío" });
  }

  // Usamos promesas o un bucle dinámico para procesar cada producto en la base de datos
  // En MySQL, la instrucción matemática "SET stock = stock - ?" evita problemas de concurrencia
  const queryText = "UPDATE productos SET stock = stock - ? WHERE id = ?";

  let errores = [];
  let procesados = 0;

  productosComprados.forEach((prod) => {
    // db o connection (usa la variable corregida de tu conexión MySQL)
    db.query(queryText, [prod.cantidad, prod.id], (err, result) => {
      procesados++;
      
      if (err) {
        console.error(`Error restando stock al producto ${prod.id}:`, err);
        errores.push(prod.id);
      }

      // Una vez que se terminen de ejecutar todas las consultas del ciclo
      if (procesados === productosComprados.length) {
        if (errores.length > 0) {
          return res.status(500).json({ 
            error: "Hubo problemas al procesar algunos artículos", 
            idsConError: errores 
          });
        }
        return res.json({ success: true, message: "¡Stock actualizado e inventario sincronizado con éxito!" });
      }
    });
  });
});

app.listen(5000, () => console.log("Servidor corriendo en puerto 5000"));