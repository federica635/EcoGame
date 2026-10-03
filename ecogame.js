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
   Creiamo il client Supabase.

   ATTENZIONE:
   Questo file deve essere caricato DOPO:

   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

   e PRIMA dello script specifico del gioco.
*/

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   LINGUA CONDIVISA
===================================================== */

function getLingua() {

    return localStorage.getItem("ecoGameLingua") || "it";

}


/* =====================================================
   SALVA LINGUA
===================================================== */

function salvaLingua(lingua) {

    /*
       Accettiamo solamente le tre lingue
       utilizzate da EcoGame.
    */

    if (!["it", "en", "fi"].includes(lingua)) {

        lingua = "it";

    }


    localStorage.setItem(
        "ecoGameLingua",
        lingua
    );


    document.documentElement.lang =
        lingua;


    /*
       Evento utile se una pagina vuole
       reagire al cambio lingua.
    */

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


    /*
       Se la pagina usa un normale
       <select id="lingua">
       lo sincronizziamo automaticamente.
    */

    const selettore =
        document.getElementById("lingua");


    if (selettore) {

        selettore.value =
            lingua;

    }


    return lingua;

}


/* =====================================================
   CAMBIO LINGUA GENERICO
===================================================== */

function cambiaLinguaComune(lingua) {

    return salvaLingua(lingua);

}


/* =====================================================
   ACCOUNT
===================================================== */

/*
   Restituisce l'utente attualmente autenticato.
*/

async function getEcoGameUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "EcoGame - Errore recupero utente:",
            error
        );

        return null;

    }


    return data.user || null;

}


/* =====================================================
   PROFILO
===================================================== */

/*
   Recupera il profilo dell'utente.

   Restituisce:

   {
       id,
       green_points,
       level
   }

   oppure null.
*/

async function getEcoGameProfile() {

    const user =
        await getEcoGameUser();


    if (!user) {

        return null;

    }


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
            Number(profilo.green_points) || 0,

        level:
            Number(profilo.level) || 1

    };

}


/* =====================================================
   AGGIUNGI GREEN POINTS
===================================================== */

/*
   Funzione generale utilizzata dai giochi.

   Esempio:

       await aggiungiGreenPoints(50);

   Se l'utente possiede 200 GP:

       200 + 50 = 250 GP
*/

async function aggiungiGreenPoints(punti) {

    /*
       Convertiamo il valore in numero.
    */

    punti =
        Number(punti);


    /*
       Controlliamo che sia valido.
    */

    if (
        !Number.isFinite(punti) ||
        punti <= 0
    ) {

        return {

            success: false,

            error:
                "Punti non validi"

        };

    }


    /*
       I Green Points sono interi.
    */

    punti =
        Math.floor(punti);


    /*
       Recuperiamo l'utente autenticato.
    */

    const user =
        await getEcoGameUser();


    if (!user) {

        console.error(
            "EcoGame - Utente non autenticato."
        );


        return {

            success: false,

            error:
                "Utente non autenticato"

        };

    }


    /*
       Recuperiamo il profilo attuale.
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
       Calcolo livello.

       0-99 GP   -> livello 1
       100-199   -> livello 2
       200-299   -> livello 3
       ecc.
    */

    const nuovoLivello =
        Math.floor(
            nuoviPunti / 100
        ) + 1;


    /*
       Salviamo il nuovo totale.
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

            error:
                error

        };

    }


    /*
       Log utile durante i test.
    */

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
   SISTEMA ANTI DOPPIO ACCREDITO
===================================================== */

/*
   Questa funzione impedisce che la stessa partita
   accrediti due volte i Green Points.

   IMPORTANTE:

   gameId deve essere UNICO per ogni partita.

   Esempio:

       salva-foresta-17283920123

   Una nuova partita avrà un nuovo gameId.
*/

async function accreditaGreenPointsUnaVolta(
    gameId,
    punti
) {

    if (!gameId) {

        return {

            success: false,

            error:
                "gameId mancante"

        };

    }


    /*
       Chiave specifica per questa partita.
    */

    const chiave =
        "ecoGameGP_" +
        gameId;


    /*
       Controlliamo se questa partita
       è già stata accreditata.
    */

    const giaAccreditato =
        sessionStorage.getItem(
            chiave
        );


    if (giaAccreditato === "true") {

        console.log(
            "🌱 GP già accreditati per:",
            gameId
        );


        return {

            success: false,

            alreadyAdded: true,

            error:
                "Green Points già accreditati"

        };

    }


    /*
       Proviamo ad aggiungere i GP.
    */

    const risultato =
        await aggiungiGreenPoints(
            punti
        );


    /*
       Se il salvataggio è riuscito,
       registriamo l'accredito.
    */

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


/* =====================================================
   AGGIORNA ELEMENTO GP NELLA PAGINA
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

supabaseClient.auth.onAuthStateChange(
    function(event, session) {

        window.dispatchEvent(
            new CustomEvent(
                "ecoGameAuthChanged",
                {
                    detail: {
                        event: event,
                        session: session
                    }
                }
            )
        );

    }
);


/* =====================================================
   AVVIO SISTEMA
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        inizializzaLingua();

    }
);
