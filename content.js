const Utils = 
{
    sumArray: function (arr)
    {
        return arr.reduce((a, b) => a + b, 0);
    },

    checkPair: function (nbr)
    {
        return nbr % 2 == 0;
    },

    roundValue: function (nbr, power)
    {
        return Number.parseInt(nbr) && Number.parseFloat(nbr) ? Math.round((nbr) * Math.pow(10, power)) / Math.pow(10, power) : nbr;
    },

    deleteArrayValue: function(arr, value)
    {
        return arr.filter(x => x !== value);
    },
    isEmpty(...values)
    {
        if(values.length === 0)
            return true;
        for(let index = 0; index < values.length; index++) 
        {
            const value = values[index];
            const isArray = Array.isArray(value);
            let bool = (undefined === value || null === value || (isArray && value.length === 0) || (typeof value === 'string' && value.length === 0));
            if(bool)
                return true;
        }
        return false;
    },
}

function getName(onResponse = undefined)
{
    var requestOptions = 
    {
        method: 'GET',
        redirect: 'follow'
    };
        
    fetch("https://iut-rcc-intranet.univ-reims.fr/fr/utilisateur/mon-profil", requestOptions)
        .then(response => response.text())
        .then(function (html) 
        {
            // Callback response
            const matches = html.matchAll(/mailto:(\w+.\w+)/gm); 
            for (const match of matches)
                onResponse(match[1]);
        })
        .catch(function (err)
        {
            // There was an error
            console.warn('Something went wrong.', err);
        });
}

var userName;
getName((res) =>
{
    userName = res;
})

function request_note(onResponse = undefined)
{
    var requestOptions = 
    {
        method: 'GET',
        redirect: 'follow'
    };

    fetch(`https://iut-rcc-intranet.univ-reims.fr/fr/etudiant/profil/${userName}/notes`, requestOptions)
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
    const text = "Afficher vos moyennes";
    right.classList.add('right');
    right.innerHTML = `<div class="card-header-actions"><a class="btn btn-sm btn-success" id="buttonMark" data-bs-placement="bottom"><i class="fa-solid fa-eye"></i> ${text}</a></div>`;
    right.style.display = 'flex';
    headerInfo.append(right);
}

const button = createButton();
const buttonMark = document.getElementById('buttonMark');
buttonMark.addEventListener('click', (e) =>
{
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

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

        const title = document.querySelector("#mainContent > div > div:nth-child(6) > div > h4");
        if (!Utils.isEmpty(title) && title.textContent === "Modalités de Contrôle des Connaissances")
        {
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
            for (const category in matieresParEtiquettes) 
            {
                const courses = matieresParEtiquettes[category];
                for (const course of courses) 
                {
                    const coefficient = course.coefficient;
                    const courseCode = course.nom.split(" | ")[0]; // Extraire le code du cours
                    if (moyennes[courseCode]) 
                    {
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
            for (const category in linkedData) 
            {
                const courses = linkedData[category];
                let sum = 0;
                let coef = 0;
                for (const course of courses) 
                {
                    sum += (parseFloat(course.valeur) * parseFloat(course.coefficient));
                    coef += parseFloat(course.coefficient);
                }
                const average = sum / coef;
                linkedData[category].push({ "moyenne": Utils.roundValue(average, 2) });
            }

            console.log(linkedData);
            const data = linkedData;

            // Generation du code HTML
            const content = document.querySelector('#mainContent .row');

            const col = document.createElement('div');
            col.classList.add('col-sm-12', 'col-md-6', 'fade-in');
            col.style.margin = "0 auto";

            const card = document.createElement('div');
            card.classList.add('card');
            col.append(card);

            const header = document.createElement('header');
            header.classList.add('card-header');
            header.innerHTML = '<h4 class="card-title">Vos moyennes</h4>';

            const card_body = document.createElement('div');
            card_body.classList.add('card-body');
            card.append(header, card_body);

            // card_body.innerHTML = '<table> <tr> <th>Matière</th> <th>Nom</th> <th>Coefficient</th> <th>Valeur</th> </tr><tr> <th rowspan="6">Marketing</th> <td>STAGE | Stage S2</td><td>1</td><td>14.2</td></tr><tr> <td>R2.06 | Techniques quantitatives et représentations - 2</td><td>0.5</td><td>19.4</td></tr><tr> <td>R2.08 | Canaux de commercialisation et de distribution</td><td>1</td><td>15.2</td></tr><tr> <td>R2.13 | Ressources et culture numériques - 2</td><td>0.5</td><td>18.2</td></tr><tr> <td colspan="3">Moyenne: 16.07</td></tr><tr> <th rowspan="6">Vente</th> <td>STAGE | Stage S2</td><td>1</td><td>14.2</td></tr><tr> <td>R2.02 | Prospection et négociation</td><td>3</td><td>11</td></tr><tr> <td>R2.06 | Techniques quantitatives et représentations - 2</td><td>0.5</td><td>19.4</td></tr><tr> <td>R2.13 | Ressources et culture numériques - 2</td><td>0.5</td><td>18.2</td></tr><tr> <td colspan="3">Moyenne: 13.2</td></tr><tr> <th rowspan="6">Communication commerciale</th> <td>STAGE | Stage S2</td><td>1</td><td>14.2</td></tr><tr> <td>R2.03 | Moyens de la communication commerciale</td><td>3</td><td>14.716</td></tr><tr> <td>R2.06 | Techniques quantitatives et représentations - 2</td><td>0.5</td><td>19.4</td></tr><tr> <td>R2.13 | Ressources et culture numériques - 2</td><td>0.5</td><td>18.2</td></tr><tr> <td colspan="3">Moyenne: 15.43</td></tr></table>';

            const table = document.createElement('table');
            table.classList.add('table', 'table-border', 'table-striped');

            const thead = document.createElement('thead');
            const trHead = document.createElement('tr');
            card_body.append(table)
                
            for (const [domaine] of Object.entries(linkedData))
            {
                const th = document.createElement('th');
                th.classList.add('text-center');
                th.innerHTML = domaine;
                trHead.append(th);
            };
            thead.append(trHead);

            const tbody = document.createElement('tbody');
            const trBody = document.createElement('tr');
            for (const [domaine, etiquette] of Object.entries(linkedData))
            {
                const td = document.createElement('td');
                td.classList.add('text-center');
                td.innerHTML = `<span class="fs-11 badge ${parseFloat(etiquette[etiquette.length - 1].moyenne) < 10 ? "bg-danger" : parseFloat(etiquette[etiquette.length - 1].moyenne) <= 12 ? "bg-warning" : "bg-success"}">${parseFloat(etiquette[etiquette.length - 1].moyenne)}</span>`;
                trBody.append(td);
            };
            tbody.append(trBody);

            table.append(thead, tbody); 

            const firstChild = document.querySelector("#mainContent > div > div.col-sm-12.col-md-8:first-child");
            content.insertBefore(col, firstChild);

            if (!Utils.isEmpty(col.innerHTML))
            {
                loader.style.display = 'none';
                e.target.classList.add('disabled');
                document.querySelector('#buttonMark>i').classList.replace("fa-eye", "fa-eye-slash");
            };
        };
    });
});