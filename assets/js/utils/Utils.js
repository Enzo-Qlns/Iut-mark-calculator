const Utils = {
    isEmpty: function(...values) {
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
    
    sumArray: function (arr) {
        return arr.reduce((a, b) => a + b, 0);
    },

    checkPair: function (nbr) {
        return nbr % 2 == 0;
    },

    roundValue: function (nombre, chiffresApresVirgule) {
        if (isNaN(nombre) || isNaN(chiffresApresVirgule)) {
            return "Veuillez entrer des valeurs numériques valides.";
        }
        const factor = Math.pow(10, chiffresApresVirgule);
        const nombreArrondi = Math.round(nombre * factor) / factor;
        return Number.parseFloat(nombreArrondi);
    },

    deleteArrayValue: function (arr, value) {
        return arr.filter(x => x !== value);
    },

    boolToValue: function(bool) {
        return bool ? 'OUI' : 'NON';
    }
}