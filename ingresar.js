document.addEventListener('DOMContentLoaded', () => {
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');

  // URL base del servidor
  const SERVER_URL = 'https://dimar-tecnologia.onrender.com';

  // Función para mostrar notificaciones
  function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
      <strong>${tipo === 'success' ? '¡Éxito!' : tipo === 'danger' ? '¡Error!' : 'Información'}</strong> ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remover después de 5 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Función para cambiar entre formularios
  if (btnLogin && btnRegister && formLogin && formRegister) {
    btnLogin.addEventListener('click', () => {
      btnLogin.classList.add('active');
      btnRegister.classList.remove('active');
      formLogin.classList.add('active');
      formRegister.classList.remove('active');
    });

    btnRegister.addEventListener('click', () => {
      btnRegister.classList.add('active');
      btnLogin.classList.remove('active');
      formRegister.classList.add('active');
      formLogin.classList.remove('active');
    });
  }

  // Manejar formulario de registro
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nombre = document.getElementById('registerName').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const password = document.getElementById('registerPassword').value.trim();
      
      // Validaciones básicas
      if (!nombre || !email || !password) {
        mostrarNotificacion('Todos los campos son obligatorios', 'danger');
        return;
      }
      
      if (password.length < 6) {
        mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'danger');
        return;
      }
      
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        mostrarNotificacion('Por favor ingresa un email válido', 'danger');
        return;
      }
      
      // Mostrar loading
      const submitBtn = formRegister.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';
      submitBtn.disabled = true;
      
      try {
        // Datos a enviar - asegurarse de que estén bien estructurados
        const userData = {
          nombre: nombre,
          email: email,
          password: password
        };
        
        console.log('Enviando datos:', userData); // Para debugging
        
        // Enviar datos al servidor - CORREGIDO: usar URL completa y consistente
        const response = await fetch(`${SERVER_URL}/api/registro`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        console.log('Response status:', response.status); // Para debugging
        
        // Obtener el texto de la respuesta para debugging
        const responseText = await response.text();
        console.log('Response text:', responseText); // Para debugging
        
        let resultado;
        try {
          resultado = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          throw new Error('El servidor no devolvió un JSON válido');
        }
        
        if (response.ok && resultado.success) {
          mostrarNotificacion('¡Registro exitoso! Ya puedes iniciar sesión', 'success');
          
          // Limpiar formulario
          formRegister.reset();
          
          // Cambiar a formulario de login después de 2 segundos
          setTimeout(() => {
            btnLogin.click();
          }, 2000);
          
        } else {
          // Mostrar el mensaje de error del servidor
          const errorMessage = resultado.message || resultado.error || 'Error al registrar usuario';
          mostrarNotificacion(errorMessage, 'danger');
        }
        
      } catch (error) {
        console.error('Error completo:', error);
        
        // Mensajes de error más específicos
        if (error.message.includes('Failed to fetch')) {
          mostrarNotificacion('Error de conexión. Verifica que el servidor esté funcionando en http://localhost:3000', 'danger');
        } else if (error.message.includes('JSON')) {
          mostrarNotificacion('Error en la respuesta del servidor. Revisa la consola para más detalles.', 'danger');
        } else {
          mostrarNotificacion(error.message || 'Error desconocido', 'danger');
        }
      } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Manejar formulario de login
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      
      if (!email || !password) {
        mostrarNotificacion('Email y contraseña son obligatorios', 'danger');
        return;
      }
      
      // Mostrar loading
      const submitBtn = formLogin.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';
      submitBtn.disabled = true;
      
      try {
        const loginData = {
          email: email,
          password: password
        };
        
        console.log('Enviando datos de login:', loginData); // Para debugging
        
        const response = await fetch(`${SERVER_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(loginData)
        });
        
        console.log('Login response status:', response.status); // Para debugging
        
        const responseText = await response.text();
        console.log('Login response text:', responseText); // Para debugging
        
        let resultado;
        try {
          resultado = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Error parsing login JSON:', parseError);
          throw new Error('El servidor no devolvió un JSON válido');
        }
        
        if (response.ok && resultado.success) {
          mostrarNotificacion(`¡Bienvenido ${resultado.usuario.nombre}!`, 'success');
          
          // Guardar datos del usuario en localStorage (opcional)
          localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
          
          // Redirigir al inicio después de 2 segundos
          setTimeout(() => {
            window.location.href = `${SERVER_URL}/`;
          }, 2000);
          
        } else {
          const errorMessage = resultado.message || resultado.error || 'Credenciales inválidas';
          mostrarNotificacion(errorMessage, 'danger');
        }
        
      } catch (error) {
        console.error('Error de login:', error);
        
        if (error.message.includes('Failed to fetch')) {
          mostrarNotificacion('Error de conexión. Verifica que el servidor esté funcionando en http://localhost:3000', 'danger');
        } else if (error.message.includes('JSON')) {
          mostrarNotificacion('Error en la respuesta del servidor. Revisa la consola para más detalles.', 'danger');
        } else {
          mostrarNotificacion(error.message || 'Error desconocido', 'danger');
        }
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Función para verificar si el usuario ya está logueado
  function verificarSesion() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      try {
        const userData = JSON.parse(usuario);
        const mensaje = `Ya tienes una sesión activa como ${userData.nombre}`;
        mostrarNotificacion(mensaje, 'info');
      } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
        localStorage.removeItem('usuario'); // Limpiar datos corruptos
      }
    }
  }

  // Verificar sesión al cargar la página
  verificarSesion();
});