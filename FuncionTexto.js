document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const optionsBar = document.getElementById('optionsBar');
  const intro = document.getElementById('intro');
  const chatWrapper = document.getElementById('chatWrapper');

  // === CONFIGURACIÓN DEL AVATAR ANIMADO ===
  const avatarFrames = [
    'Juania.png.png0001.png', 'Juania.png.png0002.png', 'Juania.png.png0003.png', 'Juania.png.png0004.png',
    'Juania.png.png0005.png', 'Juania.png.png0006.png', 'Juania.png.png0007.png', 'Juania.png.png0008.png',
    'Juania.png.png0009.png', 'Juania.png.png0010.png', 'Juania.png.png0011.png', 'Juania.png.png0012.png',
    'Juania.png.png0013.png', 'Juania.png.png0014.png'
  ];
  const avatarFrameDuration = 100;

  const arbol = {
    inicio: {
      texto: "Hola! Soy el bot de guías. ¿Qué querés hacer?",
      opciones: [
        { label: "Ver guías de Hollow Knight", siguiente: "hk" },
        { label: "Ver guías de Stellar Blade", siguiente: "sb" },
        { label: "🧪 Probar imágenes / gif / video", siguiente: "test" }
      ]
    },
    hk: {
      texto: "Perfecto, tengo 2 guías de Hollow Knight disponibles.",
      opciones: [
        { label: "Guía 100% sin niebla", siguiente: "hk_100" },
        { label: "Volver al inicio", siguiente: "inicio" }
      ]
    },
    hk_100: {
      texto: "La guía de NO niebla NO fantasma dura 4 horas. ¿La abrimos?",
      imagen: "Ppal art meme.jpg",
      opciones: [
        { label: "Sí, abrir guía", siguiente: "final_si" },
        { label: "No, mejor Stellar Blade", siguiente: "sb" }
      ]
    },
    sb: {
      texto: "Stellar Blade tiene 5 guías. La más popular es la del traje raro.",
      opciones: [
        { label: "Ver esa guía", siguiente: "final_si" },
        { label: "Volver al inicio", siguiente: "inicio" }
      ]
    },
    final_si: {
      texto: "¡Listo! Acá se abriría la guía.",
      opciones: [
        { label: "Reiniciar chat", siguiente: "inicio" },
        { label: "Hacer Pruebas", siguiente: "test" }
      ]
    },
    test: {
      texto: "Nodo de pruebas. Elegí que querés ver:",
      opciones: [
        { label: "Probar IMAGEN", siguiente: "test_img" },
        { label: "Probar GIF", siguiente: "test_gif" },
        { label: "Probar VIDEO", siguiente: "test_video" },
        { label: "Volver al inicio", siguiente: "inicio" }
      ]
    },
    test_img: {
      texto: "Esto es una imagen normal, el globo se adapta al ancho",
      media: { tipo: 'imagen', src: 'Ppal art meme.jpg' },
      opciones: [
        { label: "Probar GIF ahora", siguiente: "test_gif" },
        { label: "Volver a Test", siguiente: "test" },
        { label: "Reiniciar chat", siguiente: "inicio" }
      ]
    },
    test_gif: {
      texto: "Esto es un GIF, entra como imagen",
      media: { tipo: 'imagen', src: 'gethomered.gif' },
      opciones: [
        { label: "Probar VIDEO ahora", siguiente: "test_video" },
        { label: "Volver a Test", siguiente: "test" },
        { label: "Reiniciar chat", siguiente: "inicio" }
      ]
    },
    test_video: {
      texto: "Esto es un VIDEO mp4 con controles",
      media: { tipo: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', autoplay: false, loop: false },
      opciones: [
        { label: "Probar VIDEO autoplay loop", siguiente: "test_video_auto" },
        { label: "Volver a Test", siguiente: "test" },
        { label: "Reiniciar chat", siguiente: "inicio" }
      ]
    },
    test_video_auto: {
      texto: "Video en loop tipo WhatsApp",
      media: { tipo: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', autoplay: true, loop: true },
      opciones: [
        { label: "Volver a Test", siguiente: "test" },
        { label: "Reiniciar chat", siguiente: "inicio" }
      ]
    }
  };

  function crearGlobo(texto, lado, media = null) {
    const fila = document.createElement('div');
    fila.className = `mensaje-fila mensaje-fila--${lado}`;

    const div = document.createElement('div');
    div.className = `globo globo--${lado}`;

    if (typeof media === 'string') {
      media = { tipo: 'imagen', src: media };
    }
    if (media && media.src) {
      div.classList.add('globo--con-media');
      if (media.tipo === 'video') {
        const video = document.createElement('video');
        video.src = media.src;
        video.controls =!media.autoplay;
        video.autoplay = media.autoplay || false;
        video.muted = media.autoplay? true : false;
        video.loop = media.loop || false;
        video.playsInline = true;
        div.appendChild(video);
      } else {
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

  function mostrarNodo(nodoId) {
    const nodo = arbol[nodoId];
    optionsBar.innerHTML = '';

    nodo.opciones.forEach(op => {
      const btn = document.createElement('button');
      btn.textContent = op.label;
      btn.addEventListener('click', () => {
        if (op.siguiente === 'inicio') {
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
          const mediaFinal = sig.media || sig.imagen || null;
          crearGlobo(sig.texto, 'izq', mediaFinal);
          mostrarNodo(op.siguiente);
        }, 600);
      });
      optionsBar.appendChild(btn);
    });
  }

  const btnEntrar = document.getElementById('btnEntrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', () => {
      if (intro) intro.classList.add('oculto');
      if (chatWrapper) chatWrapper.classList.remove('oculto');
      chat.scrollTop = chat.scrollHeight;
    });
  }

  crearGlobo(arbol.inicio.texto, 'izq');
  mostrarNodo('inicio');
});