/* =========================================================
   ANIMALI.JS
   SPECIES RESCUE - SISTEMA AUTONOMO

   Questo file gestisce esclusivamente animali.html.

   NON dipende da ecogame.js.

   Funzioni:
   - Supabase
   - account autenticato
   - Green Points attuali
   - +10 GP per risposta corretta
   - aggiornamento GP in tempo reale
   - risposte mescolate
   - italiano / inglese / finlandese
   - gestione partita
   ========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const ANIMALI_SUPABASE_URL =
    "https://zrxssuigzisgpcdesjvc.supabase.co";

const ANIMALI_SUPABASE_KEY =
    "sb_publishable_PXJEogyOyTRmaVIlW8ey_g_WhJHnNKw";


let animaliSupabase = null;

let animaliUser = null;


/* =========================================================
   STATO GIOCO
========================================================= */

let current = 0;

let score = 0;

let saved = 0;

let answered = false;

let greenPoints = 0;

let greenPointsSession = 0;


/*
   Ogni domanda viene trasformata in una nuova struttura
   con le risposte già mescolate.

   Esempio:

   {
       text: "...",
       correct: true
   }

   In questo modo non importa più quale sia l'indice
   originale della risposta corretta.
*/
let currentOptions = [];


/*
   Tiene traccia delle domande per cui sono già stati
   assegnati i GP durante questa partita.
*/
const gpQuestionsAwarded = new Set();


/* =========================================================
   TESTI
========================================================= */

const testi = {

    it: {

        titolo:
            "🐾 Species Rescue",

        intro:
            "Proteggi le specie a rischio e scopri cosa ha portato altre specie all'estinzione.",

        menu:
            "🎮 Giochi",

        alt:
            "Animale",

        specieSalvate:
            "Specie salvate",

        punti:
            "Punti",

        missione:
            "Missione",

        prossima:
            "Prossima missione →",

        risultato:
            "🏆 Risultato finale",

        programmaCompletato:
            "Programma completato!",

        descrizioneFinale:
            "Hai completato tutte le 10 missioni.",

        riprova:
            "🔄 Riprova",

        torna:
            "🎮 Torna ai giochi",

        riuscita:
            "✅ <strong>Missione riuscita!</strong>",

        errata:
            "❌ <strong>Risposta non corretta.</strong>",

        rispostaCorretta:
            "La risposta corretta era:",

        gpOttenuti:
            "🌱 Green Points ottenuti",

        gpAttuali:
            "🌱 Green Points attuali",

        gpSalvati:
            "Green Points aggiunti al tuo account!",

        gpNonDisponibili:
            "Green Points non disponibili: accedi al tuo account.",

        gpErrore:
            "Impossibile aggiornare i Green Points.",

        messaggio100:
            "🌟 Perfetto! Hai completato tutte le missioni e dimostrato un'ottima conoscenza della conservazione delle specie.",

        messaggio70:
            "🐾 Ottimo lavoro! Hai compreso molti dei principali problemi legati alla protezione della biodiversità.",

        messaggio50:
            "🌱 Buona base! Alcuni concetti sulla protezione delle specie possono ancora essere approfonditi.",

        messaggio0:
            "🔎 C'è ancora molto da scoprire. Riprova e presta attenzione alle spiegazioni delle missioni.",

        footer:
            "🌱 Proteggere la biodiversità significa proteggere gli ecosistemi da cui dipendiamo."

    },


    en: {

        titolo:
            "🐾 Species Rescue",

        intro:
            "Protect endangered species and discover what caused other species to become extinct.",

        menu:
            "🎮 Games",

        alt:
            "Animal",

        specieSalvate:
            "Species saved",

        punti:
            "Points",

        missione:
            "Mission",

        prossima:
            "Next mission →",

        risultato:
            "🏆 Final result",

        programmaCompletato:
            "Program completed!",

        descrizioneFinale:
            "You have completed all 10 missions.",

        riprova:
            "🔄 Try again",

        torna:
            "🎮 Back to games",

        riuscita:
            "✅ <strong>Mission accomplished!</strong>",

        errata:
            "❌ <strong>Incorrect answer.</strong>",

        rispostaCorretta:
            "The correct answer was:",

        gpOttenuti:
            "🌱 Green Points earned",

        gpAttuali:
            "🌱 Current Green Points",

        gpSalvati:
            "Green Points added to your account!",

        gpNonDisponibili:
            "Green Points unavailable: please log in to your account.",

        gpErrore:
            "Unable to update Green Points.",

        messaggio100:
            "🌟 Perfect! You completed all the missions and demonstrated excellent knowledge of species conservation.",

        messaggio70:
            "🐾 Great job! You understood many of the main issues related to protecting biodiversity.",

        messaggio50:
            "🌱 Good foundation! Some concepts about species protection could still be explored further.",

        messaggio0:
            "🔎 There is still a lot to discover. Try again and pay attention to the mission explanations.",

        footer:
            "🌱 Protecting biodiversity means protecting the ecosystems we depend on."

    },


    fi: {

        titolo:
            "🐾 Species Rescue",

        intro:
            "Suojele uhanalaisia lajeja ja tutustu syihin, jotka ovat johtaneet muiden lajien sukupuuttoon.",

        menu:
            "🎮 Pelit",

        alt:
            "Eläin",

        specieSalvate:
            "Pelastetut lajit",

        punti:
            "Pisteet",

        missione:
            "Tehtävä",

        prossima:
            "Seuraava tehtävä →",

        risultato:
            "🏆 Lopputulos",

        programmaCompletato:
            "Ohjelma suoritettu!",

        descrizioneFinale:
            "Olet suorittanut kaikki 10 tehtävää.",

        riprova:
            "🔄 Yritä uudelleen",

        torna:
            "🎮 Takaisin peleihin",

        riuscita:
            "✅ <strong>Tehtävä onnistui!</strong>",

        errata:
            "❌ <strong>Väärä vastaus.</strong>",

        rispostaCorretta:
            "Oikea vastaus oli:",

        gpOttenuti:
            "🌱 Ansaitut Green Points",

        gpAttuali:
            "🌱 Nykyiset Green Points",

        gpSalvati:
            "Green Points lisätty tilillesi!",

        gpNonDisponibili:
            "Green Points eivät ole käytettävissä: kirjaudu tilillesi.",

        gpErrore:
            "Green Points -pisteitä ei voitu päivittää.",

        messaggio100:
            "🌟 Täydellistä! Suoritit kaikki tehtävät ja osoitit erinomaista tietämystä lajien suojelusta.",

        messaggio70:
            "🐾 Hienoa työtä! Ymmärsit monia luonnon monimuotoisuuden suojeluun liittyviä keskeisiä ongelmia.",

        messaggio50:
            "🌱 Hyvä perusta! Joitakin lajien suojeluun liittyviä käsitteitä voisi vielä syventää.",

        messaggio0:
            "🔎 Opittavaa on vielä paljon. Yritä uudelleen ja kiinnitä huomiota tehtävien selityksiin.",

        footer:
            "🌱 Luonnon monimuotoisuuden suojeleminen tarkoittaa niiden ekosysteemien suojelemista, joista olemme riippuvaisia."

    }

};


/* =========================================================
   LINGUA
========================================================= */

function getLinguaAnimali() {

    const lingua =
        localStorage.getItem("ecoGameLingua") ||
        localStorage.getItem("linguaEcoGame") ||
        "it";


    if (testi[lingua]) {

        return lingua;

    }


    return "it";
}


let lingua =
    getLinguaAnimali();


function testiLingua() {

    return testi[lingua] || testi.it;

}


/* =========================================================
   SUPABASE - INIZIALIZZAZIONE
========================================================= */

function inizializzaSupabaseAnimali() {

    if (
        typeof window === "undefined"
    ) {

        console.error(
            "Animali: window non disponibile."
        );

        return false;
    }


    if (
        typeof window.supabase === "undefined"
    ) {

        console.error(
            "Animali: supabase-js non è stato caricato."
        );

        console.error(
            "Animali: devi caricare supabase-js PRIMA di animali.js."
        );

        return false;
    }


    try {

        animaliSupabase =
            window.supabase.createClient(
                ANIMALI_SUPABASE_URL,
                ANIMALI_SUPABASE_KEY
            );


        console.log(
            "🐾 Animali: Supabase inizializzato."
        );


        return true;

    } catch (errore) {

        console.error(
            "Animali: errore inizializzazione Supabase:",
            errore
        );

        animaliSupabase = null;

        return false;
    }
}


/* =========================================================
   CONTROLLO SUPABASE
========================================================= */

function supabaseAnimaliDisponibile() {

    if (!animaliSupabase) {

        inizializzaSupabaseAnimali();
    }


    return !!animaliSupabase;
}


/* =========================================================
   RECUPERA UTENTE
========================================================= */

async function getAnimaliUser() {

    if (
        !supabaseAnimaliDisponibile()
    ) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await animaliSupabase
                .auth
                .getUser();


        if (error) {

            console.error(
                "Animali: errore recupero utente:",
                error
            );

            return null;
        }


        if (
            !data ||
            !data.user
        ) {

            console.warn(
                "Animali: nessun utente autenticato."
            );

            return null;
        }


        animaliUser =
            data.user;


        console.log(
            "🐾 Animali: utente:",
            animaliUser.id
        );


        return animaliUser;

    } catch (errore) {

        console.error(
            "Animali: errore account:",
            errore
        );

        return null;
    }
}


/* =========================================================
   RECUPERA GREEN POINTS
========================================================= */

async function caricaGreenPointsAnimali() {

    const elemento =
        document.getElementById(
            "animalGreenPoints"
        );


    if (!supabaseAnimaliDisponibile()) {

        if (elemento) {

            elemento.innerText =
                "—";
        }

        return null;
    }


    const user =
        await getAnimaliUser();


    if (!user) {

        greenPoints = 0;


        if (elemento) {

            elemento.innerText =
                "—";
        }


        aggiornaGreenPointsPaginaAnimali();


        return null;
    }


    try {

        const {
            data,
            error
        } =
            await animaliSupabase
                .from("profiles")
                .select(
                    "green_points, level"
                )
                .eq(
                    "id",
                    user.id
                )
                .single();


        if (error) {

            console.error(
                "Animali: errore lettura GP:",
                error
            );

            if (elemento) {

                elemento.innerText =
                    "—";
            }

            return null;
        }


        if (!data) {

            console.error(
                "Animali: profilo non trovato."
            );

            return null;
        }


        greenPoints =
            Number(
                data.green_points
            ) || 0;


        aggiornaGreenPointsPaginaAnimali();


        console.log(
            "🌱 Animali: Green Points attuali:",
            greenPoints
        );


        return {

            success: true,

            points:
                greenPoints,

            level:
                Number(
                    data.level
                ) || 1

        };

    } catch (errore) {

        console.error(
            "Animali: errore caricamento GP:",
            errore
        );

        return null;
    }
}


/* =========================================================
   AGGIORNA DISPLAY GP
========================================================= */

function aggiornaGreenPointsPaginaAnimali() {

    const elementi =
        document.querySelectorAll(
            "[data-animal-green-points]"
        );


    elementi.forEach(
        function(elemento) {

            elemento.innerText =
                greenPoints;
        }
    );


    const elemento =
        document.getElementById(
            "animalGreenPoints"
        );


    if (elemento) {

        elemento.innerText =
            greenPoints;
    }


    const gpTotali =
        document.getElementById(
            "greenPointsTotali"
        );


    if (gpTotali) {

        gpTotali.innerText =
            greenPoints;
    }
}


/* =========================================================
   AGGIUNGI GREEN POINTS
========================================================= */

async function aggiungiGreenPointsAnimali(
    punti
) {

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

            error:
                "Punti non validi"

        };
    }


    if (
        !supabaseAnimaliDisponibile()
    ) {

        return {

            success: false,

            error:
                "Supabase non disponibile"

        };
    }


    const user =
        await getAnimaliUser();


    if (!user) {

        return {

            success: false,

            error:
                "Utente non autenticato"

        };
    }


    try {

        /*
           Leggiamo il valore attuale.
        */

        const {
            data: profilo,
            error: letturaError
        } =
            await animaliSupabase
                .from("profiles")
                .select(
                    "green_points, level"
                )
                .eq(
                    "id",
                    user.id
                )
                .single();


        if (letturaError) {

            console.error(
                "Animali: errore lettura profilo:",
                letturaError
            );

            return {

                success: false,

                error:
                    letturaError

            };
        }


        if (!profilo) {

            return {

                success: false,

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
           Salviamo i nuovi GP.
        */

        const {
            data,
            error
        } =
            await animaliSupabase
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
                "Animali: ERRORE SALVATAGGIO GP:",
                error
            );

            return {

                success: false,

                error:
                    error

            };
        }


        greenPoints =
            Number(
                data.green_points
            ) || nuoviPunti;


        aggiornaGreenPointsPaginaAnimali();


        console.log(
            "🌱 Animali: +",
            punti,
            "GP"
        );


        console.log(
            "🌱 Animali: totale:",
            greenPoints
        );


        return {

            success: true,

            pointsAdded:
                punti,

            previousPoints:
                puntiAttuali,

            totalPoints:
                greenPoints,

            level:
                Number(
                    data.level
                ) || nuovoLivello

        };

    } catch (errore) {

        console.error(
            "Animali: errore aggiunta GP:",
            errore
        );

        return {

            success: false,

            error:
                errore

        };
    }
}


/* =========================================================
   MOSTRA ANIMAZIONE +10 GP
========================================================= */

function mostraGPGuadagnati(
    punti
) {

    const feedback =
        document.getElementById(
            "feedback"
        );


    if (!feedback) {

        return;
    }


    const t =
        testiLingua();


    const messaggio =
        document.createElement(
            "div"
        );


    messaggio.className =
        "gp-earned";


    messaggio.innerHTML =
        "🌱 <strong>+" +
        punti +
        " GP</strong><br>" +
        "<small>" +
        t.gpSalvati +
        "</small>";


    messaggio.style.marginTop =
        "14px";


    messaggio.style.padding =
        "12px";


    messaggio.style.background =
        "#285236";


    messaggio.style.border =
        "1px solid #66bb6a";


    messaggio.style.borderRadius =
        "10px";


    messaggio.style.color =
        "#d9f5dc";


    feedback.appendChild(
        messaggio
    );
}


/* =========================================================
   ACCREDITA GP PER UNA RISPOSTA
========================================================= */

async function accreditaGPPerRisposta(
    missionIndex
) {

    /*
       Una risposta vale sempre +10 GP.
    */

    const punti =
        10;


    /*
       Protezione contro doppio accredito.
    */

    if (
        gpQuestionsAwarded.has(
            missionIndex
        )
    ) {

        console.log(
            "Animali: GP già assegnati per domanda:",
            missionIndex
        );

        return {

            success: false,

            alreadyAdded: true,

            pointsAdded: 0

        };
    }


    const risultato =
        await aggiungiGreenPointsAnimali(
            punti
        );


    if (
        risultato &&
        risultato.success
    ) {

        gpQuestionsAwarded.add(
            missionIndex
        );


        greenPointsSession +=
            punti;


        console.log(
            "🌱 Animali: +10 GP accreditati."
        );


        return risultato;
    }


    return risultato;
}


/* =========================================================
   APPLICA LINGUA
========================================================= */

function applicaLinguaAnimali() {

    lingua =
        getLinguaAnimali();


    const t =
        testiLingua();


    document.documentElement.lang =
        lingua;


    document.title =
        "🐾 Species Rescue - EcoGame";


    const titolo =
        document.querySelector(
            ".title h1"
        );


    if (titolo) {

        titolo.innerText =
            t.titolo;
    }


    const intro =
        document.getElementById(
            "intro"
        );


    if (intro) {

        intro.innerText =
            t.intro;
    }


    const menu =
        document.getElementById(
            "menu"
        );


    if (menu) {

        menu.innerText =
            t.menu;
    }


    const savedLabel =
        document.getElementById(
            "savedLabel"
        );


    if (savedLabel) {

        savedLabel.innerText =
            t.specieSalvate;
    }


    const scoreLabel =
        document.getElementById(
            "scoreLabel"
        );


    if (scoreLabel) {

        scoreLabel.innerText =
            t.punti;
    }


    const missionLabel =
        document.getElementById(
            "missionLabel"
        );


    if (missionLabel) {

        missionLabel.innerText =
            t.missione;
    }


    const resultTitle =
        document.getElementById(
            "resultTitle"
        );


    if (resultTitle) {

        resultTitle.innerText =
            t.programmaCompletato;
    }


    const resultDescription =
        document.getElementById(
            "resultDescription"
        );


    if (resultDescription) {

        resultDescription.innerText =
            t.descrizioneFinale;
    }


    const restart =
        document.getElementById(
            "restartButton"
        );


    if (restart) {

        restart.innerText =
            t.riprova;
    }


    const back =
        document.getElementById(
            "backButton"
        );


    if (back) {

        back.innerText =
            t.torna;
    }


    const footer =
        document.getElementById(
            "footer"
        );


    if (footer) {

        footer.innerText =
            t.footer;
    }


    const animalImage =
        document.getElementById(
            "animalImage"
        );


    if (animalImage) {

        animalImage.alt =
            t.alt;
    }


    aggiornaGreenPointsPaginaAnimali();
}


/* =========================================================
   MESCOLA ARRAY
========================================================= */

function mescolaArray(array) {

    const copia =
        [...array];


    for (
        let i = copia.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            copia[i],
            copia[j]
        ] =
        [
            copia[j],
            copia[i]
        ];
    }


    return copia;
}


/* =========================================================
   CREA RISPOSTE MESSE IN ORDINE CASUALE
========================================================= */

function preparaRisposte(
    mission
) {

    const risposte = [];


    mission.options.forEach(
        function(testo, index) {

            risposte.push({

                text:
                    testo,

                correct:
                    index === mission.correct

            });

        }
    );


    currentOptions =
        mescolaArray(
            risposte
        );
}


/* =========================================================
   CARICA MISSIONE
========================================================= */

function loadMission() {

    answered =
        false;


    const missionData =
        missions[current];


    const mission =
        missionData[lingua] ||
        missionData.it;


    const t =
        testiLingua();


    document.getElementById(
        "animalImage"
    ).src =
        missionData.image;


    document.getElementById(
        "status"
    ).innerText =
        mission.status;


    document.getElementById(
        "animalName"
    ).innerText =
        mission.name;


    document.getElementById(
        "info"
    ).innerText =
        mission.info;


    document.getElementById(
        "mission"
    ).innerText =
        mission.mission;


    document.getElementById(
        "number"
    ).innerText =
        (current + 1) +
        "/" +
        missions.length;


    document.getElementById(
        "progress"
    ).style.width =
        (
            (current + 1) /
            missions.length *
            100
        ) +
        "%";


    document.getElementById(
        "feedback"
    ).style.display =
        "none";


    document.getElementById(
        "next"
    ).style.display =
        "none";


    document.getElementById(
        "next"
    ).innerText =
        current === missions.length - 1
            ? t.risultato
            : t.prossima;


    /*
       IMPORTANTE:
       prepariamo le risposte DOPO aver
       caricato la missione nella lingua corrente.
    */

    preparaRisposte(
        mission
    );


    const options =
        document.getElementById(
            "options"
        );


    options.innerHTML =
        "";


    currentOptions.forEach(
        function(option, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "option";


            button.innerText =
                option.text;


            button.onclick =
                function() {

                    checkAnswer(
                        button,
                        index
                    );

                };


            options.appendChild(
                button
            );

        }
    );


    /*
       Mostriamo nuovamente i GP attuali
       ogni volta che cambia missione.
    */

    aggiornaGreenPointsPaginaAnimali();
}


/* =========================================================
   CONTROLLO RISPOSTA
========================================================= */

async function checkAnswer(
    selected,
    index
) {

    if (answered) {

        return;
    }


    answered =
        true;


    const missionData =
        missions[current];


    const mission =
        missionData[lingua] ||
        missionData.it;


    const all =
        document.querySelectorAll(
            ".option"
        );


    all.forEach(
        function(button) {

            button.disabled =
                true;

        }
    );


    const rispostaSelezionata =
        currentOptions[index];


    const corretta =
        rispostaSelezionata.correct;


    const feedback =
        document.getElementById(
            "feedback"
        );


    if (corretta) {

        /*
           Evidenziamo la risposta corretta.
        */

        selected.classList.add(
            "correct"
        );


        /*
           +10 PUNTI DEL GIOCO
        */

        score +=
            10;


        saved +=
            1;


        /*
           Feedback base.
        */

        feedback.innerHTML =
            testiLingua().riuscita +
            "<br><br>" +
            mission.explanation;


        /*
           Mostriamo subito +10 GP.
        */

        const gpRisultato =
            await accreditaGPPerRisposta(
                current
            );


        if (
            gpRisultato &&
            gpRisultato.success
        ) {

            mostraGPGuadagnati(
                10
            );

        } else if (
            gpRisultato &&
            gpRisultato.alreadyAdded
        ) {

            const messaggio =
                document.createElement(
                    "div"
                );


            messaggio.style.marginTop =
                "12px";


            messaggio.innerHTML =
                "🌱 +10 GP già accreditati.";


            feedback.appendChild(
                messaggio
            );

        } else {

            const errore =
                document.createElement(
                    "div"
                );


            errore.style.marginTop =
                "12px";


            errore.style.color =
                "#ffb4b4";


            errore.innerText =
                testiLingua().gpErrore;


            feedback.appendChild(
                errore
            );
        }

    } else {

        /*
           Risposta sbagliata.
        */

        selected.classList.add(
            "wrong"
        );


        /*
           Troviamo la risposta corretta
           NELLE RISPOSTE MESSE A CASO.
        */

        const indiceCorretta =
            currentOptions.findIndex(
                function(option) {

                    return option.correct === true;

                }
            );


        if (
            indiceCorretta >= 0 &&
            all[indiceCorretta]
        ) {

            all[indiceCorretta]
                .classList
                .add(
                    "correct"
                );
        }


        const rispostaCorretta =
            currentOptions[indiceCorretta];


        feedback.innerHTML =
            testiLingua().errata +
            "<br><br>" +
            testiLingua().rispostaCorretta +
            " <strong>" +
            (
                rispostaCorretta
                    ? rispostaCorretta.text
                    : "—"
            ) +
            "</strong><br><br>" +
            mission.explanation;
    }


    /*
       Aggiorniamo punteggio gioco.
    */

    document.getElementById(
        "score"
    ).innerText =
        score;


    document.getElementById(
        "saved"
    ).innerText =
        saved;


    /*
       Mostriamo feedback.
    */

    feedback.style.display =
        "block";


    /*
       Mostriamo pulsante avanti.
    */

    document.getElementById(
        "next"
    ).style.display =
        "block";


    /*
       Aggiorniamo GP nella pagina.
    */

    aggiornaGreenPointsPaginaAnimali();
}


/* =========================================================
   PROSSIMA MISSIONE
========================================================= */

function nextMission() {

    current++;


    if (
        current <
        missions.length
    ) {

        loadMission();

    } else {

        showResult();

    }
}


/* =========================================================
   RISULTATO FINALE
========================================================= */

function showResult() {

    document.getElementById(
        "gameCard"
    )
        .classList
        .add(
            "hidden"
        );


    document.getElementById(
        "resultCard"
    )
        .classList
        .remove(
            "hidden"
        );


    document.getElementById(
        "finalScore"
    )
        .innerText =
        score +
        " / 100";


    let message;


    if (
        score === 100
    ) {

        message =
            testiLingua().messaggio100;

    } else if (
        score >= 70
    ) {

        message =
            testiLingua().messaggio70;

    } else if (
        score >= 50
    ) {

        message =
            testiLingua().messaggio50;

    } else {

        message =
            testiLingua().messaggio0;
    }


    document.getElementById(
        "message"
    )
        .innerText =
        message;


    /*
       IMPORTANTE:

       NON accreditiamo più il punteggio finale.

       I GP sono già stati assegnati:
       +10 GP per ogni risposta corretta.
    */


    const riepilogo =
        document.createElement(
            "div"
        );


    riepilogo.style.marginTop =
        "20px";


    riepilogo.style.padding =
        "16px";


    riepilogo.style.background =
        "#203328";


    riepilogo.style.borderRadius =
        "12px";


    riepilogo.style.color =
        "#c8e6c9";


    riepilogo.innerHTML =
        "🌱 <strong>+" +
        greenPointsSession +
        " GP</strong><br>" +
        testiLingua().gpAttuali +
        ": <strong>" +
        greenPoints +
        "</strong>";


    document.getElementById(
        "message"
    )
        .after(
            riepilogo
        );
}


/* =========================================================
   RIAVVIA GIOCO
========================================================= */

function restartGame() {

    current =
        0;


    score =
        0;


    saved =
        0;


    answered =
        false;


    greenPointsSession =
        0;


    /*
       Nuova partita = nuovo set di domande
       e quindi possono essere nuovamente accreditati
       i GP delle risposte corrette.
    */

    gpQuestionsAwarded.clear();


    document.getElementById(
        "score"
    ).innerText =
        "0";


    document.getElementById(
        "saved"
    ).innerText =
        "0";


    document.getElementById(
        "gameCard"
    )
        .classList
        .remove(
            "hidden"
        );


    document.getElementById(
        "resultCard"
    )
        .classList
        .add(
            "hidden"
        );


    /*
       Elimina eventuale riepilogo GP precedente.
    */

    const vecchiRiepiloghi =
        document.querySelectorAll(
            "#message + div"
        );


    vecchiRiepiloghi.forEach(
        function(elemento) {

            elemento.remove();

        }
    );


    loadMission();

}


/* =========================================================
   CAMBIO LINGUA
========================================================= */

window.addEventListener(
    "ecoGameLinguaCambiata",
    function(event) {

        if (
            event &&
            event.detail &&
            event.detail.lingua
        ) {

            lingua =
                event.detail.lingua;

        } else {

            lingua =
                getLinguaAnimali();
        }


        applicaLinguaAnimali();


        loadMission();

    }
);


/* =========================================================
   SUPABASE AUTH EVENT
========================================================= */

function inizializzaAuthAnimali() {

    if (
        !supabaseAnimaliDisponibile()
    ) {

        return;
    }


    animaliSupabase
        .auth
        .onAuthStateChange(
            async function(
                event,
                session
            ) {

                console.log(
                    "🐾 Animali Auth:",
                    event
                );


                if (
                    event === "SIGNED_IN" ||
                    event === "INITIAL_SESSION" ||
                    event === "TOKEN_REFRESHED"
                ) {

                    if (
                        session &&
                        session.user
                    ) {

                        animaliUser =
                            session.user;

                    }


                    await caricaGreenPointsAnimali();
                }


                if (
                    event === "SIGNED_OUT"
                ) {

                    animaliUser =
                        null;


                    greenPoints =
                        0;


                    aggiornaGreenPointsPaginaAnimali();
                }

            }
        );
}


/* =========================================================
   AVVIO
========================================================= */

async function avviaAnimali() {

    console.log(
        "🐾 Animali: avvio..."
    );


    /*
       1. Lingua
    */

    lingua =
        getLinguaAnimali();


    applicaLinguaAnimali();


    /*
       2. Supabase
    */

    const supabaseOk =
        inizializzaSupabaseAnimali();


    /*
       3. Carichiamo la prima missione
    */

    loadMission();


    /*
       4. Se Supabase è disponibile,
          carichiamo i GP.
    */

    if (supabaseOk) {

        await caricaGreenPointsAnimali();

        inizializzaAuthAnimali();

    } else {

        console.warn(
            "Animali: gioco avviato senza Supabase."
        );

    }


    console.log(
        "🐾 Animali: avvio completato."
    );
}


/* =========================================================
   ESPORTAZIONE GLOBALE
========================================================= */

window.animaliGame = {

    getGreenPoints:
        function() {

            return greenPoints;

        },

    reloadGreenPoints:
        caricaGreenPointsAnimali,

    addGreenPoints:
        aggiungiGreenPointsAnimali,

    restart:
        restartGame

};


/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        avviaAnimali
    );

} else {

    avviaAnimali();

}
