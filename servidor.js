const express = require('express');
const path = require('path');
const cors = require('cors');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname))); // Servir archivos estáticos

// Ruta para servir el archivo principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para servir la página de ingreso
app.get('/ingresar', (req, res) => {
    res.sendFile(path.join(__dirname, 'paginas', 'ingresar.html'));
});

// Función para crear el archivo Excel si no existe
function inicializarExcel() {
    const rutaExcel = path.join(__dirname, 'usuarios.xlsx');
    
    if (!fs.existsSync(rutaExcel)) {
        // Crear un nuevo libro de trabajo
        const workbook = XLSX.utils.book_new();
        
        // Crear hoja para usuarios registrados
        const datosUsuarios = [
            ['ID', 'Nombre Completo', 'Email', 'Fecha de Registro', 'Hora de Registro']
        ];
        const hojaUsuarios = XLSX.utils.aoa_to_sheet(datosUsuarios);
        XLSX.utils.book_append_sheet(workbook, hojaUsuarios, 'Usuarios Registrados');
        
        // Crear hoja para intentos de login
        const datosLogin = [
            ['ID', 'Email', 'Fecha de Intento', 'Hora de Intento', 'Estado']
        ];
        const hojaLogin = XLSX.utils.aoa_to_sheet(datosLogin);
        XLSX.utils.book_append_sheet(workbook, hojaLogin, 'Intentos de Login');
        
        // Guardar el archivo
        XLSX.writeFile(workbook, rutaExcel);
        console.log('Archivo Excel creado: usuarios.xlsx');
    }
}

// Función para agregar usuario al Excel
function agregarUsuarioExcel(nombre, email) {
    const rutaExcel = path.join(__dirname, 'usuarios.xlsx');
    
    try {
        // Leer el archivo existente
        const workbook = XLSX.readFile(rutaExcel);
        const nombreHoja = 'Usuarios Registrados';
        const hoja = workbook.Sheets[nombreHoja];
        
        // Convertir a array
        const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });
        
        // Crear nuevo ID
        const nuevoID = datos.length; // El length será el próximo ID
        
        // Obtener fecha y hora actual
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString('es-AR');
        const hora = ahora.toLocaleTimeString('es-AR');
        
        // Agregar nueva fila
        const nuevaFila = [nuevoID, nombre, email, fecha, hora];
        datos.push(nuevaFila);
        
        // Convertir de vuelta a hoja
        const nuevaHoja = XLSX.utils.aoa_to_sheet(datos);
        workbook.Sheets[nombreHoja] = nuevaHoja;
        
        // Guardar archivo
        XLSX.writeFile(workbook, rutaExcel);
        
        return { success: true, id: nuevoID };
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        return { success: false, error: error.message };
    }
}

// Función para registrar intento de login
function registrarIntentoLogin(email, exitoso = false) {
    const rutaExcel = path.join(__dirname, 'usuarios.xlsx');
    
    try {
        const workbook = XLSX.readFile(rutaExcel);
        const nombreHoja = 'Intentos de Login';
        const hoja = workbook.Sheets[nombreHoja];
        
        const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });
        
        const nuevoID = datos.length;
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString('es-AR');
        const hora = ahora.toLocaleTimeString('es-AR');
        const estado = exitoso ? 'EXITOSO' : 'FALLIDO';
        
        const nuevaFila = [nuevoID, email, fecha, hora, estado];
        datos.push(nuevaFila);
        
        const nuevaHoja = XLSX.utils.aoa_to_sheet(datos);
        workbook.Sheets[nombreHoja] = nuevaHoja;
        
        XLSX.writeFile(workbook, rutaExcel);
        
        return { success: true };
    } catch (error) {
        console.error('Error al registrar intento de login:', error);
        return { success: false, error: error.message };
    }
}

// Función para verificar si el usuario existe
function verificarUsuario(email) {
    const rutaExcel = path.join(__dirname, 'usuarios.xlsx');
    
    try {
        const workbook = XLSX.readFile(rutaExcel);
        const nombreHoja = 'Usuarios Registrados';
        const hoja = workbook.Sheets[nombreHoja];
        
        const datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });
        
        // Buscar el email en los datos (columna 2, índice 2)
        for (let i = 1; i < datos.length; i++) {
            if (datos[i][2] === email) {
                return {
                    existe: true,
                    usuario: {
                        id: datos[i][0],
                        nombre: datos[i][1],
                        email: datos[i][2],
                        fechaRegistro: datos[i][3]
                    }
                };
            }
        }
        
        return { existe: false };
    } catch (error) {
        console.error('Error al verificar usuario:', error);
        return { existe: false, error: error.message };
    }
}

// Rutas API
// Registro de usuario
app.post('/api/registro', (req, res) => {
    const { nombre, email, password } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos son obligatorios'
        });
    }
    
    // Verificar si el usuario ya existe
    const verificacion = verificarUsuario(email);
    if (verificacion.existe) {
        return res.status(400).json({
            success: false,
            message: 'El email ya está registrado'
        });
    }
    
    // Agregar usuario al Excel
    const resultado = agregarUsuarioExcel(nombre, email);
    
    if (resultado.success) {
        res.json({
            success: true,
            message: 'Usuario registrado exitosamente',
            usuario: {
                id: resultado.id,
                nombre: nombre,
                email: email
            }
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: resultado.error
        });
    }
});

// Login de usuario
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email y contraseña son obligatorios'
        });
    }
    
    // Verificar si el usuario existe
    const verificacion = verificarUsuario(email);
    
    if (verificacion.existe) {
        // Registrar intento exitoso
        registrarIntentoLogin(email, true);
        
        res.json({
            success: true,
            message: 'Login exitoso',
            usuario: verificacion.usuario
        });
    } else {
        // Registrar intento fallido
        registrarIntentoLogin(email, false);
        
        res.status(401).json({
            success: false,
            message: 'Credenciales inválidas'
        });
    }
});

// Ruta para obtener todos los usuarios (opcional, para administración)
app.get('/api/usuarios', (req, res) => {
    const rutaExcel = path.join(__dirname, 'usuarios.xlsx');
    
    try {
        const workbook = XLSX.readFile(rutaExcel);
        const nombreHoja = 'Usuarios Registrados';
        const hoja = workbook.Sheets[nombreHoja];
        
        // Convertir a JSON
        const usuarios = XLSX.utils.sheet_to_json(hoja);
        
        res.json({
            success: true,
            usuarios: usuarios
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
});

// Inicializar Excel al iniciar el servidor
inicializarExcel();

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📊 Archivo Excel: usuarios.xlsx`);
    console.log(`📁 Carpeta del proyecto: ${__dirname}`);
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
});

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});