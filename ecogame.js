/* =========================================================
   ECOGAME - SISTEMA COMUNE
   Lingua + Account + Green Points + Supabase

   Usato da tutti i giochi EcoGame.

   IMPORTANTE:
   1. supabase-js deve essere caricato PRIMA di questo file.
   2. Nel browser usare SOLO la Publishable/anon key.
   3. La service_role key NON deve MAI essere inserita qui.
   ========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://zrxssuigzisgpcdesjvc.supabase.co";

/*
   SOSTITUISCI questa chiave con la Publishable Key
   ATTUALE del progetto Supabase.

   NON usare service_role.
*/
const SUPABASE_KEY =
    "INSERISCI_QUI_LA_TUA_PUBLISHABLE_KEY";


let supabaseClient = null;


/* =========================================================
   INIZIALIZZAZIONE SUPABASE
========================================================= */

function inizializzaSupabase() {

    if (typeof window === "undefined") {

        console.error(
            "EcoGame: window non disponibile."
        );

        return false;
    }


    if (typeof window.supabase === "undefined") {

        console.error(
            "EcoGame: supabase-js non è stato caricato."
        );

        console.error(
            "EcoGame: carica supabase-js prima di ecogame.js."
        );

        return false;
    }


    if (
        !SUPABASE_KEY ||
        SUPABASE_KEY ===
        "INSERISCI_QUI_LA_TUA_PUBLISHABLE_KEY"
    ) {

        console.error(
            "EcoGame: manca la Publishable Key di Supabase."
        );

        return false;
    }


    try {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        console.log(
            "EcoGame: Supabase inizializzato."
        );


        return true;

    } catch (errore) {

        console.error(
            "EcoGame: errore inizializzazione Supabase:",
            errore
        );

        supabaseClient = null;

        return false;
    }
}


/* =========================================================
   LINGUA
========================================================= */

function getLingua() {

    return (
        localStorage.getItem(
            "ecoGameLingua"
        ) || "it"
    );
}


function salvaLingua(lingua) {

    if (
        ![
            "it",
            "en",
            "fi"
        ].includes(lingua)
    ) {

        lingua = "it";
    }


    localStorage.setItem(
        "ecoGameLingua",
        lingua
    );


    if (document.documentElement) {

        document.documentElement.lang =
            lingua;
    }


    window.dispatchEvent(
        new CustomEvent(
            "ecoGameLinguaCambiata",
            {
                detail: {
                    lingua: lingua
                }
            }
        )
    );


    return lingua;
}


function inizializzaLingua() {

    const lingua =
        getLingua();


    if (document.documentElement) {

        document.documentElement.lang =
            lingua;
    }


    const selettore =
        document.getElementById(
            "lingua"
        );


    if (selettore) {

        selettore.value =
            lingua;
    }


    return lingua;
}


function cambiaLinguaComune(lingua) {

    return salvaLingua(
        lingua
    );
}


/* =========================================================
   CONTROLLO SUPABASE
========================================================= */

function supabaseDisponibile() {

    if (!supabaseClient) {

        inizializzaSupabase();
    }


    return !!supabaseClient;
}


/* =========================================================
   ACCOUNT
========================================================= */

async function getEcoGameUser() {

    if (!supabaseDisponibile()) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error) {

            console.error(
                "EcoGame: errore recupero utente:",
                error
            );

            return null;
        }


        if (
            !data ||
            !data.user
        ) {

            console.warn(
                "EcoGame: nessun utente autenticato."
            );

            return null;
        }


        console.log(
            "EcoGame: utente autenticato:",
            data.user.id
        );


        return data.user;

    } catch (errore) {

        console.error(
            "EcoGame: errore account:",
            errore
        );

        return null;
    }
}


/* =========================================================
   SESSIONE
========================================================= */

async function getEcoGameSession() {

    if (!supabaseDisponibile()) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();


        if (error) {

            console.error(
                "EcoGame: errore recupero sessione:",
                error
            );

            return null;
        }


        return data?.session || null;

    } catch (errore) {

        console.error(
            "EcoGame: errore sessione:",
            errore
        );

        return null;
    }
}


/* =========================================================
   PROFILO ACCOUNT
========================================================= */

async function getEcoGameProfile() {

    const user =
        await getEcoGameUser();


    if (!user) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id, green_points, level"
                )
                .eq(
                    "id",
                    user.id
                )
                .single();


        if (error) {

            console.error(
                "EcoGame: errore recupero profilo:",
                error
            );

            return null;
        }


        if (!data) {

            console.error(
                "EcoGame: profilo non trovato:",
                user.id
            );

            return null;
        }


        return data;

    } catch (errore) {

        console.error(
            "EcoGame: errore profilo:",
            errore
        );

        return null;
    }
}


/* =========================================================
   GREEN POINTS ATTUALI
========================================================= */

async function getGreenPoints() {

    const profilo =
        await getEcoGameProfile();


    if (!profilo) {

        return {

            success: false,

            points: 0,

            level: 1,

            error:
                "Profilo non disponibile"
        };
    }


    return {

        success: true,

        points:
            Number(
                profilo.green_points
            ) || 0,

        level:
            Number(
                profilo.level
            ) || 1
    };
}


/* =========================================================
   AGGIUNGI GREEN POINTS
========================================================= */

async function aggiungiGreenPoints(punti) {

    punti =
        Math.floor(
            Number(punti)
        );


    if (
        !Number.isFinite(punti) ||
        punti <= 0
    ) {

        return {

            success: false,

            pointsAdded: 0,

            error:
                "Punti non validi"
        };
    }


    if (!supabaseDisponibile()) {

        return {

            success: false,

            pointsAdded: 0,

            error:
                "Supabase non disponibile"
        };
    }


    const user =
        await getEcoGameUser();


    if (!user) {

        return {

            success: false,

            pointsAdded: 0,

            error:
                "Utente non autenticato"
        };
    }


    try {

        /*
           Leggiamo il valore attuale dal profilo.
        */

        const {
            data: profilo,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "green_points, level"
                )
                .eq(
                    "id",
                    user.id
                )
                .single();


        if (profileError) {

            console.error(
                "EcoGame: errore lettura profilo:",
                profileError
            );

            return {

                success: false,

                pointsAdded: 0,

                error:
                    profileError
            };
        }


        if (!profilo) {

            return {

                success: false,

                pointsAdded: 0,

                error:
                    "Profilo non trovato"
            };
        }


        const puntiAttuali =
            Number(
                profilo.green_points
            ) || 0;


        const nuoviPunti =
            puntiAttuali + punti;


        const nuovoLivello =
            Math.floor(
                nuoviPunti / 100
            ) + 1;


        /*
           Salviamo i nuovi GP nel profilo
           collegato all'ID dell'account.
        */

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .update({

                    green_points:
                        nuoviPunti,

                    level:
                        nuovoLivello

                })
                .eq(
                    "id",
                    user.id
                )
                .select(
                    "id, green_points, level"
                )
                .single();


        if (error) {

            console.error(
                "EcoGame: ERRORE SALVATAGGIO GP:",
                error
            );

            return {

                success: false,

                pointsAdded: 0,

                error:
                    error
            };
        }


        const totale =
            Number(
                data.green_points
            ) || 0;


        const livello =
            Number(
                data.level
            ) || 1;


        console.log(
            "🌱 EcoGame: GP aggiunti:",
            punti
        );


        console.log(
            "🌱 EcoGame: GP totali account:",
            totale
        );


        console.log(
            "⭐ EcoGame: livello:",
            livello
        );


        /*
           Aggiorna automaticamente gli elementi
           eventualmente presenti nella pagina.
        */

        aggiornaGreenPointsPagina(
            totale
        );


        return {

            success: true,

            pointsAdded:
                punti,

            previousPoints:
                puntiAttuali,

            totalPoints:
                totale,

            level:
                livello
        };

    } catch (errore) {

        console.error(
            "EcoGame: errore aggiunta GP:",
            errore
        );

        return {

            success: false,

            pointsAdded: 0,

            error:
                errore
        };
    }
}


/* =========================================================
   ACCREDITO UNA SOLA VOLTA PER GIOCO
========================================================= */

async function accreditaGreenPointsUnaVolta(
    gameId,
    punti
) {

    if (!gameId) {

        return {

            success: false,

            pointsAdded: 0,

            error:
                "gameId mancante"
        };
    }


    punti =
        Math.floor(
            Number(punti)
        );


    if (
        !Number.isFinite(punti) ||
        punti <= 0
    ) {

        return {

            success: false,

            pointsAdded: 0,

            error:
                "Punti non validi"
        };
    }


    /*
       Evita doppio accredito durante la stessa
       sessione del browser.

       NON viene usato per collegare i GP
       all'account: quello viene fatto da Supabase.
    */

    const chiave =
        "ecoGameGP_" +
        gameId;


    if (
        sessionStorage.getItem(
            chiave
        ) === "true"
    ) {

        console.log(
            "EcoGame: GP già accreditati per:",
            gameId
        );


        return {

            success: false,

            alreadyAdded: true,

            pointsAdded: 0,

            error:
                "Green Points già accreditati"
        };
    }


    const risultato =
        await aggiungiGreenPoints(
            punti
        );


    if (
        risultato &&
        risultato.success
    ) {

        sessionStorage.setItem(
            chiave,
            "true"
        );
    }


    return risultato;
}


/* =========================================================
   ESTINZIONE
========================================================= */

/*
   Regola richiesta:

   50 GP di base
   +
   10 GP per ogni risposta esatta
*/

function calcolaGreenPointsEstinzione(
    risposteEsatte
) {

    risposteEsatte =
        Number(
            risposteEsatte
        );


    if (
        !Number.isFinite(
            risposteEsatte
        )
    ) {

        risposteEsatte = 0;
    }


    risposteEsatte =
        Math.max(
            0,
            Math.floor(
                risposteEsatte
            )
        );


    return (
        50 +
        (
            risposteEsatte * 10
        )
    );
}


/*
   Accredita i GP di Estinzione
   collegandoli all'account.
*/

async function assegnaGreenPointsEstinzione(
    risposteEsatte
) {

    const greenPoints =
        calcolaGreenPointsEstinzione(
            risposteEsatte
        );


    console.log(
        "🦁 Estinzione - risposte esatte:",
        risposteEsatte
    );


    console.log(
        "🌱 Estinzione - GP da assegnare:",
        greenPoints
    );


    const risultato =
        await accreditaGreenPointsUnaVolta(
            "estinzione",
            greenPoints
        );


    if (
        risultato &&
        risultato.success
    ) {

        console.log(
            "🌱 Estinzione - GP accreditati:",
            risultato.pointsAdded
        );


        console.log(
            "🌱 Estinzione - GP totali account:",
            risultato.totalPoints
        );
    }


    return risultato;
}


/* =========================================================
   FUNZIONE GENERICA PER I GIOCHI
========================================================= */

async function assegnaGreenPointsGioco(
    gameId,
    punti
) {

    return await
        accreditaGreenPointsUnaVolta(
            gameId,
            punti
        );
}


/* =========================================================
   SALVA LA FORESTA
========================================================= */

function calcolaGreenPointsForesta(
    punteggio
) {

    punteggio =
        Number(
            punteggio
        );


    if (
        !Number.isFinite(
            punteggio
        )
    ) {

        return 50;
    }


    if (
        punteggio < 90
    ) {

        return 50;
    }


    if (
        punteggio < 95
    ) {

        return 70;
    }


    return 90;
}


async function assegnaGreenPointsForesta(
    punteggio
) {

    const greenPoints =
        calcolaGreenPointsForesta(
            punteggio
        );


    console.log(
        "🌳 Salva la Foresta - punteggio:",
        punteggio
    );


    console.log(
        "🌱 Salva la Foresta - GP:",
        greenPoints
    );


    return await
        accreditaGreenPointsUnaVolta(
            "salva-foresta",
            greenPoints
        );
}


/* =========================================================
   MOSTRA GREEN POINTS
========================================================= */

async function mostraGreenPoints(
    elementId
) {

    const elemento =
        document.getElementById(
            elementId
        );


    if (!elemento) {

        console.warn(
            "EcoGame: elemento GP non trovato:",
            elementId
        );

        return null;
    }


    const risultato =
        await getGreenPoints();


    if (!risultato.success) {

        elemento.innerText =
            "—";

        return risultato;
    }


    elemento.innerText =
        risultato.points;


    return risultato;
}


/* =========================================================
   AGGIORNA GP NELLA PAGINA
========================================================= */

function aggiornaGreenPointsPagina(
    punti
) {

    punti =
        Number(
            punti
        ) || 0;


    /*
       Supportiamo diversi ID possibili,
       così i giochi possono usare quello
       che hanno già nel loro HTML.
    */

    const ids = [

        "greenPointsTotali",

        "green-points-totali",

        "greenPoints",

        "gpTotali",

        "gp-totali",

        "accountGreenPoints"

    ];


    ids.forEach(
        function(id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (elemento) {

                elemento.innerText =
                    punti;
            }
        }
    );


    /*
       Supporto anche per elementi con
       data-green-points.
    */

    const elementi =
        document.querySelectorAll(
            "[data-green-points]"
        );


    elementi.forEach(
        function(elemento) {

            elemento.innerText =
                punti;
        }
    );
}


/* =========================================================
   CARICA GP DELL'ACCOUNT NELLA PAGINA
========================================================= */

async function caricaGreenPointsAccount() {

    const risultato =
        await getGreenPoints();


    if (
        !risultato ||
        !risultato.success
    ) {

        console.warn(
            "EcoGame: impossibile leggere i GP dell'account."
        );

        return risultato;
    }


    aggiornaGreenPointsPagina(
        risultato.points
    );


    return risultato;
}


/* =========================================================
   EVENTO AUTH
========================================================= */

function inizializzaEventiAuth() {

    if (!supabaseDisponibile()) {

        return;
    }


    supabaseClient.auth.onAuthStateChange(
        function(
            event,
            session
        ) {

            console.log(
                "EcoGame: Auth:",
                event
            );


            window.dispatchEvent(
                new CustomEvent(
                    "ecoGameAuthChanged",
                    {
                        detail: {

                            event:
                                event,

                            session:
                                session
                        }
                    }
                )
            );


            /*
               Quando l'utente effettua il login,
               rileggiamo i GP dal profilo.
            */

            if (
                event === "SIGNED_IN" ||
                event === "INITIAL_SESSION"
            ) {

                setTimeout(
                    function() {

                        caricaGreenPointsAccount();

                    },
                    100
                );
            }
        }
    );
}


/* =========================================================
   AVVIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        inizializzaLingua();

        inizializzaEventiAuth();

        caricaGreenPointsAccount();

    }
);


/* =========================================================
   ESPORTAZIONE GLOBALE
   Utile se altri script devono chiamare
   direttamente le funzioni EcoGame.
========================================================= */

window.ecoGame = {

    getUser:
        getEcoGameUser,

    getSession:
        getEcoGameSession,

    getProfile:
        getEcoGameProfile,

    getGreenPoints:
        getGreenPoints,

    addGreenPoints:
        aggiungiGreenPoints,

    addOnce:
        accreditaGreenPointsUnaVolta,

    addGamePoints:
        assegnaGreenPointsGioco,

    addExtinctionPoints:
        assegnaGreenPointsEstinzione,

    addForestPoints:
        assegnaGreenPointsForesta,

    calculateExtinctionPoints:
        calcolaGreenPointsEstinzione,

    showGreenPoints:
        mostraGreenPoints,

    loadAccountPoints:
        caricaGreenPointsAccount,

    changeLanguage:
        cambiaLinguaComune

};
