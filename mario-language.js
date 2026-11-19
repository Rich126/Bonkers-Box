/* Spanish copy for the Spencer Games home page and its navigation panels. */
(function () {
  'use strict';
  const descriptions = {
    dive: 'Modo fiesta: tienda pirata, escudos contra monstruos, sucesos marinos y premios extra.',
    speedway: 'Contrarreloj en solitario con las vueltas que elijas, grandes premios locales y Speedway Live en línea.',
    rallycrossx: 'Dibuja tu trazada en 11 circuitos. Juega en solitario, compite contra la IA o pasa el dispositivo entre 2–8 jugadores.',
    tanks: 'Batallas de tanques para un jugador contra la IA. Haz rebotar los proyectiles, supera ocho arenas y atrévete con una novena casi imposible.',
    trackfield: 'Corre, salta y lanza la jabalina. Tres pruebas de atletismo, hasta ocho amigos y una jornada deportiva muy peculiar.',
    supercross: 'Dibuja la trazada y la velocidad, y competid sobre peraltes, roderas, saltos y baches.',
    holeshot: 'Colócate en la valla de salida de motocross, espera a que gire el cartel y reacciona cuando caiga la valla.',
    swatthat: '¡Caos de matamoscas para 1–8 jugadores! Golpea en el momento justo y manda a volar a la mosca aterrorizada.',
    flash: '¡Toca cada luz verde! Gana quien tenga los reflejos más rápidos.',
    noodle: 'Observa la secuencia de emojis y repítela en el mismo orden.',
    zappy: '¡Toca el emoji indicado antes de que desaparezca!',
    smarty: 'Disney, animales, deportes y mucho más, con preguntas adaptadas a tu edad.',
    popcorn: '¡Adivina la película a partir de los emojis!',
    peek: 'Haz preguntas de SÍ o NO y descubre el personaje misterioso.',
    doodle: 'Dibuja lo que se pide y votad el mejor dibujo.',
    traitor: 'Asesinatos, pistas y votaciones: ¡descubrid al traidor!',
    avalanche: 'Tira los dados para subir la montaña. ¡Si sacas un 1, te deslizas hacia abajo!',
    kvp: '¡Concurso por equipos! Preguntas para niños y adultos, y oportunidades para robar puntos.',
    god: 'El ahorcado con mucho carácter: ¡adivina la palabra antes de que muera el muñeco!'
  };
  const tags = { Luck: 'Suerte', Racing: 'Carreras', Tactics: 'Táctica', Athletics: 'Atletismo', Motocross: 'Motocross', Reaction: 'Reflejos', Arcade: 'Arcade', Memory: 'Memoria', Quiz: 'Preguntas', Movies: 'Cine', 'Guess Who': '¿Quién es quién?', Drawing: 'Dibujo', Social: 'Social', Risk: 'Riesgo', Teams: 'Equipos', Words: 'Palabras', '1 Player': '1 jugador', '1 Player vs AI': '1 jugador contra la IA', '1–8 Players': '1–8 jugadores' };
  const copy = {
    '#bb-welcome .bb-guide-sub': '¿Cómo vais a jugar hoy?',
    '#bb-local-mode h2': 'Modo local',
    '#bb-local-mode p': 'Todos los juegos de Spencer Games. Jugad juntos a Treasure Dive, Speedway Slide, Rally Cross X, Holeshot King, SWAT THAT!, Flash Frenzy y toda la colección familiar.',
    '#bb-local-mode .bb-mode-pill': 'JUGAR AHORA',
    '#bb-multiplayer-mode h2': 'Modo multijugador',
    '#bb-multiplayer-mode p': 'Spencer Live. Cada persona se conecta desde su móvil para jugar en línea a preguntas, rondas creativas y carreras simultáneas de Speedway.',
    '#bb-rules-first': 'Ver la guía de juegos locales',
    '#bb-welcome .bb-guide-note': 'El modo local incluye todos los juegos actuales. El modo multijugador reúne los nuevos juegos en línea.',
    '#bb-live-shell .bb-live-sub': 'El modo multijugador en línea de Spencer Games. Coged vuestros móviles, entrad en una sala y jugad juntos.',
    '#bb-live-shell .bb-guide-card h2': '¿Cómo vais a jugar?',
    '#bb-live-shell .bb-guide-card > p': 'Usa la pantalla principal para crear la sala. Los demás se unen desde su móvil.',
    '#bb-live-host strong': 'Crear partida de fiesta',
    '#bb-live-host small': 'Crea una sala de preguntas, Creative Party o Spencer Mix.',
    '#bb-live-host b': 'CREAR SALA →',
    '#bb-live-join strong': 'Unirse a una partida',
    '#bb-live-join small': 'Introduce el código de la sala, elige tu nombre y únete desde este dispositivo.',
    '#bb-live-join b': 'UNIRSE →',
    '#bb-live-speedway small': 'Carreras simultáneas de 2–4 pilotos. Usa la pantalla principal para crear la sala y un móvil por piloto.',
    '#bb-live-speedway b': 'ABRIR SPEEDWAY LIVE →',
    '#bb-live-shell .bb-guide-card h3': 'Preparado para lo que viene',
    '#bb-live-back': '← Volver a Local / Multijugador',
    '#bb-close-help': 'Cerrar ✕',
    '#bb-help-modal .bb-guide-sub': 'Elegid un juego adecuado para el grupo y seguid las instrucciones de la pantalla.',
    '#bb-help-modal .bb-guide-card h2': 'Juegos incluidos',
    '#bb-help-modal .bb-guide-card h3': 'Para los más pequeños',
    '#bb-help-modal .bb-guide-card > p': 'Un adulto puede leer en voz alta las instrucciones largas. No hay que darse prisa salvo que el juego muestre un temporizador.',
    '#bb-close-help-bottom': 'Volver a los juegos',
    '#bb-pause-card h2': 'Juego en pausa',
    '#bb-pause-card > p': 'La partida sigue abierta justo donde la dejaste.',
    '#bb-resume-game': '▶ Continuar la partida',
    '#bb-open-guide-pause': '? Leer la guía de juegos',
    '#bb-end-to-home': '⌂ Terminar la partida y volver al inicio',
    '#bb-session-note': 'El progreso se conserva mientras esta pestaña de Safari siga abierta. Terminar la partida, cerrar la pestaña o recargarla borra la ronda actual.'
  };
  const rules = [
    'Prueba tu suerte buceando en busca de tesoros. Retírate a tiempo o arriesga todo lo encontrado si aparece un monstruo.',
    'Cada piloto disputa una contrarreloj de tres vueltas. La moto acelera sola: mantén IZQUIERDA para girar y DERECHA para controlar el derrape. La hierba y las vallas reducen la velocidad. Al final, las vueltas grabadas se reproducen juntas en una carrera final.',
    'Campaña individual de ocho misiones contra la IA y una novena arena opcional de dificultad extrema. Muévete con WASD o las flechas, apunta con el ratón, dispara con clic o Espacio y coloca minas con E. En pantalla táctil, usa el control izquierdo para moverte y el derecho para apuntar y disparar. Los proyectiles rebotan una vez en la piedra y rompen cajas. Tus propios rebotes y minas también pueden alcanzarte.',
    'Competición local de atletismo para 1–8 jugadores. Alterna los pies en los 100 metros. En salto de longitud y jabalina, toma velocidad, mantén pulsado para apuntar y suelta antes de la línea blanca. Cada jugador tiene tres intentos; la mejor marca da puntos y medallas.',
    'Dibuja la trazada y el plan de velocidad de cada piloto y competid juntos. Aprovecha los peraltes, prepara la velocidad de los saltos y pasa por encima de los baches. Incluye pedales opcionales en directo para jugar en solitario.',
    'Dibuja la trazada de un solo trazo, controlando la velocidad con el dedo. Juega en solitario, contra la IA o por turnos con 2–8 jugadores: dibujad vuestras vueltas y después competid juntos. Los coches pueden atravesarse. Incluye 11 circuitos con tierra, nieve y trazados en ocho.',
    'Elige tu nombre y el color de la moto y acércate a la valla. Cuando el cartel de 15 segundos gire de las 12 a las 3, la valla puede caer en cualquier momento. Reacciona rápido sin adelantarte a la salida.',
    'Elige 1–8 jugadores, con tres golpes cada uno. Tras la cuenta atrás, toca cuando la mosca llegue al matamoscas y lánzala lo más lejos posible. Gana la mayor distancia total. ¡Fíjate en su cara de terror!',
    'Todos reciben la misma secuencia de luces. Toca las verdes lo más rápido posible. En modo Frenzy, evita las rojas: los errores y las salidas anticipadas añaden tiempo. Gana el menor tiempo total.',
    'Observa y memoriza una secuencia de emojis y repítela en el orden correcto.',
    'Toca el objetivo correcto antes de que desaparezca. Ganan puntos los jugadores más rápidos y precisos.',
    'Concurso de opciones múltiples adaptado a la edad para que niños y adultos tengan un reto equilibrado.',
    'Descubre la película representada por los emojis y elige la respuesta correcta.',
    'Haz preguntas de sí o no para descartar personajes y descubrir la persona o el animal misterioso.',
    'Dibuja lo que se pide, pasa el dispositivo y votad el dibujo mejor o más divertido.',
    'Juego de deducción social para 3–6 personas. Lee tu información en privado, debatid las pistas y votad al sospechoso.',
    'Tira los dados para subir la montaña. Sigue tirando para avanzar más o detente y asegura un campamento. Sacar un 1 puede hacerte resbalar.',
    'Concurso por equipos. Los niños reciben preguntas adecuadas a su edad y los adultos, preguntas más difíciles. Gana el equipo con más puntos.',
    'Adivina letras y resuelve la palabra antes de acumular demasiados errores.',
    'Completa el reto en voz alta y pasa el móvil rápidamente. No lo tengas en la mano cuando explote el temporizador oculto.',
    'Lee la frase y señalad o votad a la persona que mejor encaje con ella.'
  ];
  const actions = [ ['🧠 Rondas de preguntas', 'Aciertos, rapidez, aproximaciones y apuestas.'], ['📸 Rondas de fotos', 'Fotos de los jugadores y votaciones anónimas.'], ['🎙️ Rondas de audio', 'Grabaciones de micrófono, reproducción y votaciones.'], ['🏍️ Speedway Live', 'Carreras en tiempo real para 2–4 pilotos, con códigos de sala y récords en línea.'] ];
  const originals = new WeakMap();
  let enabled = false;
  function translate(element, value, attribute) {
    if (!element) return;
    let original = originals.get(element);
    if (!original) { original = {}; originals.set(element, original); }
    const key = attribute || 'text';
    if (!(key in original)) original[key] = attribute ? element.getAttribute(attribute) : element.textContent;
    const next = enabled ? value : original[key];
    if (attribute) { if (next === null) element.removeAttribute(attribute); else element.setAttribute(attribute, next); }
    else element.textContent = next;
  }
  function apply(on) {
    enabled = !!on;
    document.documentElement.lang = enabled ? 'es' : 'en';
    for (const [selector, value] of Object.entries(copy)) document.querySelectorAll(selector).forEach(el => translate(el, value));
    document.querySelectorAll('#bb-help-modal .bb-game-rule small').forEach((el, i) => { if (rules[i]) translate(el, rules[i]); });
    document.querySelectorAll('#bb-live-shell .bb-live-action').forEach((el, i) => { if (actions[i]) { translate(el.querySelector('strong'), actions[i][0]); translate(el.querySelector('small'), actions[i][1]); } });
    const logo = document.querySelector('#bb-help-modal .bb-guide-logo');
    if (logo) { translate(logo.firstChild, 'GUÍA DE '); translate(logo.querySelector('span'), 'JUEGOS'); }
    for (const [id, label] of Object.entries({ 'bb-welcome': 'Selección de modo de Spencer Games', 'bb-help-button': 'Abrir la guía de juegos', 'bb-help-modal': 'Guía de juegos', 'bb-home-button': 'Inicio y pausa', 'bb-pause-modal': 'Menú de pausa' })) translate(document.getElementById(id), label, 'aria-label');
    document.querySelectorAll('#bb-welcome, #bb-live-shell, #bb-help-modal, #bb-pause-modal').forEach(el => el.lang = enabled ? 'es' : 'en');
    document.querySelectorAll('.bb-welcome-logo').forEach(el => translate(el, 'Spencer Games — Familia. Diversión. Competid juntos.', 'alt'));
  }
  window.SpencerMarioLanguage = {
    apply,
    game: game => ({ ...game, desc: descriptions[game.id] || game.desc, tags: game.tags.map(tag => tags[tag] || tag) }),
    endConfirmation: () => enabled ? '¿Terminar la partida y volver al inicio de Spencer Games? Se perderá el progreso actual.' : 'End the current game and return to the Spencer Games home screen? Current progress will be lost.'
  };
  document.addEventListener('DOMContentLoaded', () => { let on = false; try { on = localStorage.getItem('spencer_mario_mode_v1') === 'true'; } catch (_) {} apply(on); });
})();
