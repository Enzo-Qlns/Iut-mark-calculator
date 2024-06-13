// Add header
const styleElement = document.createElement('link');
styleElement.href = 'https://cdn.jsdelivr.net/npm/apexcharts@3.40.0/dist/apexcharts.min.css';
document.head.appendChild(styleElement);

Date.isLeapYear = function (year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

Date.getDaysInMonth = function (year, month) {
    return [31, (Date.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

Date.prototype.isLeapYear = function () {
    return Date.isLeapYear(this.getFullYear());
};

Date.prototype.getDaysInMonth = function () {
    return Date.getDaysInMonth(this.getFullYear(), this.getMonth());
};

Date.prototype.addMonths = function (value) {
    let n = this.getDate();
    this.setDate(1);
    this.setMonth(this.getMonth() + value);
    this.setDate(Math.min(n, this.getDaysInMonth()));
    return this;
};

// Action after click
let isClicked = false;
const buttonMark = createButton("Afficher vos moyennes");
buttonMark.addEventListener('click', (event) => {
    isClicked = true;
    const averageDataByUE = getAverage();
    const title = document.querySelector("#mainContent > div > div:nth-child(6) > div > h4");

    if (!Utils.isEmpty(title, averageDataByUE) && title.textContent === "Modalités de Contrôle des Connaissances") {
        let date = new Date();
        let validate_don = !Utils.isEmpty(localStorage.getItem('validate_don')) ? new Date(localStorage.getItem('validate_don')) : null;
        if (Utils.isEmpty(validate_don)) {
            toastPaypal(() => generateHtml(averageDataByUE));
            localStorage.setItem('validate_don', date.toString());
        } else if (validate_don > new Date().addMonths(1)) {
            toastPaypal(() => generateHtml(averageDataByUE));
            localStorage.setItem('validate_don', date.toString());
        } else {
            generateHtml(averageDataByUE);
        }
    }

    if (Utils.isEmpty(Object.values(averageDataByUE))) {
        alert('Aucune note n\'a été saisie');
    } else if (isClicked) {
        event.target.classList.add('disabled');
        buttonMark.querySelector('i').classList.replace("fa-eye", "fa-eye-slash");
    }
});