document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const optionsBar = document.getElementById('optionsBar');
  const intro = document.getElementById('intro');
  const chatWrapper = document.getElementById('chatWrapper');
  const introAvatar = document.getElementById('introAvatar');
  const historialLista = document.getElementById('historialLista');

  // CONFIGURACIÓN DEL AVATAR ANIMADO
  const avatarFrames = [
    'Juania.png.png0001.png', 'Juania.png.png0002.png', 'Juania.png.png0003.png', 'Juania.png.png0004.png',
    'Juania.png.png0005.png', 'Juania.png.png0006.png', 'Juania.png.png0007.png', 'Juania.png.png0008.png',
    'Juania.png.png0009.png', 'Juania.png.png0010.png', 'Juania.png.png0011.png', 'Juania.png.png0012.png',
    'Juania.png.png0013.png', 'Juania.png.png0014.png'
  ];
  const avatarFrameDuration = 100;

  // ANIMACIÓN DEL AVATAR DE LA INTRO
  if (introAvatar) {
    let frameIntro = 0;
    setInterval(() => {
      frameIntro = (frameIntro + 1) % avatarFrames.length;
      introAvatar.src = avatarFrames[frameIntro];
    }, avatarFrameDuration);
  }

  const arbol = {
    inicio: {
      texto: "¡Hola! Soy Juanita la IA. ¿Qué tenés ganas de hacer?",
      opciones: [
        { label: "texto 1", siguiente: "A1" },
        { label: "texto 2", siguiente: "inicio" }
      ]
    },
    // EJEMPLO DE NUEVOS FORMATOS:
    A1: {
    mensajes: [
     { texto: "Hola", media: { tipo: 'imagen', src: 'Juania.png.png0001.png' } },
     { texto: "Video", media: { tipo: 'video', src: 'video.mp4', autoplay: true, loop: true } },
     { texto: "Custom", media: { tipo: 'personalizado', html: '<div>Mi grilla HTML</div>' } }
   ],
     opciones: [
     { label: "Reiniciar", siguiente: "inicio" }
   ]
   }
  };

  // GUARDAR EN HISTORIAL
  function guardarEnHistorial() {
    if (chat.innerHTML.trim() === '') return;

    const vacio = historialLista.querySelector('.historial-menu__vacio');
    if (vacio) vacio.remove();

    const item = document.createElement('div');
    item.className = 'historial-item';

    const fecha = document.createElement('p');
    fecha.className = 'historial-item__fecha';
    fecha.textContent = new Date().toLocaleString();

    // Clona todo el chat actual
    const contenidoClonado = document.createElement('div');
    contenidoClonado.innerHTML = chat.innerHTML;
    // Le saca la animación del avatar para que no de lag
    contenidoClonado.querySelectorAll('.avatar').forEach(a => a.src = avatarFrames[0]);

    item.appendChild(fecha);
    item.appendChild(contenidoClonado);
    historialLista.prepend(item);
  }

  // FORMATOS ESPERADOS PARA EL BOT
  function crearGlobo(texto, lado, media = null) {
    const fila = document.createElement('div');
    fila.className = `mensaje-fila mensaje-fila--${lado}`;
    const div = document.createElement('div');
    div.className = `globo globo--${lado}`;

    if (typeof media === 'string') media = { tipo: 'imagen', src: media };

    if (media && media.tipo) {
      // CASO 1: VIDEO
      if (media.tipo === 'video') {
        div.classList.add('globo--con-media');
        const video = document.createElement('video');
        video.src = media.src;
        video.controls =!media.autoplay;
        video.autoplay = media.autoplay || false;
        video.muted = media.autoplay? true : false;
        video.loop = media.loop || false;
        video.playsInline = true;
        div.appendChild(video);
      }
      // CASO 2: CUSTOM HTML
      else if (media.tipo === 'personalizado' || media.tipo === 'custom') {
        div.classList.add('globo--custom');
        if (typeof media.html === 'function') {
          const elementoCustom = media.html();
          div.appendChild(elementoCustom);
        } else {
          div.innerHTML += media.html;
        }
      }
      // CASO 3: IMAGEN / GIF
      else {
        div.classList.add('globo--con-media');
        const img = document.createElement('img');
        img.src = media.src;
        div.appendChild(img);
      }
    }

    if (texto) {
      const p = document.createElement('p');
      p.style.margin = '0';
      p.textContent = texto;
      div.appendChild(p);
    }

    if (lado === 'izq') {
      const avatar = document.createElement('img');
      avatar.className = 'avatar';
      avatar.src = avatarFrames[0];
      avatar.alt = 'bot';
      let frameIndex = 0;
      setInterval(() => {
        frameIndex = (frameIndex + 1) % avatarFrames.length;
        avatar.src = avatarFrames[frameIndex];
      }, avatarFrameDuration);
      fila.appendChild(avatar);
      fila.appendChild(div);
    } else {
      fila.appendChild(div);
    }

    chat.appendChild(fila);
    chat.scrollTop = chat.scrollHeight;
  }

  // Muestra 1 o varios mensajes de un nodo con soporte para media
  function mostrarMensajesDeNodo(nodo, onComplete) {
    if (nodo.mensajes && Array.isArray(nodo.mensajes)) {
      nodo.mensajes.forEach((msg, index) => {
        setTimeout(() => {
          crearGlobo(msg.texto, 'izq', msg.media || msg.imagen || null);
          // Cuando es el último mensaje, avisa que terminó
          if (index === nodo.mensajes.length - 1 && typeof onComplete === 'function') {
            onComplete();
          }
        }, index * 700);
      });
      // Si no hay mensajes, igual llamar onComplete
      if (nodo.mensajes.length === 0 && typeof onComplete === 'function') {
        onComplete();
      }
    } else {
      crearGlobo(nodo.texto, 'izq', nodo.media || nodo.imagen || null);
      if (typeof onComplete === 'function') {
        // Pequeño delay para que se vea el globo antes de las opciones
        setTimeout(onComplete, 100);
      }
    }
  }

  function mostrarNodo(nodoId) {
    const nodo = arbol[nodoId];
    if (!nodo) return;
    optionsBar.innerHTML = '';

    // Función interna que dibuja las opciones
    const dibujarOpciones = () => {
      optionsBar.innerHTML = '';
      nodo.opciones.forEach(op => {
        const btn = document.createElement('button');
        btn.textContent = op.label;
        btn.addEventListener('click', () => {
          if (op.siguiente === 'inicio') {
            guardarEnHistorial();
            chat.innerHTML = '';
            optionsBar.innerHTML = '';
            if (chatWrapper) chatWrapper.classList.add('oculto');
            if (intro) intro.classList.remove('oculto');
            crearGlobo(arbol.inicio.texto, 'izq');
            mostrarNodo('inicio');
            return;
          }

          crearGlobo(op.label, 'der');
          optionsBar.innerHTML = '<span style="font-size:13px; color:#888;">Escribiendo...</span>';

          setTimeout(() => {
            const sig = arbol[op.siguiente];
            if (!sig) return;
            // Usa la nueva función que soporta múltiples mensajes
            mostrarMensajesDeNodo(sig, () => {
              mostrarNodo(op.siguiente);
            });
          }, 600);
        });
        optionsBar.appendChild(btn);
      });
    };

    // Si es el nodo inicial que ya se mostró en el load, dibujar opciones directo
    // Si viene de un click, las opciones ya se dibujan dentro del callback de mostrarMensajesDeNodo
    // Para el inicio:
    if (nodoId === 'inicio' && chat.innerHTML.trim()!== '') {
       dibujarOpciones();
    } else if (nodo.mensajes) {
      // Cuando mostrarNodo es llamado desde el timeout, necesita calcular cuánto esperar
      // para mostrar opciones después del último mensaje del array
      const delayOpciones = (nodo.mensajes.length - 1) * 700 + 300;
      setTimeout(dibujarOpciones, delayOpciones);
    } else {
      dibujarOpciones();
    }
  }

  const btnEntrar = document.getElementById('btnEntrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', () => {
      if (intro) intro.classList.add('oculto');
      if (chatWrapper) chatWrapper.classList.remove('oculto');
      chat.scrollTop = chat.scrollHeight;
    });
  }

  // Inicio
  crearGlobo(arbol.inicio.texto, 'izq');
  mostrarNodo('inicio');
});