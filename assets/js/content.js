const Utils =
{
    sumArray: function (arr) {
        return arr.reduce((a, b) => a + b, 0);
    },

    checkPair: function (nbr) {
        return nbr % 2 == 0;
    },

    roundValue: function (nbr, power) {
        return Number.parseInt(nbr) && Number.parseFloat(nbr) ? Math.round((nbr) * Math.pow(10, power)) / Math.pow(10, power) : nbr;
    },

    deleteArrayValue: function (arr, value) {
        return arr.filter(x => x !== value);
    },
    isEmpty(...values) {
        if (values.length === 0)
            return true;
        for (let index = 0; index < values.length; index++) {
            const value = values[index];
            const isArray = Array.isArray(value);
            let bool = (undefined === value || null === value || (isArray && value.length === 0) || (typeof value === 'string' && value.length === 0));
            if (bool)
                return true;
        }
        return false;
    },
    boolToValue(bool) {
        return bool ? 'OUI' : 'NON';
    }
}

function getName(onResponse = undefined) {
    var requestOptions =
    {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("https://iut-rcc-intranet.univ-reims.fr/fr/utilisateur/mon-profil", requestOptions)
        .then(response => response.text())
        .then(function (html) {
            // Callback response
            const matches = html.matchAll(/mailto:([\w.-]+)@/gm);
            for (const match of matches)
                onResponse(match[1]);
        })
        .catch(function (err) {
            // There was an error
            console.warn('Something went wrong.', err);
        });
}

var userName;
getName((res) => {
    userName = res;
});

function request_note(onResponse = undefined) {
    var requestOptions =
    {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(`https://iut-rcc-intranet.univ-reims.fr/fr/etudiant/profil/${userName}/notes`, requestOptions)
        .then(response => response.text())
        .then(function (html) {
            // Convert the HTML string into a document object
            var parser = new DOMParser();
            var document = parser.parseFromString(html, 'text/html');

            // Callback response
            onResponse(document);
        })
        .catch(function (err) {
            // There was an error
            console.warn('Something went wrong.', err);
        });
}

function listNote(document) {
    var noteArray = [];
    const notes = document.querySelectorAll('table.table.table-border.table-striped .badge');
    for (note of notes) {
        var noteParse = Number.parseFloat(note.textContent.replace(',', '.'));
        noteArray.push(noteParse);
    }
    return noteArray;
}

function listCoef(document) {
    var coefArray = [];
    const coefs = document.querySelectorAll("table > tbody > tr > td:nth-child(6)");
    for (coef of coefs) {
        var coefParse = Number.parseFloat(coef.textContent);
        coefArray.push(coefParse);
    }
    return coefArray;
}

function listDomaine(document) {
    var domArray = [];
    const doms = document.querySelectorAll("table > tbody > tr > td:nth-child(1)");
    for (dom of doms)
        domArray.push(dom.textContent);

    return domArray;
}

function createButton() {
    const headerInfo = document.querySelector('.header-info');
    const right = document.createElement('div');
    const text = "Afficher vos moyennes";
    right.classList.add('right');
    right.innerHTML = `<div class="card-header-actions"><a class="btn btn-sm btn-success" id="buttonMark" data-bs-placement="bottom"><i class="fa-solid fa-eye"></i> ${text}</a></div>`;
    right.style.display = 'flex';
    headerInfo.append(right);
}

function createCardBody(content, title, colLength = 6) {
    const col = document.createElement('div');
    col.classList.add('col-sm-12', 'col-md-' + colLength, 'fade-in');
    col.style.margin = "0 auto";

    const card = document.createElement('div');
    card.classList.add('card');
    col.append(card);

    const header = document.createElement('header');
    header.classList.add('card-header');
    header.innerHTML = '<h4 class="card-title">' + title + '</h4>';

    const card_body = document.createElement('div');
    card_body.classList.add('card-body');
    card.append(header, card_body);

    if (content instanceof HTMLElement)
        card_body.appendChild(content);
    else
        card_body.innerHTML = content;

    return col;
}

function createChart(data, type, xaxiscategories) {
    var options = {
        series: [{
            data: data
        }],
        chart: {
            type: type,
            height: 350
        },
        colors: [
            function ({ value }) {
                if (value >= 12)
                    return "#15c377";
                else if (value === 10)
                    return "#faa64b";
                else
                    return "#f96868";
            }
        ],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
            }
        },
        dataLabels: {
            enabled: false
        },
        xaxis: {
            categories: xaxiscategories
        },
    };

    var chart = new ApexCharts(document.querySelector("#chart"), options);
    return chart.render();
}

// Add header
var styleElement = document.createElement('link');
styleElement.href = 'https://cdn.jsdelivr.net/npm/apexcharts@3.40.0/dist/apexcharts.min.css';
document.head.appendChild(styleElement);


// Marks alert
const numberMarks = Utils.isEmpty(localStorage.getItem('numberMarks')) ? Number.parseInt(document.querySelectorAll("#mainContent > div > div:nth-child(5) > div > div > table > tbody > tr").length) : Number.parseInt(localStorage.getItem('numberMarks'));
const newNumberMarks = Number.parseInt(document.querySelectorAll("#mainContent > div > div:nth-child(5) > div > div > table > tbody > tr").length);
console.log(numberMarks, newNumberMarks);

if (newNumberMarks != numberMarks) 
{
    getName(() =>
    {
        request_note((doc) => 
        {
            // create object with domaine and mark
            let notes = listNote(doc);
            let domaines = listDomaine(doc);
            const lastObject = JSON.parse(localStorage.getItem('marks'));
            const differenceObject = [];
            
            const currentObject = {};
            for (let i = 0; i < notes.length; i++)
            {
                const value = notes[i];
                const key = domaines[i];
                if (!currentObject[key])
                    currentObject[key] = [];
                
                currentObject[key].push(value);
            }

            for (let key in currentObject)
                if (currentObject[key].length != lastObject[key].length)
                    for (let i = 2; i < 4; i++)
                        if (!Utils.isEmpty(currentObject[key][i]))
                            differenceObject.push({"domaine": key, "note": currentObject[key][i]});
            
            const header = document.querySelector('.header');
            const headerInfo = document.createElement('div');
            headerInfo.classList.add('header-action');
        
            const alert = document.createElement('div');
            alert.id = 'alertMark';
            alert.classList.add('alert', 'alert-info');
            alert.innerHTML = 
                `<div>
                    <strong class='fw-semibold'> Vous avez ${differenceObject.length} nouvelle(s) note(s) ! <strong/><br>
                </div>`;

            for (let element of differenceObject)
                alert.innerHTML += `<div><span class='fw-semibold'>${element.domaine}:</span> ${element.note}</div>`
        
            headerInfo.append(alert);
            header.append(headerInfo);
            localStorage.setItem('marks', JSON.stringify(lastObject));
        });
    });
};
localStorage.setItem('numberMarks', newNumberMarks);

// Action after click
createButton();
const buttonMark = document.getElementById('buttonMark');
buttonMark.addEventListener('click', (e) => {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    request_note((doc) => {
        let notes = listNote(doc);
        let coefficients = listCoef(doc);
        let domaines = listDomaine(doc);

        // Initialiser un objet pour stocker les notes et les coefficients par domaine
        const domainesData = {};
        for (const domaine of domaines)
            domainesData[domaine] = [];

        // Ajouter les notes et les coefficients pour chaque domaine dans l'objet
        for (let i = 0; i < domaines.length; i++) {
            const domaine = domaines[i];
            const coefficient = coefficients[i];
            const note = notes[i];
            domainesData[domaine].push({ coefficient, note });
        }

        // Calculer les moyennes par domaine en prenant en compte les coefficients
        const moyennes = {};
        for (const [domaine, data] of Object.entries(domainesData)) {
            let totalNote = 0;
            let totalCoef = 0;
            for (const { coefficient, note } of data) {
                totalNote += coefficient * note;
                totalCoef += coefficient;
            }
            const moyenne = totalNote / totalCoef;
            moyennes[domaine] = moyenne;
        }

        const title = document.querySelector("#mainContent > div > div:nth-child(6) > div > h4");
        if (!Utils.isEmpty(title) && title.textContent === "Modalités de Contrôle des Connaissances") {
            const ueContent = document.querySelector("#mainContent > div > div:nth-child(6) > div");

            // Sélectionne toutes les balises span contenant les étiquettes
            const etiquettes = ueContent.querySelectorAll('span[class^="badge bg-c"]');

            // Initialise un objet pour stocker les matières regroupées par étiquettes
            const matieresParEtiquettes = {};

            // Parcourt toutes les balises span contenant les étiquettes
            etiquettes.forEach(etiquette => {
                // Récupère le nom de l'étiquette
                const nomEtiquette = etiquette.textContent.trim().match(/^.*?(?=\s*\()/gm)[0];

                // Récupère la balise td parente de l'étiquette
                const tdParent = etiquette.closest('td');

                // Récupère le nom de la matière contenue dans la balise td parente
                const nomMatiere = tdParent.previousElementSibling.textContent.trim();

                // Récupère le coefficient de la matière contenue dans la balise td parente
                const coefficient = tdParent.textContent.match(/\((.*?)\)/gm)[0].split('(')[1].split(')')[0];

                // Si l'étiquette n'a jamais été rencontrée, ajoute une nouvelle propriété à l'objet
                if (!matieresParEtiquettes[nomEtiquette])
                    matieresParEtiquettes[nomEtiquette] = [];

                // Ajoute la matière à la liste des matières associées à l'étiquette
                matieresParEtiquettes[nomEtiquette].push({ nom: nomMatiere, coefficient: coefficient });
            });

            const linkedData = {};
            // Lier les données
            for (const category in matieresParEtiquettes) {
                const courses = matieresParEtiquettes[category];
                for (const course of courses) {
                    const coefficient = course.coefficient;
                    const courseCode = course.nom.split(" | ")[0]; // Extraire le code du cours
                    if (moyennes[courseCode]) {
                        if (Utils.isEmpty(linkedData[category]))
                            linkedData[category] = [];

                        linkedData[category].push(
                            {
                                "nom": course.nom,
                                "coefficient": coefficient,
                                "valeur": moyennes[courseCode]
                            });
                    };
                };
            };

            // Calculer la moyenne des notes pour chaque étiquette
            for (const category in linkedData) {
                const courses = linkedData[category];
                let sum = 0;
                let coef = 0;
                for (const course of courses) {
                    sum += (parseFloat(course.valeur) * parseFloat(course.coefficient));
                    coef += parseFloat(course.coefficient);
                }
                const average = sum / coef;
                linkedData[category].push({ "moyenne": Utils.roundValue(average, 2) });
            }

            console.log(linkedData);
            let isAccepted = true;
            for (const [domaine, etiquette] of Object.entries(linkedData)) {
                if (Number.parseFloat(etiquette[etiquette.length - 1].moyenne) < 10)
                    isAccepted = false;
            };

            // Generation du code HTML
            const content = document.querySelector('#mainContent .row');
            const firstChild = document.querySelector("#mainContent > div > div.col-sm-12:first-child");

            const table = document.createElement('table');
            table.classList.add('table', 'table-border', 'table-striped');

            const thead = document.createElement('thead');
            const trHead = document.createElement('tr');

            for (const [domaine] of Object.entries(linkedData)) {
                const th = document.createElement('th');
                th.classList.add('text-center');
                th.innerHTML = domaine;
                trHead.append(th);
            };
            thead.append(trHead);

            const tbody = document.createElement('tbody');
            const trBody = document.createElement('tr');
            for (const [domaine, etiquette] of Object.entries(linkedData)) {
                const td = document.createElement('td');
                td.classList.add('text-center');
                td.innerHTML = `<span class="fs-11 badge ${parseFloat(etiquette[etiquette.length - 1].moyenne) < 10 ? "bg-danger" : parseFloat(etiquette[etiquette.length - 1].moyenne) <= 12 ? "bg-warning" : "bg-success"}">${parseFloat(etiquette[etiquette.length - 1].moyenne)}</span>`;
                trBody.append(td);
            };
            tbody.append(trBody);
            table.append(thead, tbody);

            const tableMarkHtml = createCardBody(table, 'Vos moyennes', 12);

            // ==== IS ACCEPTED ====
            const olIsAccepted = document.createElement('ol')
            olIsAccepted.className = 'timeline timeline-activity timeline-point-sm timeline-content-right text-left w-100';
            const liIsAccepted = document.createElement('li');
            liIsAccepted.className = 'alert alert-' + (isAccepted ? 'success' : 'danger');
            liIsAccepted.innerHTML = '<strong class="fw-semibold">Validation: </strong> ' + Utils.boolToValue(isAccepted);
            olIsAccepted.append(liIsAccepted);
            const isAcceptedHtml = createCardBody(olIsAccepted, 'Validation du semestre', 12);

            // ==== CHART ====
            const divChart = document.createElement('div')
            divChart.id = "chart";

            const divChartHtml = createCardBody(divChart, 'Aperçu de vos moyennes', 6);

            const colLeft = document.createElement('div');;
            colLeft.classList.add('col-sm-12', 'col-md-6', 'fade-in"');
            colLeft.append(isAcceptedHtml, tableMarkHtml);

            content.insertBefore(colLeft, firstChild);
            content.insertBefore(divChartHtml, firstChild);

            if (!Utils.isEmpty(colLeft.innerHTML) && !Utils.isEmpty(divChartHtml.innerHTML) && !Utils.isEmpty(document.getElementById('alertMark'))) {
                loader.style.display = 'none';
                e.target.classList.add('disabled');
                document.querySelector('#buttonMark>i').classList.replace("fa-eye", "fa-eye-slash");
            };

            var dataMarks = [];
            var dataDomain = [];
            for (const [domaine, etiquette] of Object.entries(linkedData)) {
                dataMarks.push(etiquette[etiquette.length - 1].moyenne);
                dataDomain.push(domaine);
            };

            createChart(dataMarks, 'bar', dataDomain);
        };
    });
});