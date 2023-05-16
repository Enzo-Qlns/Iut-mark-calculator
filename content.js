const Utils = 
{
    sumArray: function (arr) 
    {
        return arr.reduce((a, b) => a + b, 0);
    },

    checkPair: function (nbr)
    {
        return nbr % 2 == 0 ? true : false;
    },

    roundValue: function (nbr, power) 
    {
        return Number.parseInt(nbr) && Number.parseFloat(nbr) ? Math.round((nbr) * Math.pow(10, power)) / Math.pow(10, power) : nbr;
    },

    deleteArrayValue: function(arr, value)
    {
        return arr.filter(x => x !== value);
    },
}

function request_note(onResponse)
{
    var myHeaders = new Headers();
    myHeaders.append("authority", "iut-rcc-intranet.univ-reims.fr");
    myHeaders.append("accept", "text/html, */*; q=0.01");
    myHeaders.append("accept-language", "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7");
    myHeaders.append("cookie", "PHPSESSID=h6cl7lbnof8d1craedfdbpej99; PHPSESSID=o7bcoo8rfs2jam0hhmbqm9kntu");
    myHeaders.append("referer", "https://iut-rcc-intranet.univ-reims.fr/fr/utilisateur/mon-profil");
    myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", "\"macOS\"");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("user-agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36");
    myHeaders.append("x-requested-with", "XMLHttpRequest");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://iut-rcc-intranet.univ-reims.fr/fr/etudiant/profil/elisa.maillot/notes", requestOptions)
        .then(response => response.text())
        .then(function (html) 
        {
            // Convert the HTML string into a document object
            var parser = new DOMParser();
            var document = parser.parseFromString(html, 'text/html');

            // Callback response
            onResponse(document);
        })
        .catch(function (err)
        {
            // There was an error
            console.warn('Something went wrong.', err);
        });
}

function listNote(document)
{
    var noteArray = [];
    const notes = document.querySelectorAll('table.table.table-border.table-striped .badge');
    for (note of notes)
    {
        var noteParse = Number.parseFloat(note.textContent.replace(',', '.'));
        noteArray.push(noteParse);
    }
    return noteArray;
}

function listCoef(document)
{
    var coefArray = [];
    const coefs = document.querySelectorAll("table > tbody > tr > td:nth-child(6)");
    for (coef of coefs)
    {
        var coefParse = Number.parseFloat(coef.textContent);
        coefArray.push(coefParse);
    }
    return coefArray;
}

function listDomaine(document)
{    
    var domArray = [];
    const doms = document.querySelectorAll("table > tbody > tr > td:nth-child(1)");
    for (dom of doms)
        domArray.push(dom.textContent);
    
    return domArray;
}

function createButton()
{
    const headerInfo = document.querySelector('.header-info');
    const right = document.createElement('div');
    right.classList.add('right');
    right.innerHTML = '<div class="card-header-actions"><a class="btn btn-sm btn-success" data-bs-toggle="tooltip" data-bs-placement="bottom"><i class="fa-solid fa-graduation-cap"></i> Afficher vos notes</a></div>';
    right.style.display = 'flex';
    headerInfo.append(right);
}

const button = createButton();

request_note((doc) =>
{
    var notes = listNote(doc);
    var coefficients = listCoef(doc);
    var domaines = listDomaine(doc);

    // Initialiser un objet pour stocker les notes et les coefficients par domaine
    const domainesData = {};
    for (const domaine of domaines)
        domainesData[domaine] = [];

    // Ajouter les notes et les coefficients pour chaque domaine dans l'objet
    for (let i = 0; i < domaines.length; i++) 
    {
        const domaine = domaines[i];
        const coefficient = coefficients[i];
        const note = notes[i];
        domainesData[domaine].push({ coefficient, note });
    }

    // Calculer les moyennes par domaine en prenant en compte les coefficients
    const moyennes = {};
    for (const [domaine, data] of Object.entries(domainesData)) 
    {
        let totalNote = 0;
        let totalCoef = 0;
        for (const { coefficient, note } of data) 
        {
            totalNote += coefficient * note;
            totalCoef += coefficient;
        }
        const moyenne = totalNote / totalCoef;
        moyennes[domaine] = moyenne;
    }

    document.querySelector('.right').innerHTML = moyennes;
    // // Afficher les moyennes par domaine
    // for (const [domaine, moyenne] of Object.entries(moyennes)) {
    // console.log(`Domaine ${domaine}: moyenne = ${moyenne}`);
    // }

});