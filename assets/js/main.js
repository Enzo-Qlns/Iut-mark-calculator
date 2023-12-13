// Add header
const styleElement = document.createElement('link');
styleElement.href = 'https://cdn.jsdelivr.net/npm/apexcharts@3.40.0/dist/apexcharts.min.css';
document.head.appendChild(styleElement);

// Action after click
let isClicked = false;
const buttonMark = createButton("Afficher vos moyennes");
buttonMark.addEventListener('click', (event) => {
    isClicked = true;
    const averageDataByUE = getAverage();
    const title = document.querySelector("#mainContent > div > div:nth-child(6) > div > h4");

    if (!Utils.isEmpty(title, averageDataByUE) && title.textContent === "Modalités de Contrôle des Connaissances") {
        toastPaypal(() => generateHtml(averageDataByUE));
        console.table(averageDataByUE);
    }

    if (Utils.isEmpty(Object.values(averageDataByUE))) {
        alert('Aucune note n\'a été saisie');
    } else if (isClicked) {
        event.target.classList.add('disabled');
        document.querySelector('#buttonMark>i').classList.replace("fa-eye", "fa-eye-slash");
    };
});