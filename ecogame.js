/* =====================================================
   ECOGAME - SISTEMA COMUNE
   Lingua + Account + Green Points + Supabase
   ===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://zrxssuigzisgpcdesjvc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PXJEogyOyTRmaVIlW8ey_g_WhJHnNKw";


/*
   Client Supabase.
   IMPORTANTE:
   la libreria Supabase deve essere caricata
   prima di ecogame.js.
*/

let supabaseClient = null;


/* =====================================================
   INIZIALIZZAZIONE SUPABASE
===================================================== */

function inizializzaSupabase() {

    if (
        typeof window === "undefined"
    ) {

        console.error(
            "EcoGame - Window non disponibile."
        );

        return false;

    }


    if (
        typeof window.supabase === "undefined"
    ) {

        console.error(
            "EcoGame - ERRORE: la libreria Supabase non è stata caricata."
        );

        console.error(
            "EcoGame - Controlla che supabase-js venga caricato prima di ecogame.js."
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
            "EcoGame - Supabase inizializzato correttamente."
        );


        return true;


    } catch (errore) {

        console.error(
            "EcoGame - Errore inizializzazione Supabase:",
            errore
        );


        supabaseClient = null;


        return false;

    }

}


/*
   Inizializza immediatamente.
*/

inizializzaSupabase();


/* =====================================================
   LINGUA
===================================================== */

function getLingua() {

    return (
        localStorage.getItem(
            "ecoGameLingua"
        ) || "it"
    );

}


/* =====================================================
   SALVA LINGUA
===================================================== */

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


    document.documentElement.lang =
        lingua;


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


/* =====================================================
   INIZIALIZZA LINGUA
===================================================== */

function inizializzaLingua() {

    const lingua =
        getLingua();


    document.documentElement.lang =
        lingua;


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


/* =====================================================
   CAMBIO LINGUA
===================================================== */

function cambiaLinguaComune(
    lingua
) {

    return salvaLingua(
        lingua
    );

}


/* =====================================================
   CONTROLLO SUPABASE
===================================================== */

function supabaseDisponibile() {

    /*
       Se per qualche motivo non è stato
       inizializzato prima, proviamo nuovamente.
    */

    if (
        !supabaseClient
    ) {

        inizializzaSupabase();

    }


    if (
        !supabaseClient
    ) {

        console.error(
            "EcoGame - supabaseClient non disponibile."
        );

        return false;

    }


    return true;

}


/* =====================================================
   ACCOUNT
===================================================== */

async function getEcoGameUser() {

    if (
        !supabaseDisponibile()
    ) {

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
                "EcoGame - Errore recupero utente:",
                error
            );

            return null;

        }


        if (
            !data ||
            !data.user
        ) {

            console.warn(
                "EcoGame - Nessun utente autenticato."
            );

            return null;

        }


        console.log(
            "EcoGame - Utente autenticato:",
            data.user.id
        );


        return data.user;


    } catch (errore) {

        console.error(
            "EcoGame - Errore account:",
            errore
        );

        return null;

    }

}


/* =====================================================
   PROFILO
===================================================== */

async function getEcoGameProfile() {

    const user =
        await getEcoGameUser();


    if (!user) {

        return null;

    }


    if (
        !supabaseDisponibile()
    ) {

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
                "EcoGame - Errore recupero profilo:",
                error
            );

            return null;

        }


        if (!data) {

            console.error(
                "EcoGame - Profilo non trovato per:",
                user.id
            );

            return null;

        }


        return data;


    } catch (errore) {

        console.error(
            "EcoGame - Errore profilo:",
            errore
        );

        return null;

    }

}


/* =====================================================
   GREEN POINTS ATTUALI
===================================================== */

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


/* =====================================================
   AGGIUNGI GREEN POINTS
===================================================== */

async function aggiungiGreenPoints(
    punti
) {

    punti =
        Number(punti);


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


    punti =
        Math.floor(punti);


    if (
        !supabaseDisponibile()
    ) {

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

        console.error(
            "EcoGame - Utente non autenticato."
        );


        return {

            success: false,

            pointsAdded: 0,

            error:
                "Utente non autenticato"

        };

    }


    try {

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
                "EcoGame - Errore recupero profilo:",
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
                    "green_points, level"
                )
                .single();


        if (error) {

            console.error(
                "EcoGame - ERRORE SALVATAGGIO GP:",
                error
            );


            return {

                success: false,

                pointsAdded: 0,

                error:
                    error

            };

        }


        console.log(
            "🌱 EcoGame - GP aggiunti:",
            punti
        );


        console.log(
            "🌱 EcoGame - GP totali:",
            data.green_points
        );


        console.log(
            "⭐ EcoGame - Livello:",
            data.level
        );


        return {

            success: true,

            pointsAdded:
                punti,

            previousPoints:
                puntiAttuali,

            totalPoints:
                Number(
                    data.green_points
                ),

            level:
                Number(
                    data.level
                )

        };


    } catch (errore) {

        console.error(
            "EcoGame - Errore durante aggiunta GP:",
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


/* =====================================================
   ACCREDITO GREEN POINTS UNA SOLA VOLTA
===================================================== */

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
        Number(punti);


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


    punti =
        Math.floor(punti);


    const chiave =
        "ecoGameGP_" +
        gameId;


    const giaAccreditato =
        sessionStorage.getItem(
            chiave
        );


    if (
        giaAccreditato === "true"
    ) {

        console.log(
            "🌱 EcoGame - GP già assegnati:",
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
        risultato.success === true
    ) {

        sessionStorage.setItem(
            chiave,
            "true"
        );

    }


    return risultato;

}


/* =====================================================
   SALVA LA FORESTA
===================================================== */

function calcolaGreenPointsForesta(
    punteggio
) {

    punteggio =
        Number(punteggio);


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


/* =====================================================
   ACCREDITO SALVA LA FORESTA
===================================================== */

async function assegnaGreenPointsForesta(
    punteggio
) {

    const greenPoints =
        calcolaGreenPointsForesta(
            punteggio
        );


    console.log(
        "🌳 Salva la Foresta - Punteggio:",
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


/* =====================================================
   MOSTRA GREEN POINTS
===================================================== */

async function mostraGreenPoints(
    elementId
) {

    const elemento =
        document.getElementById(
            elementId
        );


    if (!elemento) {

        return null;

    }


    const risultato =
        await getGreenPoints();


    if (!risultato.success) {

        elemento.innerText =
            "0";

        return risultato;

    }


    elemento.innerText =
        risultato.points;


    return risultato;

}


/* =====================================================
   EVENTO AUTH SUPABASE
===================================================== */

if (
    supabaseClient
) {

    supabaseClient.auth.onAuthStateChange(
        function(
            event,
            session
        ) {

            console.log(
                "EcoGame - Auth:",
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

        }
    );

}


/* =====================================================
   AVVIO SISTEMA
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        inizializzaLingua();

    }
);
