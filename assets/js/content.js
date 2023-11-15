/**
 * Fonction pour créer un bouton
 */
function createButton() {
    const headerInfo = document.querySelector('.header-info');
    const right = document.createElement('div');
    const text = "Afficher vos moyennes";
    right.classList.add('right');
    right.innerHTML = `<div class="card-header-actions"><a class="btn btn-sm btn-success" id="buttonMark" data-bs-placement="bottom"><i class="fa-solid fa-eye"></i> ${text}</a></div>`;
    right.style.display = 'flex';
    headerInfo.append(right);
}

/**
 * Fonction pour créer un carte
 * @param {String} content 
 * @param {String} title 
 * @param {Number} colLength 
 * @returns 
 */
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
    card_body.style.overflow = 'auto';
    card.append(header, card_body);

    if (content instanceof HTMLElement)
        card_body.appendChild(content);
    else
        card_body.innerHTML = content;

    return col;
}

/**
 * Fonction pour créer un graphique
 * @param {String} data 
 * @param {String} type 
 * @param {String} xaxiscategories 
 * @returns 
 */
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
		if (value < 10)
		    return "#f96868"
                else if (value <= 12)
                    return "#faa64b";
                else
                    return "#15c377";
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

/**
 * Fonction qui calcule la moyenne
 */
function getAverage() {
    const listNote = document.querySelectorAll("#mainContent > div.row > div:nth-child(5) > div > div > table > tbody tr");
    const listModal = document.querySelectorAll("#mainContent > div.row > div:nth-child(6) > div > div > table > tbody tr");

    const notesData = {}
    for (const elt of listNote) {
        let nameMoy = elt.children[0].textContent.trim();
        let note = Number.parseFloat(elt.children[4].children[0].textContent);
        let coef = Number.parseFloat(elt.children[5].textContent);

        if (!notesData[nameMoy]) {
            notesData[nameMoy] = [];
        };

        notesData[nameMoy].push({ note: note, coef: coef });
    };


    const coursesData = {};
    listModal.forEach(elt => {
        let name = elt.children[0].textContent.split('|')[0].trim();
        for (const ue of elt.children[1].children) {
            let nameUe = ue.textContent.split('(')[0].trim();
            let coefUe = ue.textContent.match(/\((.*?)\)/)[1];

            if (!coursesData[name]) {
                coursesData[name] = [];
            };
            coursesData[name].push({
                nameUe: nameUe,
                coefUe: Number.parseFloat(coefUe)
            });
        };
    });
    // Créez un objet pour stocker les résultats par UE
    const resultDataByUE = {};

    // Parcourez les clés du deuxième objet (notesData)
    for (const courseId in notesData) {
        // Vérifiez si le cours existe dans le premier objet (coursesData)
        if (coursesData.hasOwnProperty(courseId)) {
            // Obtenez les données du cours du premier objet
            const courseInfo = coursesData[courseId];

            // Obtenez les données de notes du deuxième objet
            const noteInfo = notesData[courseId][0]; // Nous supposons qu'il y a une seule entrée dans la liste des notes

            // Parcourez les cours du premier objet pour regrouper par UE
            courseInfo.forEach(course => {
                const ueName = course.nameUe;
                const ueCoefficient = course.coefUe;

                // Vérifiez si l'UE existe dans le résultat par UE
                if (!resultDataByUE.hasOwnProperty(ueName)) {
                    // Si elle n'existe pas, initialisez-la avec un objet vide
                    resultDataByUE[ueName] = {
                        totalNote: 0,
                        totalCoefficient: 0
                    };
                }

                // Ajoutez la note pondérée et le coefficient de ce cours à l'UE correspondante
                resultDataByUE[ueName].totalNote += noteInfo.note * ueCoefficient;
                resultDataByUE[ueName].totalCoefficient += ueCoefficient;
            });
        }
    }

    // Maintenant, calculez la moyenne pour chaque UE
    const averageDataByUE = {};

    for (const ueName in resultDataByUE) {
        const ueData = resultDataByUE[ueName];
        const average = ueData.totalNote / ueData.totalCoefficient;
        if (!Number.isNaN(average)) {
            averageDataByUE[ueName] = average;
        };
    }
    return averageDataByUE;
}

// Add header
var styleElement = document.createElement('link');
styleElement.href = 'https://cdn.jsdelivr.net/npm/apexcharts@3.40.0/dist/apexcharts.min.css';
document.head.appendChild(styleElement);

// Action after click
createButton();
const buttonMark = document.getElementById('buttonMark');
buttonMark.addEventListener('click', (e) => {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const averageDataByUE = getAverage(); console.log(averageDataByUE);
    const title = document.querySelector("#mainContent > div > div:nth-child(6) > div > h4");
    if (!Utils.isEmpty(title, averageDataByUE) && title.textContent === "Modalités de Contrôle des Connaissances") {
        let isAccepted = true;
        for (const [domaine, note] of Object.entries(averageDataByUE)) {
            if (Number.parseFloat(note) < 10) {
                isAccepted = false;
            };
        };

        // Generation du code HTML
        const content = document.querySelector('#mainContent>div:first-child');
        const firstChild = document.querySelector("#mainContent > div > div:first-child");

        const table = document.createElement('table');
        table.classList.add('table', 'table-border', 'table-striped');

        const thead = document.createElement('thead');
        const trHead = document.createElement('tr');

        for (const [domaine] of Object.entries(averageDataByUE)) {
            const th = document.createElement('th');
            th.classList.add('text-center');
            th.innerHTML = domaine;
            trHead.append(th);
        };
        thead.append(trHead);

        const tbody = document.createElement('tbody');
        const trBody = document.createElement('tr');
        for (const [domaine, note] of Object.entries(averageDataByUE)) {
            const td = document.createElement('td');
            td.classList.add('text-center');
            td.innerHTML = `<span class="fs-11 badge ${parseFloat(note) < 10 ? "bg-danger" : parseFloat(note) <= 12 ? "bg-warning" : "bg-success"}">${Utils.roundValue(note, 2)}</span>`;
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

        const colLeft = document.createElement('div');
        colLeft.classList.add('col-sm-12', 'col-md-6', 'fade-in"');
        colLeft.append(isAcceptedHtml, tableMarkHtml);

        const mainRow = document.createElement('div');
        mainRow.classList.add('row');
        mainRow.append(colLeft, divChartHtml);

        content.insertBefore(mainRow, firstChild);

        if (Utils.isEmpty(Object.values(averageDataByUE))) {
            alert('Aucune note n\'a été saisie');
        } else if (!Utils.isEmpty(colLeft.innerHTML) && !Utils.isEmpty(divChartHtml.innerHTML)) {
            loader.style.display = 'none';
            e.target.classList.add('disabled');
            document.querySelector('#buttonMark>i').classList.replace("fa-eye", "fa-eye-slash");
        };

        var dataMarks = [];
        var dataDomain = [];
        for (const [domaine, note] of Object.entries(averageDataByUE)) {
            dataMarks.push(Utils.roundValue(note, 2));
            dataDomain.push(domaine);
        };

        createChart(dataMarks, 'bar', dataDomain);
    };
});
