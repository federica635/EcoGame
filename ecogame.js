/* =====================================================
   ECOGAME - SISTEMA COMUNE
   Lingua + Green Points
   ===================================================== */

const SUPABASE_URL =
    "https://zrxssuigzisgpcdesjvc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_PXJEogyOyTRmaVIlW8ey_g_WhJHnNKw";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =====================================================
   LINGUA
   ===================================================== */

function getLingua() {

    return localStorage.getItem("ecoGameLingua") || "it";

}


/* =====================================================
   APPLICA LA LINGUA A UNA PAGINA
   ===================================================== */

function inizializzaLingua() {

    const lingua = getLingua();

    document.documentElement.lang = lingua;

    /*
       Se la pagina contiene un selettore
       con id="lingua", lo aggiorniamo.
    */

    const selettore =
        document.getElementById("lingua");

    if (selettore) {
        selettore.value = lingua;
    }

}


/* =====================================================
   CAMBIO LINGUA
   ===================================================== */

function salvaLingua(lingua) {

    if (!["it", "en", "fi"].includes(lingua)) {
        lingua = "it";
    }

    localStorage.setItem(
        "ecoGameLingua",
        lingua
    );

    document.documentElement.lang = lingua;

}


/* =====================================================
   GREEN POINTS
   ===================================================== */

/*
   Aggiunge GP a quelli già posseduti.

   Esempio:

   Prima:
   100 GP

   Gioco 1:
   +50 GP

   Risultato:
   150 GP

   Gioco 2:
   +30 GP

   Risultato:
   180 GP
*/

async function aggiungiGreenPoints(punti) {

    punti = Number(punti);

    if (!Number.isFinite(punti) || punti <= 0) {
        return {
            success: false,
            error: "Punti non validi"
        };
    }


    /*
       Recuperiamo l'utente autenticato.
    */

    const {
        data: {
            user
        },
        error: userError
    } =
        await supabaseClient.auth.getUser();


    if (userError || !user) {

        console.error(
            "Utente non autenticato:",
            userError
        );

        return {
            success: false,
            error: "Utente non autenticato"
        };

    }


    /*
       Recuperiamo il punteggio attuale.
    */

    const {
        data: profilo,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("green_points, level")
            .eq("id", user.id)
            .single();


    if (profileError) {

        console.error(
            "Errore recupero profilo:",
            profileError
        );

        return {
            success: false,
            error: profileError
        };

    }


    const puntiAttuali =
        Number(profilo.green_points) || 0;


    const nuoviPunti =
        puntiAttuali + punti;


    /*
       Calcolo livello.

       Puoi modificare questa formula
       quando vuoi.
    */

    const nuovoLivello =
        Math.floor(nuoviPunti / 100) + 1;


    /*
       SALVIAMO IL TOTALE,
       non il punteggio del singolo gioco.
    */

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .update({
                green_points: nuoviPunti,
                level: nuovoLivello
            })
            .eq("id", user.id)
            .select("green_points, level")
            .single();


    if (error) {

        console.error(
            "Errore salvataggio Green Points:",
            error
        );

        return {
            success: false,
            error: error
        };

    }


    console.log(
        "🌱 Green Points aggiunti:",
        punti
    );

    console.log(
        "🌱 Totale Green Points:",
        data.green_points
    );


    return {
        success: true,
        pointsAdded: punti,
        totalPoints: data.green_points,
        level: data.level
    };

}


/* =====================================================
   AVVIO
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        inizializzaLingua();

    }
);
