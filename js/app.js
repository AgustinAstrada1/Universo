/* =========================================================
   UN UNIVERSO PARA TITI · js/app.js
   JavaScript puro (Vanilla). Genera estrellas, corazones,
   estrellas fugaces, tarjetas de mensajes y controla la música.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 1. REFERENCIAS AL HTML ---------- */
  const $ = (id) => document.getElementById(id);

  const pantalla = $('bienvenida');
  const universo = $('universo');
  const cielo = $('cielo');
  const luna = $('luna');
  const footer = document.querySelector('.mensaje-final');

  const btnEntrar = $('btn-entrar');
  const btnActivarMusica = $('btn-activar-musica');
  const btnMusica = $('btn-musica');
  const avisoAudio = $('aviso-audio');
  const audio = $('musica');
  const fuenteAudio = audio.querySelector('source');

  const capaDeco = $('capa-estrellas');
  const capaInteractiva = $('estrellas-interactivas');
  const capaCorazones = $('capa-corazones');
  const capaFugaces = $('capa-fugaces');

  const overlay = $('overlay');
  const tarjeta = $('tarjeta');
  const tarjetaTexto = $('tarjeta-texto');
  const btnCerrar = overlay.querySelector('.tarjeta-cerrar');


  /* ---------- 2. CONTENIDO ROMÁNTICO ---------- */

  // Un mensaje para cada estrella interactiva (son 8)
  const MENSAJES_ESTRELLAS = [
    'Aviso importante: hay un chico completamente enamorado de vos.',
    'Hacés que mis días sean más lindos.',
    'Gracias por hacerme sentir cosas que nunca imaginé.',
    'Si las estrellas brillan tanto, es porque todavía no te vieron sonreír. (Reite y piola)',
    'Gracias por existir y hacerme tan feliz.',
    'Te ganaste un montón de besos. Y no hay devolucion.',
    'Si tuviera que elegirte otra vez, lo haría sin dudas.',
    'No necesito un universo perfecto, porque te tengo a vos.'
  ];

  // Mensaje especial de la luna (dos párrafos)
  const MENSAJE_LUNA = [
    'Entre tantos universos, tuve la suerte de encontrar a alguien tan especial como vos. Quiero que nunca te olvides de lo mucho que te amo, de lo importante que sos para mí y de lo feliz que me hace compartir mis días con vos. Ojalá pueda seguir haciéndote sonreír, acompañándote y dándote todo ese amor que te merecés. Si hay algo que tengo claro, es que volvería a elegirte una y mil veces. Mi lugar favorito siempre va a ser con vos.',
    'Te amo hasta el infinito y mas alla. ❤️'
  ];

  // Emojis de los corazones flotantes
  const CORAZONES = ['💖', '🩷', '💜', '🤍', '💗'];


  /* ---------- 3. UTILIDADES ---------- */

  // Pantalla angosta (celular)
  const esPantallaChica = () => window.innerWidth <= 600;

  // Respeta la preferencia de "movimiento reducido" del dispositivo
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Número aleatorio entre min y max
  const azar = (min, max) => min + Math.random() * (max - min);

  // Evita ejecutar una función demasiadas veces seguidas (por ejemplo al girar el celular)
  function debounce(fn, espera) {
    let temporizador = null;
    return function (...args) {
      clearTimeout(temporizador);
      temporizador = setTimeout(() => fn.apply(this, args), espera);
    };
  }

  // Crea un párrafo con texto y clase opcional (usa textContent: seguro y sin cortes)
  function crearParrafo(texto, clase) {
    const p = document.createElement('p');
    p.textContent = texto;
    if (clase) p.className = clase;
    return p;
  }


  /* ---------- 4. MÚSICA DE FONDO ---------- */

  let fuenteFallo = false;   // true si no se encuentra audio/cancion.mp3
  audio.volume = 0.6;

  // Actualiza el botón flotante según la música esté sonando o no
  function actualizarBotonMusica() {
    const sonando = !audio.paused;
    btnMusica.classList.toggle('sonando', sonando);
    btnMusica.setAttribute('aria-pressed', String(sonando));
    btnMusica.title = sonando ? 'Pausar nuestra canción' : 'Reproducir nuestra canción';
    btnMusica.querySelector('.icono-musica').textContent = sonando ? '♫' : '♪';
  }

  // Intenta reproducir. Devuelve true si el navegador lo permitió.
  async function reproducirMusica() {
    if (fuenteFallo) return false;
    try {
      await audio.play();
      return true;
    } catch (error) {
      return false;   // El navegador bloqueó la reproducción
    }
  }

  // Si falta el archivo de música, avisamos con delicadeza
  fuenteAudio.addEventListener('error', () => {
    fuenteFallo = true;
    avisoAudio.hidden = false;
    btnActivarMusica.hidden = true;
    btnMusica.disabled = true;
  });

  // Mantienen sincronizado el botón y ocultan el botón de activación cuando ya suena
  audio.addEventListener('play', actualizarBotonMusica);
  audio.addEventListener('pause', actualizarBotonMusica);
  audio.addEventListener('playing', () => {
    btnActivarMusica.hidden = true;
    actualizarBotonMusica();
  });

  // Botón flotante: activa, pausa y reanuda la canción
  btnMusica.addEventListener('click', async () => {
    if (audio.paused) {
      await reproducirMusica();
    } else {
      audio.pause();
    }
    actualizarBotonMusica();
  });

  // Botón "Activar nuestra canción ♫" (cuando el navegador bloqueó el audio)
  btnActivarMusica.addEventListener('click', async () => {
    const ok = await reproducirMusica();
    if (ok) btnActivarMusica.hidden = true;
  });

  // Intento automático al abrir la página (sin controles ni reinicios)
  async function intentoInicialMusica() {
    const ok = await reproducirMusica();
    if (!ok && !fuenteFallo) {
      btnActivarMusica.hidden = false;   // Bloqueado: mostramos el botón delicado
    }
  }


  /* ---------- 5. TARJETAS DE MENSAJES ---------- */

  let cierreTimer = null;
  let elementoAnterior = null;

  // Abre la tarjeta. tipo = 'estrella' o 'luna'
  function abrirTarjeta(tipo, mensaje) {
    clearTimeout(cierreTimer);
    elementoAnterior = document.activeElement;

    tarjetaTexto.innerHTML = '';

    if (tipo === 'luna') {
      tarjeta.classList.add('tarjeta-luna');
      tarjetaTexto.appendChild(crearParrafo(MENSAJE_LUNA[0], 'texto-luna'));
      tarjetaTexto.appendChild(crearParrafo(MENSAJE_LUNA[1], 'texto-luna firma-luna'));
    } else {
      tarjeta.classList.remove('tarjeta-luna');
      tarjetaTexto.appendChild(crearParrafo(mensaje, 'mensaje-estrella'));
    }

    overlay.hidden = false;
    // Doble requestAnimationFrame: el navegador pinta primero y luego anima la entrada
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add('abierto'));
    });
    btnCerrar.focus({ preventScroll: true });
  }

  // Cierra la tarjeta con animación de salida
  function cerrarTarjeta() {
    if (overlay.hidden || !overlay.classList.contains('abierto')) return;
    overlay.classList.remove('abierto');
    clearTimeout(cierreTimer);
    cierreTimer = setTimeout(() => {
      overlay.hidden = true;
      if (elementoAnterior && elementoAnterior.focus) {
        elementoAnterior.focus({ preventScroll: true });
      }
    }, 450);
  }

  btnCerrar.addEventListener('click', cerrarTarjeta);

  // Tocar fuera de la tarjeta también la cierra
  overlay.addEventListener('click', (evento) => {
    if (evento.target === overlay) cerrarTarjeta();
  });

  // Tecla Esc para cerrar (computadora)
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') cerrarTarjeta();
  });


  /* ---------- 6. ESTRELLAS DECORATIVAS DE FONDO ---------- */

  // Cantidad según el tamaño de la pantalla: menos en celulares, más en computadoras
  function crearEstrellasDecorativas() {
    const area = cielo.clientWidth * cielo.clientHeight;
    const cantidad = Math.min(160, Math.max(45, Math.round(area / 7000)));
    const fragmento = document.createDocumentFragment();

    for (let i = 0; i < cantidad; i++) {
      const estrella = document.createElement('span');
      estrella.className = 'estrella-deco';

      const tamano = azar(1, 3.4);
      estrella.style.width = tamano.toFixed(1) + 'px';
      estrella.style.height = tamano.toFixed(1) + 'px';
      estrella.style.left = (Math.random() * 100).toFixed(2) + '%';
      estrella.style.top = (Math.random() * 100).toFixed(2) + '%';

      // Cada estrella parpadea a su propio ritmo
      estrella.style.setProperty('--dur', azar(3, 7).toFixed(1) + 's');
      estrella.style.setProperty('--del', (-Math.random() * 6).toFixed(1) + 's');

      fragmento.appendChild(estrella);
    }
    capaDeco.appendChild(fragmento);
  }


  /* ---------- 7. ESTRELLAS INTERACTIVAS ---------- */

  const estrellas = [];

  // Crea un botón por cada mensaje
  function crearEstrellasInteractivas() {
    MENSAJES_ESTRELLAS.forEach((mensaje, indice) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      // Una de cada dos estrellas brilla de forma distinta
      boton.className = 'estrella-btn' + (indice % 2 === 0 ? ' brillante' : '');
      boton.setAttribute('aria-label', 'Estrella ' + (indice + 1) + ': toca para leer un mensaje');
      boton.innerHTML = '<span class="nucleo" aria-hidden="true"></span>';

      // Pequeño pulso al tocarla
      boton.addEventListener('pointerdown', () => {
        boton.classList.add('tocada');
        setTimeout(() => boton.classList.remove('tocada'), 350);
      });

      boton.addEventListener('click', () => abrirTarjeta('estrella', mensaje));

      capaInteractiva.appendChild(boton);
      estrellas.push(boton);
    });

    colocarEstrellas();
  }

  // Reparte las estrellas sin superponerlas ni tapar la luna o el mensaje final
  function colocarEstrellas() {
    if (estrellas.length === 0) return;

    const r = cielo.getBoundingClientRect();
    const ancho = r.width;
    const alto = r.height;

    // Zona de la luna (con margen) donde no queremos estrellas
    const lr = luna.getBoundingClientRect();
    const zonaLuna = {
      x1: lr.left - r.left - 50,
      y1: lr.top - r.top - 50,
      x2: lr.right - r.left + 50,
      y2: lr.bottom - r.top + 50
    };

    // Límites: dentro de la pantalla y por encima del mensaje final
    const margen = 34;
    const xMin = margen;
    const xMax = Math.max(xMin + 1, ancho - margen);
    const yMin = margen + 20;
    const fr = footer.getBoundingClientRect();
    const yMax = Math.max(yMin + 1, fr.top - r.top - 20);

    // Distancia mínima entre estrellas (se adapta al tamaño de la pantalla)
    const distanciaMinima = Math.max(70, Math.min(ancho, alto) * 0.16);
    const colocadas = [];

    estrellas.forEach((estrella) => {
      let posicion = null;

      // Buscamos un lugar libre (hasta 400 intentos)
      for (let intento = 0; intento < 400 && !posicion; intento++) {
        const x = azar(xMin, xMax);
        const y = azar(yMin, yMax);

        const dentroDeLuna = x > zonaLuna.x1 && x < zonaLuna.x2 && y > zonaLuna.y1 && y < zonaLuna.y2;
        if (dentroDeLuna) continue;

        const libre = colocadas.every((p) => Math.hypot(p.x - x, p.y - y) >= distanciaMinima);
        if (libre) posicion = { x, y };
      }

      // Si no hubo lugar perfecto, usamos una posición aleatoria
      if (!posicion) {
        posicion = { x: azar(xMin, xMax), y: azar(yMin, yMax) };
      }

      colocadas.push(posicion);
      estrella.style.left = posicion.x.toFixed(1) + 'px';
      estrella.style.top = posicion.y.toFixed(1) + 'px';
    });
  }


  /* ---------- 8. LUNA ---------- */

  luna.addEventListener('click', () => abrirTarjeta('luna'));


  /* ---------- 9. CORAZONES FLOTANTES ---------- */

  function crearCorazon() {
    // No generamos nada si la pestaña está oculta o si se pide menos movimiento
    if (document.hidden || movimientoReducido) return;

    // Límite de corazones simultáneos para que sea liviano en celulares
    const limite = esPantallaChica() ? 12 : 22;
    if (capaCorazones.childElementCount >= limite) return;

    const corazon = document.createElement('span');
    corazon.className = 'corazon';
    corazon.textContent = CORAZONES[Math.floor(Math.random() * CORAZONES.length)];
    corazon.style.left = azar(5, 92).toFixed(1) + '%';
    corazon.style.setProperty('--tam', azar(12, 24).toFixed(0) + 'px');
    corazon.style.setProperty('--dur', azar(7, 12).toFixed(1) + 's');
    corazon.style.setProperty('--deriva', azar(-30, 30).toFixed(0) + 'px');

    capaCorazones.appendChild(corazon);

    // Lo quitamos al terminar su animación
    corazon.addEventListener('animationend', () => corazon.remove());
  }

  // Un corazón nuevo cada cierto tiempo (más lento en celulares)
  function iniciarCorazones() {
    if (movimientoReducido) return;
    setInterval(crearCorazon, esPantallaChica() ? 1100 : 750);
  }


  /* ---------- 10. ESTRELLAS FUGACES ---------- */

  function crearFugaz() {
    if (document.hidden || movimientoReducido) return;

    const fugaz = document.createElement('span');
    fugaz.className = 'fugaz';
    // Empieza en la mitad superior, a la izquierda o al centro
    fugaz.style.left = azar(-5, 60).toFixed(1) + '%';
    fugaz.style.top = azar(2, 35).toFixed(1) + '%';

    capaFugaces.appendChild(fugaz);
    fugaz.addEventListener('animationend', () => fugaz.remove());
  }

  // Aparecen de vez en cuando, sin ser molestas
  function iniciarFugaces() {
    if (movimientoReducido) return;
    const programar = () => {
      const espera = azar(6000, 14000);
      setTimeout(() => {
        crearFugaz();
        programar();
      }, espera);
    };
    programar();
  }


  /* ---------- 11. ENTRADA AL UNIVERSO ---------- */

  let universoIniciado = false;

  // Construye el universo la primera vez que se entra
  function iniciarUniverso() {
    if (universoIniciado) return;
    universoIniciado = true;

    crearEstrellasDecorativas();
    crearEstrellasInteractivas();
    iniciarCorazones();
    iniciarFugaces();
  }

  btnEntrar.addEventListener('click', async () => {
    // Primero intentamos la música mientras dura el toque del usuario
    const sonando = reproducirMusica();

    iniciarUniverso();

    // Transición suave: la bienvenida se desvanece y aparece el universo
    pantalla.classList.add('saliendo');
    universo.classList.add('visible');
    setTimeout(() => pantalla.classList.add('oculta'), 1100);

    const ok = await sonando;
    if (!ok && !fuenteFallo) btnActivarMusica.hidden = false;
  });

  // Recalcula las posiciones al girar el celular o cambiar el tamaño
  window.addEventListener('resize', debounce(() => {
    if (universoIniciado) colocarEstrellas();
  }, 250));


  /* ---------- 12. ARRANQUE ---------- */

  // Al abrir la página intentamos la música (puede ser bloqueada por el navegador)
  intentoInicialMusica();
})();
