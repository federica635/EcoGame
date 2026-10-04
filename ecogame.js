/* =====================================================
   ECOGAME - SISTEMA COMUNE
   Lingua + Account + Green Points
   ===================================================== */


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://zrxssuigzisgpcdesjvc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PXJEogyOyTRmaVIlW8ey_g_WhJHnNKw";


/*
   Controlliamo che la libreria Supabase
   sia stata caricata prima di creare il client.
*/

if (
    typeof window.supabase === "undefined"
) {

    console.error(
        "EcoGame - La libreria Supabase non è stata caricata."
    );

} else {

    /*
       Client Supabase.
    */

    var supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

}


/* =====================================================
   LINGUA CONDIVISA
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
   CAMBIO LINGUA GENERICO
===================================================== */

function cambiaLinguaComune(
    lingua
) {

    return salvaLingua(
        lingua
    );

}


/* =====================================================
   ACCOUNT
===================================================== */

async function getEcoGameUser() {

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        console.error(
            "EcoGame - supabaseClient non disponibile."
        );

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


        return (
            data.user ||
            null
        );


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
        typeof supabaseClient ===
        "undefined"
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

/*
   Questa funzione aggiunge ESATTAMENTE
   il numero di GP passato.

   Esempio:

   aggiungiGreenPoints(50)

   significa:

   vecchi GP + 50
*/

async function aggiungiGreenPoints(
    punti
) {

    /*
       Convertiamo in numero.
    */

    punti =
        Number(punti);


    /*
       Controllo valore.
    */

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
       I GP sono interi.
    */

    punti =
        Math.floor(punti);


    /*
       Controlliamo Supabase.
    */

    if (
        typeof supabaseClient ===
        "undefined"
    ) {

        return {

            success: false,

            pointsAdded: 0,

            error:
                "Supabase non disponibile"

        };

    }


    /*
       Recuperiamo l'utente.
    */

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


    /*
       Recuperiamo il profilo.
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


    /*
       GP attuali.
    */

    const puntiAttuali =
        Number(
            profilo.green_points
        ) || 0;


    /*
       Nuovo totale.
    */

    const nuoviPunti =
        puntiAttuali + punti;


    /*
       Nuovo livello.

       0-99     = livello 1
       100-199  = livello 2
       200-299  = livello 3
       ecc.
    */

    const nuovoLivello =
        Math.floor(
            nuoviPunti / 100
        ) + 1;


    /*
       Aggiorniamo il profilo.
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
                "green_points, level"
            )
            .single();


    if (error) {

        console.error(
            "EcoGame - Errore salvataggio GP:",
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

}


/* =====================================================
   ACCREDITO GREEN POINTS UNA SOLA VOLTA
===================================================== */

/*
   Questa funzione viene utilizzata dai giochi.

   Esempio:

   await accreditaGreenPointsUnaVolta(
       "salva-foresta",
       70
   );

   Il gioco riceve 70 GP.

   Se la stessa funzione viene richiamata
   nuovamente nella stessa sessione con
   "salva-foresta", NON aggiunge altri GP.
*/

async function accreditaGreenPointsUnaVolta(
    gameId,
    punti
) {

    /*
       Controllo gameId.
    */

    if (!gameId) {

        return {

            success: false,

            pointsAdded: 0,

            error:
                "gameId mancante"

        };

    }


    /*
       Controllo punti.
    */

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


    /*
       Chiave univoca per il gioco.
    */

    const chiave =
        "ecoGameGP_" +
        gameId;


    /*
       Controlliamo se il gioco ha già
       assegnato i GP in questa sessione.
    */

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


    /*
       Aggiungiamo i GP.
    */

    const risultato =
        await aggiungiGreenPoints(
            punti
        );


    /*
       Registriamo l'accredito SOLO
       se Supabase ha confermato
       il salvataggio.
    */

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
   FUNZIONE SPECIFICA PER SALVA LA FORESTA
===================================================== */

/*
   Questa funzione calcola i GP secondo
   le regole richieste:

   50 GP = base

   Punteggio < 90:
       50 GP

   Punteggio 90-94:
       70 GP

   Punteggio 95-100:
       90 GP
*/

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


    /*
       Fascia sotto 90.
    */

    if (
        punteggio < 90
    ) {

        return 50;

    }


    /*
       Fascia 90-94.
    */

    if (
        punteggio < 95
    ) {

        return 70;

    }


    /*
       Fascia 95-100.
    */

    return 90;

}


/* =====================================================
   ACCREDITO SPECIFICO SALVA LA FORESTA
===================================================== */

/*
   Il gioco può chiamare:

       await assegnaGreenPointsForesta(punteggio);
*/

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
   AGGIORNA ELEMENTO GREEN POINTS
===================================================== */

/*
   Se una pagina contiene:

       <span id="greenPoints">0</span>

   può utilizzare:

       await mostraGreenPoints("greenPoints");
*/

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
    typeof supabaseClient !==
    "undefined"
) {

    supabaseClient.auth.onAuthStateChange(
        function(
            event,
            session
        ) {

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
