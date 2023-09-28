const Utils = {
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