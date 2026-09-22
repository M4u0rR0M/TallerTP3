document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const optionsBar = document.getElementById('optionsBar');
  const intro = document.getElementById('intro');
  const chatWrapper = document.getElementById('chatWrapper');
  const introAvatar = document.getElementById('introAvatar');
  const historialLista = document.getElementById('historialLista');

  const avatarFrames = [
    'Juania.png.png0001.png', 'Juania.png.png0002.png', 'Juania.png.png0003.png', 'Juania.png.png0004.png',
    'Juania.png.png0005.png', 'Juania.png.png0006.png', 'Juania.png.png0007.png', 'Juania.png.png0008.png',
    'Juania.png.png0009.png', 'Juania.png.png0010.png', 'Juania.png.png0011.png', 'Juania.png.png0012.png',
    'Juania.png.png0013.png', 'Juania.png.png0014.png'
  ];
  const avatarFrameDuration = 100;

  if (introAvatar) {
    let frameIntro = 0;
    setInterval(() => {
      frameIntro = (frameIntro + 1) % avatarFrames.length;
      introAvatar.src = avatarFrames[frameIntro];
    }, avatarFrameDuration);
  }

  // ===== SISTEMA DE FLAGS =====
  const flags = {};
  const triggersPorFlag = {
    vio_eliza: "aviso_logro_eliza",
    vio_todos: "mensaje_final_secreto"
  };
  function activarFlag(nombreFlag) {
    if (!nombreFlag) return;
    const nombres = Array.isArray(nombreFlag)? nombreFlag : [nombreFlag];
    nombres.forEach(nombre => {
      const prev = flags[nombre] || 0;
      flags[nombre] = prev + 1;
      if (prev === 0 && triggersPorFlag[nombre]) {
        const nodoTrigger = arbol[triggersPorFlag[nombre]];
        if (nodoTrigger) setTimeout(() => { mostrarMensajesDeNodo(nodoTrigger, () => {}); }, 800);
      }
    });
  }
  function resetFlags() { for (let key in flags) flags[key] = 0; }
  function cumpleCondicion(cond) {
    if (!cond ||!cond.flag) return false;
    const valor = flags[cond.flag] || 0;
    if (cond.equals!== undefined) return valor === cond.equals;
    if (cond.mayorQue!== undefined) return valor > cond.mayorQue;
    if (cond.menorQue!== undefined) return valor < cond.menorQue;
    if (cond.existe!== undefined) return cond.existe? valor > 0 : valor === 0;
    return false;
  }

  // ===== SISTEMA DE HISTORIAL NUEVO ESTILO CHATGPT =====
  let historialChats = []; // acá guardamos todos los chats como datos
  let contadorConsultas = 1;

  // Crear el visor modal una sola vez
  const visor = document.createElement('div');
  visor.id = 'visorHistorial';
  visor.className = 'visor-historial oculto';
  visor.innerHTML = `
    <div class="visor-historial__overlay"></div>
    <div class="visor-historial__ventana">
      <div class="visor-historial__header">
        <span id="visorTitulo">Consulta</span>
        <button id="visorCerrar">✕</button>
      </div>
      <div id="visorChat" class="visor-historial__chat"></div>
    </div>
  `;
  document.body.appendChild(visor);
  const visorChat = visor.querySelector('#visorChat');
  const visorTitulo = visor.querySelector('#visorTitulo');
  visor.querySelector('#visorCerrar').addEventListener('click', () => visor.classList.add('oculto'));
  visor.querySelector('.visor-historial__overlay').addEventListener('click', () => visor.classList.add('oculto'));

  function guardarEnHistorial() {
    if (chat.innerHTML.trim() === '') return;
    const vacio = historialLista.querySelector('.historial-menu__vacio');
    if (vacio) vacio.remove();

    // Guardar datos del chat (no HTML)
    const snapshot = {
      id: Date.now(),
      numero: contadorConsultas,
      fecha: new Date().toLocaleString(),
      html: chat.innerHTML // guardamos el HTML ya renderizado para recrearlo idéntico
    };
    historialChats.unshift(snapshot);
    contadorConsultas++;

    renderHistorial();
  }

  function renderHistorial() {
    historialLista.innerHTML = '';
    if (historialChats.length === 0) {
      historialLista.innerHTML = '<p class="historial-menu__vacio">Sin consultas aún</p>';
      return;
    }
    historialChats.forEach(item => {
      const div = document.createElement('div');
      div.className = 'historial-item-nuevo';
      div.innerHTML = `
        <div class="historial-item-nuevo__titulo">Consulta ${item.numero}</div>
        <div class="historial-item-nuevo__fecha">${item.fecha}</div>
      `;
      div.addEventListener('click', () => abrirHistorial(item.id));
      historialLista.appendChild(div);
    });
  }

  function abrirHistorial(id) {
    const data = historialChats.find(c => c.id === id);
    if (!data) return;
    visorTitulo.textContent = `Consulta ${data.numero}`;
    visorChat.innerHTML = data.html;
    // Congelar avatares para que no animen
    visorChat.querySelectorAll('.avatar').forEach(a => a.src = avatarFrames[0]);
    visorChat.querySelectorAll('.globo').forEach(g => g.style.animation = 'none');
    visor.classList.remove('oculto');
    visorChat.scrollTop = 0;
  }

  const arbol = {
    inicio: {
      texto: "¡Hola! Soy Juanita la IA. ¿Qué tenés ganas de hacer?",
      opciones: [
        { label: "texto 1", siguiente: "mecanismos" },
        { label: "texto 2", siguiente: "b1" },
        { label: "Revisar progreso", siguiente: "check_progreso" }
      ]
    },
    mecanismos: {
      flag: "vio_mecanismos",
      texto: "", media: { tipo: 'personalizado', html: () => {
        const step = { title: "Mecanismos de dependencia", items: [{ title: "Título 1", desc: "Descripción 1" }, { title: "Título 2", desc: "Descripción 2" }] };
        const card = document.createElement('div'); card.className = 'chat-card left eliza-mechanisms-card';
        let listHtml = (step.items || []).map(item => `<div class="mechanism-item"><h4>${item.title}</h4><p>${item.desc}</p></div>`).join('');
        card.innerHTML = `<h3>${step.title}</h3><div class="mechanisms-grid">${listHtml}</div>`;
        return card;
      }}, opciones: [{ label: "Elizacard", siguiente: "elizaCard" }]
    },
    elizaCard: {
      flag: "vio_eliza",
      texto: "", media: { tipo: 'personalizado', html: () => {
        const step = { title: "ELIZA", creator: "Creador por Weizenbaum", exampleUser: "Me siento triste", exampleBot: "¿Por qué dices que te sientes triste?", story: "Esta es la historia de ELIZA..." };
        const card = document.createElement('div'); card.className = 'chat-card left eliza-card';
        card.innerHTML = `<h3>${step.title}</h3><span class="eliza-subtitle">${step.creator}</span><div class="eliza-demo-box"><div class="demo-msg user"><b>Usuario:</b> "${step.exampleUser}"</div><div class="demo-msg bot"><b>ELIZA (1966):</b> "${step.exampleBot}"</div></div><p class="eliza-story">${step.story}</p>`;
        return card;
      }}, opciones: [{ label: "gridIconos", siguiente: "gridIconos" }]
    },
    gridIconos: { flag: ["vio_grid", "vio_todos"], texto: "", media: { tipo: 'personalizado', html: () => {
      const step = { title: "Funciones", icons: ["fa-brain", "fa-robot", "fa-comments", "fa-microchip"] };
      const card = document.createElement('div'); card.className = 'chat-card left';
      card.innerHTML = `<h3>${step.title}</h3><div class="grid-icons">${step.icons.map(icon => `<button class="icon-box"><i class="fa-solid ${icon}"></i></button>`).join('')}</div>`;
      return card;
    }}, opciones: [{ label: "statIconos", siguiente: "statIconos" }] },
    statIconos: { texto: "", media: { tipo: 'personalizado', html: () => {
      const step = { title: "Uso invisible", percentage: "85%" };
      const card = document.createElement('div'); card.className = 'chat-card left';
      card.innerHTML = `<h3>${step.title}</h3><div class="invisible-use-layout"><div class="stat-box"><span class="stat-number">${step.percentage}</span></div><div class="icons-2x2"><button class="mini-icon-btn"><img src="logo-reproductor.png"></button><button class="mini-icon-btn"><img src="logo-tarjeta.png"></button><button class="mini-icon-btn"><img src="logo-ubicacion.png"></button><button class="mini-icon-btn"><img src="logo-camara.png"></button></div></div>`;
      return card;
    }}, opciones: [{ label: "diagramaDep", siguiente: "diagramaDep" }] },
    diagramaDep: { texto: "", media: { tipo: 'personalizado', html: () => {
      const step = { title: "Diagrama de dependencia" };
      const card = document.createElement('div'); card.className = 'chat-card left dep-card-container';
      card.innerHTML = `<h3>${step.title}</h3><div class="dep-diagram"><div class="dep-column left-col"><div class="dep-text">Diseño orientado al<br>Engagement</div><div class="connector-line left-line"><span class="dot top-dot"></span><span class="dot bottom-dot"></span></div><div class="dep-text">Soledad no deseada</div></div><div class="dep-center-circle"><img src="logo-persona.png" class="dep-avatar-img"></div><div class="dep-column right-col"><div class="dep-text">Neuronas Espejo y<br>Lenguaje Natural</div><div class="connector-line right-line"><span class="dot top-dot"></span><span class="dot bottom-dot"></span></div><div class="dep-text">Falta de regulación</div></div></div>`;
      return card;
    }}, opciones: [{ label: "gridConLabels", siguiente: "gridConLabels" }] },
    gridConLabels: { texto: "", media: { tipo: 'personalizado', html: () => {
      const step = { title: "Herramientas", items: [{ img: "logo1.png", label: "Texto 1" }, { img: "logo2.png", label: "Texto 2" }, { img: "logo3.png", label: "Texto 3" }] };
      const card = document.createElement('div'); card.className = 'chat-card left';
      card.innerHTML = `<h3>${step.title}</h3><div class="grid-icons-labeled">${step.items.map(item => `<div class="labeled-icon-item"><button class="icon-box custom-logo-box"><img src="${item.img}" class="custom-logo-img"></button><span class="icon-label">${item.label}</span></div>`).join('')}</div>`;
      return card;
    }}, opciones: [{ label: "Continuar", siguiente: "inicio" }] },
    b1: { mensajes: [{ texto: "Hola", media: { tipo: 'imagen', src: 'foto.jpg' } }, { texto: "Video", media: { tipo: 'video', src: 'video.mp4', autoplay: true, loop: true } }, { texto: "Custom", media: { tipo: 'personalizado', html: '<div>Mi grilla HTML</div>' } }], opciones: [{ label: "Reiniciar", siguiente: "inicio" }] },
    //Mensajes Pop-Up de Flags
    aviso_logro_eliza: { texto: "¡Logro desbloqueado! Viste a ELIZA por primera vez.", opciones: [{ label: "Ok", siguiente: "inicio" }] },
    mensaje_final_secreto: { texto: "¡Viste todo! Gracias por explorar.", opciones: [{ label: "Reiniciar", siguiente: "inicio" }] },
    //Checkeo de Flags IF
    check_progreso: { esCondicional: true, condicion: { flag: "vio_eliza", existe: true }, siCumple: "mensaje_final_secreto", siNoCumple: "mecanismos" }
  };

  function crearGlobo(texto, lado, media = null) {
    const fila = document.createElement('div'); fila.className = `mensaje-fila mensaje-fila--${lado}`;
    const div = document.createElement('div'); div.className = `globo globo--${lado}`;
    if (typeof media === 'string') media = { tipo: 'imagen', src: media };
    if (media && media.tipo) {
      if (media.tipo === 'video') {
        div.classList.add('globo--con-media');
        const video = document.createElement('video'); video.src = media.src; video.controls =!media.autoplay; video.autoplay = media.autoplay || false; video.muted = media.autoplay? true : false; video.loop = media.loop || false; video.playsInline = true; div.appendChild(video);
      } else if (media.tipo === 'personalizado' || media.tipo === 'custom') {
        div.classList.add('globo--custom');
        if (typeof media.html === 'function') { div.appendChild(media.html()); } else { div.innerHTML += media.html; }
      } else {
        div.classList.add('globo--con-media'); const img = document.createElement('img'); img.src = media.src; div.appendChild(img);
      }
    }
    if (texto) { const p = document.createElement('p'); p.style.margin = '0'; p.textContent = texto; div.appendChild(p); }
    if (lado === 'izq') {
      const avatar = document.createElement('img'); avatar.className = 'avatar'; avatar.src = avatarFrames[0]; avatar.alt = 'bot';
      let frameIndex = 0; setInterval(() => { frameIndex = (frameIndex + 1) % avatarFrames.length; avatar.src = avatarFrames[frameIndex]; }, avatarFrameDuration);
      fila.appendChild(avatar); fila.appendChild(div);
    } else { fila.appendChild(div); }
    chat.appendChild(fila); chat.scrollTop = chat.scrollHeight;
  }

  function mostrarMensajesDeNodo(nodo, onComplete) {
    if (nodo.flag) activarFlag(nodo.flag);
    if (nodo.flags) activarFlag(nodo.flags);
    if (nodo.mensajes && Array.isArray(nodo.mensajes)) {
      nodo.mensajes.forEach((msg, index) => {
        setTimeout(() => {
          crearGlobo(msg.texto, 'izq', msg.media || msg.imagen || null);
          if (index === nodo.mensajes.length - 1 && typeof onComplete === 'function') onComplete();
        }, index * 700);
      });
      if (nodo.mensajes.length === 0 && typeof onComplete === 'function') onComplete();
    } else {
      if(nodo.texto || nodo.media) crearGlobo(nodo.texto, 'izq', nodo.media || nodo.imagen || null);
      if (typeof onComplete === 'function') setTimeout(onComplete, 100);
    }
  }

  function mostrarNodo(nodoId) {
    const nodo = arbol[nodoId]; if (!nodo) return;
    if (nodo.esCondicional) {
      const cumple = cumpleCondicion(nodo.condicion);
      const destino = cumple? nodo.siCumple : nodo.siNoCumple;
      const sig = arbol[destino];
      if (sig) mostrarMensajesDeNodo(sig, () => { mostrarNodo(destino); });
      return;
    }
    optionsBar.innerHTML = '';
    const dibujarOpciones = () => {
      optionsBar.innerHTML = '';
      (nodo.opciones || []).forEach(op => {
        const btn = document.createElement('button'); btn.textContent = op.label;
        btn.addEventListener('click', () => {
          if (op.siguiente === 'inicio') {
            guardarEnHistorial(); resetFlags();
            chat.innerHTML = ''; optionsBar.innerHTML = '';
            if (chatWrapper) chatWrapper.classList.add('oculto'); if (intro) intro.classList.remove('oculto');
            crearGlobo(arbol.inicio.texto, 'izq'); mostrarNodo('inicio'); return;
          }
          crearGlobo(op.label, 'der');
          optionsBar.innerHTML = '<span style="font-size:13px; color:#888;">Escribiendo...</span>';
          setTimeout(() => {
            const sig = arbol[op.siguiente]; if (!sig) return;
            if(sig.esCondicional) mostrarNodo(op.siguiente);
            else mostrarMensajesDeNodo(sig, () => { mostrarNodo(op.siguiente); });
          }, 600);
        });
        optionsBar.appendChild(btn);
      });
    };
    if (nodoId === 'inicio' && chat.innerHTML.trim()!== '') dibujarOpciones();
    else if (nodo.mensajes) setTimeout(dibujarOpciones, (nodo.mensajes.length - 1) * 700 + 300);
    else dibujarOpciones();
  }

  const btnEntrar = document.getElementById('btnEntrar');
  if (btnEntrar) { btnEntrar.addEventListener('click', () => { if (intro) intro.classList.add('oculto'); if (chatWrapper) chatWrapper.classList.remove('oculto'); chat.scrollTop = chat.scrollHeight; }); }
  crearGlobo(arbol.inicio.texto, 'izq'); mostrarNodo('inicio');
});    mensajes: [
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
