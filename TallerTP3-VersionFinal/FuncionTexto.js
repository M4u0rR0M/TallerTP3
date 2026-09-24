document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const optionsBar = document.getElementById('optionsBar');
  const intro = document.getElementById('intro');
  const chatWrapper = document.getElementById('chatWrapper');
  const introAvatar = document.getElementById('introAvatar');
  const historialLista = document.getElementById('historialLista');
  const historialMenu = document.querySelector('.historial-menu');
// #1D2D4E
// #0A192F
// #8C9EFF
// #6C5CE7
  const avatarFrames = [
    'Juania.png.png0001.png', 'Juania.png.png0002.png', 'Juania.png.png0003.png', 'Juania.png.png0004.png',
    'Juania.png.png0005.png', 'Juania.png.png0006.png', 'Juania.png.png0007.png', 'Juania.png.png0008.png',
    'Juania.png.png0009.png', 'Juania.png.png0010.png', 'Juania.png.png0011.png', 'Juania.png.png0012.png',
    'Juania.png.png0013.png', 'Juania.png.png0014.png'
  ];
  const avatarFrameDuration = 100;

const visorSubpagina = document.createElement('div');
  visorSubpagina.id = 'visorSubpagina';
  visorSubpagina.className = 'visor-subpagina oculto';
  visorSubpagina.innerHTML = `
    <button id="btnVolverSubpagina" class="btn-flecha-volver" aria-label="Volver">
      <i class="fa-solid fa-arrow-left"></i>
    </button>
    <div id="subpaginaBody" class="subpagina-body"></div>
  `;
  document.body.appendChild(visorSubpagina);

  const btnVolverSubpagina = visorSubpagina.querySelector('#btnVolverSubpagina');
  const subpaginaBody = visorSubpagina.querySelector('#subpaginaBody');

  btnVolverSubpagina.addEventListener('click', () => {
    visorSubpagina.classList.add('oculto');
    subpaginaBody.innerHTML = '';
  });

  window.abrirSubpagina = function(htmlContent) {
    subpaginaBody.innerHTML = htmlContent;
    visorSubpagina.classList.remove('oculto');
    visorSubpagina.scrollTop = 0;
  };

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
      texto: "¡Hola! soy ElizIA, tu asistente en este recorrido. ¿Qué tanto usas la Inteligencia artificial?",
      opciones: [
        { label: "Muy poco", siguiente: "usoInvisible" },
        { label: "La uso bastante", siguiente: "usoExcesivo" }
      ]
    },
    mecanismos: {
      flag: "vio_mecanismos",
      mensajes: [
        { 
          texto: "Los chatbots y entornos de IA están diseñados con patrones que buscan capturar nuestra atención. Aquí te muestro los principales mecanismos que pueden generar dependencia:" 
        },
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              const step = { 
                title: "Mecanismos de dependencia", 
                items: [
                  { title: "Diseño de engagement", desc: "Respuestas inmediatas y personalizadas que activan circuitos de recompensa." }, 
                  { title: "Antropomorfización", desc: "Tendencia a atribuir emociones e intención humana al chatbot." }
                ] 
              };
              const card = document.createElement('div'); 
              card.className = 'chat-card left eliza-mechanisms-card';
              let listHtml = (step.items || []).map(item => `<div class="mechanism-item"><h4>${item.title}</h4><p>${item.desc}</p></div>`).join('');
              card.innerHTML = `<h3>${step.title}</h3><div class="mechanisms-grid">${listHtml}</div>`;
              return card;
            }
          } 
        }
      ], 
      opciones: [{ label: "Elizacard", siguiente: "elizaCard" }]
    },


// ===== USO INVISIBLE =====
    usoInvisible: {
      flag: "vio_uso_invisible",
      mensajes: [
        { texto: "Aunque no te des cuenta, convivimos con la IA en nuestro día a día sin interactuar directamente con un chatbot. A esto lo llamamos Uso Invisible." },
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              const card = document.createElement('div');
              card.className = 'chat-card left card-uso-invisible-preview';
              card.innerHTML = `
                <div class="invisible-card-header">Uso invisible</div>
                <div class="invisible-card-columns">
                  <!-- Columna 1: Cerebro + Porcentaje -->
                  <div class="col-brain">
                    <img src="cerebro.png" alt="Cerebro 80%" class="brain-img">
                    <span class="brain-percentage">80%</span>
                  </div>
                  <!-- Columna 2: Grilla de 4 logos (2x2) -->
                  <div class="col-apps-grid">
                    <div class="app-box"><img src="logo-reproductor.png" alt="Play"></div>
                    <div class="app-box"><img src="logo-tarjeta.png" alt="Tarjeta"></div>
                    <div class="app-box"><img src="logo-ubicacion.png" alt="Ubicación"></div>
                    <div class="app-box"><img src="logo-camara.png" alt="Cámara"></div>
                  </div>
                </div>
                <div class="invisible-card-footer">Toca para interactuar</div>
              `;

              card.addEventListener('click', () => {
                if (window.abrirSubpagina) {
                  window.abrirSubpagina(`
                    <div class="subpagina-invisible">
                      <div class="subpagina-header-center">
                        <img src="cerebro.png" alt="Cerebro 80%" class="brain-large-img">
                      </div>
                      <div class="subpagina-items-list">
                        <div class="item-row">
                          <img src="logo-reproductor.png" class="row-icon">
                          <div class="row-text">
                            <h4>Entretenimiento y Redes</h4>
                            <p>Algoritmos de recomendación en TikTok, Spotify, YouTube o Netflix.</p>
                          </div>
                        </div>
                        <div class="item-row">
                          <img src="logo-tarjeta.png" class="row-icon">
                          <div class="row-text">
                            <h4>Finanzas y Bancos</h4>
                            <p>Sistemas antifraude analizan compras con tarjeta en tiempo real.</p>
                          </div>
                        </div>
                        <div class="item-row">
                          <img src="logo-ubicacion.png" class="row-icon">
                          <div class="row-text">
                            <h4>Geolocalización</h4>
                            <p>Waze y Google Maps predicen el tráfico mediante modelos predictivos.</p>
                          </div>
                        </div>
                        <div class="item-row">
                          <img src="logo-camara.png" class="row-icon">
                          <div class="row-text">
                            <h4>Fotografía</h4>
                            <p>Procesamiento de luz, enfoque y encuadre en smartphones mediante redes neuronales.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  `);
                }
              });

              return card;
            }
          } 
        }
      ],
      opciones: [{ label: "Ver Uso Consciente", siguiente: "usoConsciente" }]
    },

    // ===== USO CONSCIENTE =====
    usoConsciente: {
      flag: "vio_uso_consciente",
      mensajes: [
        { texto: "Por otro lado está el Uso Consciente: cuando las personas eligen de forma activa interactuar con herramientas de IA generativa." },
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              const card = document.createElement('div');
              card.className = 'chat-card left card-uso-consciente-preview';
              card.innerHTML = `
                <div class="consciente-preview-body">
                  <img src="logo-personita-violeta.png" alt="Persona" class="consciente-icon-img">
                  <h3>Uso consciente</h3>
                  <span class="preview-footer-text">Toca para interactuar</span>
                </div>
              `;

              card.addEventListener('click', () => {
                abrirSubpagina(`
                  <div class="subpagina-consciente">
                    <!-- Bloque 1: 1 de cada 6 -->
                    <div class="grupo-estadistica">
                      <div class="grid-personitas">
                        ${Array(60).fill(0).map((_, i) => `<img src="${i < 10 ? 'logo-personita-violeta.png' : 'logo-personita-gris.png'}" class="icon-personita">`).join('')}
                      </div>
                      <div class="caja-texto-estadistica">
                        <p><strong class="highlight-purple">1 de cada 6 personas</strong> en el mundo (1.500M - 2.000M) interactúa con herramientas de IA generativa (chatbots, generadores de imágenes, asistentes de voz) de forma habitual u ocasional.</p>
                      </div>
                    </div>

                    <!-- Bloque 2: 120 millones -->
                    <div class="grupo-estadistica">
                      <div class="grid-personitas">
                        ${Array(60).fill(0).map((_, i) => `<img src="${i < 8 ? 'logo-personita-violeta.png' : 'logo-personita-gris.png'}" class="icon-personita">`).join('')}
                      </div>
                      <div class="caja-texto-estadistica">
                        <p>De esa totalidad, <strong class="highlight-purple">120 millones</strong> de personas usan ChatGPT o Gemini <strong class="highlight-purple">todos los días</strong>.</p>
                      </div>
                    </div>

                    <!-- Bloque 3: 50% trabajadores -->
                    <div class="grupo-estadistica">
                      <div class="grid-personitas">
                        ${Array(45).fill(0).map((_, i) => `<img src="${i < 23 ? 'logo-personita-violeta.png' : 'logo-personita-gris.png'}" class="icon-personita">`).join('')}
                      </div>
                      <div class="caja-texto-estadistica">
                        <p>El 50% de los trabajadores digitalizados emplean IA <strong class="highlight-purple">en sus tareas</strong>. El 78% utiliza sus propias <strong class="highlight-purple">cuentas personales</strong>.</p>
                      </div>
                    </div>
                  </div>
                `);
              });

              return card;
            }
          } 
        }
      ],
      opciones: [{ label: "Continuar a dependencia emocional", siguiente: "preguntaDependencia" }]
    },


// ===== SECCIÓN: USO EXCESIVO =====
    usoExcesivo: {
      flag: "vio_uso_excesivo",
      mensajes: [
        {
        texto: "El uso excesivo y la sobreinteracción con la Inteligencia Artificial pueden generar consecuencias significativas tanto en el bienestar personal como en la capacidad cognitiva de las personas. Dividiéndose principalmente en dos áreas:"
      },
        // Burbuja 1: En Salud Mental
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              const card = document.createElement('div');
              card.className = 'chat-card left card-consecuencias';
              card.innerHTML = `
                <div class="card-consecuencias__titulo">En Salud Mental</div>
                <div class="card-consecuencias__grid grid-3">
                  <div class="consecuencia-item">
                    <div class="consecuencia-icon">
                      <img src="salud-1.png" alt="Desconexión">
                    </div>
                    <span>Desconexión de la Realidad</span>
                  </div>
                  <div class="consecuencia-item">
                    <div class="consecuencia-icon">
                      <img src="salud-2.png" alt="Soledad">
                    </div>
                    <span>Profundización de la Soledad</span>
                  </div>
                  <div class="consecuencia-item">
                    <div class="consecuencia-icon">
                      <img src="salud-3.png" alt="Ansiedad">
                    </div>
                    <span>Ansiedad por Validación Falsa</span>
                  </div>
                </div>
              `;
              return card;
            }
          } 
        },
        // Burbuja 2: En Salud Cognitiva
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              const card = document.createElement('div');
              card.className = 'chat-card left card-consecuencias';
              card.innerHTML = `
                <div class="card-consecuencias__titulo">En Salud Cognitiva</div>
                <div class="card-consecuencias__grid grid-2">
                  <div class="consecuencia-item">
                    <div class="consecuencia-icon">
                      <img src="cognitivo-1.png" alt="Atrofia">
                    </div>
                    <span>Atrofia del Pensamiento Crítico</span>
                  </div>
                  <div class="consecuencia-item">
                    <div class="consecuencia-icon">
                      <img src="cognitivo-2.png" alt="Autonomía">
                    </div>
                    <span>Pérdida de Autonomía</span>
                  </div>
                </div>
              `;
              return card;
            }
          } 
        }
      ],
      // Botón para redirigir a la sección de dependencia emocional
      opciones: [
        { label: "Ver Dependencia Emocional", siguiente: "preguntaDependencia" }
      ]
    },



// ===== PREGUNTA INICIAL DE DEPENDENCIA =====
    preguntaDependencia: {
      mensajes: [
        { texto: "Cuando necesitás desahogarte, resolver una duda o tomar una decisión personal... ¿a quién acudís primero?" }
      ],
      opciones: [
        { label: "A un amigo / familiar", siguiente: "resultadoDependencia" },
        { label: "A la IA / al buscador", siguiente: "resultadoDependencia" }
      ]
    },

    // ===== MÓDULO DE DEPENDENCIA EMOCIONAL Y AFECTIVA =====
    resultadoDependencia: {
      mensajes: [
        { texto: "Independientemente de tu elección, la IA influye en nuestra dinámica social y emocional de formas muy concretas:" },
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              // Gráfico 1: Conceptos clave (Apego parasocial, Refugio mudo, etc.)
              const card = document.createElement('div');
              card.className = 'chat-card left card-dependencia-conceptos';
              card.innerHTML = `
                <div class="card-title-header">Dependencia emocional y afectiva</div>
                <div class="grid-2x2-conceptos">
                  <div class="concepto-box">
                    <img src="logo-amor.png" alt="Apego parasocial" class="concepto-icon">
                    <span>Apego parasocial</span>
                  </div>
                  <div class="concepto-box">
                    <img src="logo-candado.png" alt="Refugio mudo" class="concepto-icon">
                    <span>"Refugio mudo"</span>
                  </div>
                  <div class="concepto-box">
                    <img src="logo-red.png" alt="Efecto cámara de eco" class="concepto-icon">
                    <span>Efecto cámara de eco</span>
                  </div>
                  <div class="concepto-box">
                    <img src="logo-circulo.png" alt="Fenómeno clínico" class="concepto-icon">
                    <span>Fenómeno clínico</span>
                  </div>
                </div>
              `;
              return card;
            }
          } 
        },
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              // Gráfico 2: "Lo que genera dependencia" (Interactiva)
              const card = document.createElement('div');
              card.className = 'chat-card left card-genera-dependencia-preview';
              card.innerHTML = `
                <div class="card-title-header">Lo que genera dependencia</div>
                <div class="diagrama-preview-center">
                  <div class="lineas-conectoras-bg"></div>
                  <div class="persona-circle">
                    <img src="logo-persona.png" alt="Usuario con celular" class="persona-icon">
                  </div>
                </div>
                <div class="invisible-card-footer">Toca para interactuar</div>
              `;

card.addEventListener('click', () => {
  if (window.abrirSubpagina) {
    window.abrirSubpagina(`
      <div class="subpagina-dependencia">
        <p class="subpagina-intro-text">
          La IA está diseñada para simular empatía mediante respuestas programadas que el cerebro humano interpreta mediante la sensación de estar siendo escuchado.
        </p>
        
        <div class="diagrama-subpagina-container">
          <!-- SVG con las 4 líneas de conexión -->
          <svg class="lineas-conexion-svg" viewBox="0 0 500 360">
            <!-- Línea Top-Left (Atribución de humanidad) -->
            <path id="line-tl" class="linea-conexion" d="M 130 50 L 180 50 L 180 180 L 250 180" />
            <!-- Línea Top-Right (Disponibilidad total) -->
            <path id="line-tr" class="linea-conexion" d="M 370 50 L 320 50 L 320 180 L 250 180" />
            <!-- Línea Bottom-Left (Percepción de validación) -->
            <path id="line-bl" class="linea-conexion" d="M 130 310 L 180 310 L 180 180 L 250 180" />
            <!-- Línea Bottom-Right (Desconexión de la realidad) -->
            <path id="line-br" class="linea-conexion" d="M 370 310 L 320 310 L 320 180 L 250 180" />
          </svg>

          <!-- Nodo central -->
          <div class="nodo-center">
            <img src="logo-persona.png" alt="Persona" class="nodo-center-icon">
          </div>

          <!-- 4 Nodos periféricos con identificadores para el hover -->
          <div class="caja-nodo top-left" data-line="line-tl">
            <span>Atribución de humanidad</span>
          </div>
          <div class="caja-nodo top-right" data-line="line-tr">
            <span>Disponibilidad total para interactuar</span>
          </div>
          <div class="caja-nodo bottom-left" data-line="line-bl">
            <span>Percepción de validación</span>
          </div>
          <div class="caja-nodo bottom-right" data-line="line-br">
            <span>Desconexión de la realidad</span>
          </div>
        </div>
      </div>
    `);

    // Script interactivo para activar las líneas al hacer hover
    const tarjetas = document.querySelectorAll('.caja-nodo');
    tarjetas.forEach(tarjeta => {
      tarjeta.addEventListener('mouseenter', () => {
        const lineId = tarjeta.getAttribute('data-line');
        const linea = document.getElementById(lineId);
        if (linea) linea.classList.add('activa');
      });
      tarjeta.addEventListener('mouseleave', () => {
        const lineId = tarjeta.getAttribute('data-line');
        const linea = document.getElementById(lineId);
        if (linea) linea.classList.remove('activa');
      });
    });
  }
});

              return card;
            }
          } 
        }
      ],
      opciones: [
        { label: "Continuar al efecto ELIZA", siguiente: "efectoEliza" }
      ]
    },


// ===== EFECTO ELIZA =====
    efectoEliza: {
      flag: "vio_efecto_eliza",
      mensajes: [
        // Burbuja 1: Definición del efecto ELIZA
        { 
          texto: "El **efecto ELIZA** es la tendencia psicológica inconsciente a **atribuir cualidades humanas** (comprensión, empatía, intenciones o emociones) a sistemas informáticos y de inteligencia artificial." 
        },
        // Burbuja 2: Experimento de 1966
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              const card = document.createElement('div');
              card.className = 'chat-card left card-eliza-experimento';
              card.innerHTML = `
                <div class="eliza-card-header">EXPERIMENTO DEL 1966</div>
                <div class="eliza-card-subtitle">Joseph Weizenbaum (MIT)</div>
                
                <div class="eliza-terminal-box">
                  <p class="terminal-user"><span class="user-label">Usuario:</span> "Me siento muy triste por mi mamá."</p>
                  <p class="terminal-bot"><span class="bot-label">ELIZA (1966):</span> "Cuéntame más sobre tu mamá."</p>
                </div>
                
                <p class="eliza-card-footer-text">
                  A pesar de usar solo reglas simples de sustitución de texto, los usuarios volcaban sus emociones más íntimas.
                </p>
              `;
              return card;
            }
          } 
        },
        // Burbuja 3: ¿Por qué caemos en esta ilusión?
        { 
          texto: "", 
          media: { 
            tipo: 'personalizado', 
            html: () => {
              const card = document.createElement('div');
              card.className = 'chat-card left card-eliza-causas';
              card.innerHTML = `
                <div class="eliza-card-title">¿Por qué caemos en esta ilusión?</div>
                <div class="eliza-causas-list">
                  <div class="causa-box">
                    <h4>Antropomorfismo innato</h4>
                    <p>Buscamos patrones humanos en todas partes.</p>
                  </div>
                  <div class="causa-box">
                    <h4>Proyección de significado</h4>
                    <p>El usuario completa los vacíos del bot.</p>
                  </div>
                  <div class="causa-box">
                    <h4>Sesgo de confirmación</h4>
                    <p>Interpretamos respuestas ambiguas como sabiduría.</p>
                  </div>
                </div>
              `;
              return card;
            }
          } 
        }
      ],
      opciones: [
        { label: "Continuar", siguiente: "inicio" }
      ]
    },

    prueba: {
      texto: "aaaaaaaaaaaaaaaa",
      flag: "vio_prueba",
      texto: "bien jdksjdklsndksjd", media: { tipo: 'personalizado', html: () => {
        const step = { title: "Mecanismos de dependencia", items: [{ title: "bla bla", desc: "bla bla bla" }, { title: "Título 2", desc: "Descripción 2" }] };
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
  if (btnEntrar) { btnEntrar.addEventListener('click', () => { if (intro) intro.classList.add('oculto'); if (chatWrapper) chatWrapper.classList.remove('oculto'); if (historialMenu) historialMenu.classList.remove('oculto'); chat.scrollTop = chat.scrollHeight; }); }
  crearGlobo(arbol.inicio.texto, 'izq'); mostrarNodo('inicio');
  if (intro &&!intro.classList.contains('oculto')) { // <-- NUEVO
    if (historialMenu) historialMenu.classList.add('oculto');
  }
});