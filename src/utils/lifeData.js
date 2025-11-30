import { differenceInWeeks, addWeeks, format, getYear, differenceInYears, startOfWeek, endOfWeek, startOfYear } from 'date-fns';
import { it } from 'date-fns/locale';

export const generateLifeData = (birthDateString) => {
    if (!birthDateString) return null;

    const birthDate = new Date(birthDateString);
    const today = new Date();
    const currentYear = getYear(today);
    const birthYear = getYear(birthDate);

    // Calcoli Statistici
    const LIFE_EXPECTANCY_REFERENCE = 90;
    const totalWeeksLived = differenceInWeeks(today, birthDate);
    const lifeExpectancyWeeks = LIFE_EXPECTANCY_REFERENCE * 52;
    const percentage = Math.min(100, Math.max(0, ((totalWeeksLived / lifeExpectancyWeeks) * 100).toFixed(1)));

    const years = [];
    const yearsToShow = currentYear - birthYear;

    for (let i = 0; i <= yearsToShow; i++) {
        const yearNum = birthYear + i;

        // Calcoliamo l'età precisa al 1° Gennaio di quell'anno
        const startOfYearDate = new Date(yearNum, 0, 1);
        let age = differenceInYears(startOfYearDate, birthDate);
        if (age < 0) age = 0;

        let eraName = "";
        if (age < 12) eraName = "Infanzia";
        else if (age < 20) eraName = "Adolescenza";
        else if (age < 30) eraName = "Vent'anni";
        else if (age < 40) eraName = "Trent'anni";
        else if (age < 50) eraName = "Quarant'anni";
        else if (age < 60) eraName = "Cinquant'anni";
        else if (age < 70) eraName = "Sessant'anni";
        else if (age < 80) eraName = "Settant'anni";
        else if (age < 90) eraName = "Ottant'anni";
        else eraName = "Leggenda";

        const isPast = yearNum < currentYear;
        const isCurrent = yearNum === currentYear;

        years.push({
            year: yearNum,
            age: age,
            eraName,
            isPast,
            isCurrent,
        });
    }

    return {
        years,
        totalWeeksLived,
        percentage
    };
};

// --- FIX CALCOLO SETTIMANE (LUNEDI - DOMENICA) ---
export const getWeekDateRange = (birthDateString, year, weekIndex) => {
    const birthDate = new Date(birthDateString);

    // 1. Troviamo il 1° Gennaio dell'anno richiesto
    const firstJan = new Date(year, 0, 1);

    // 2. Troviamo il PRIMO LUNEDÌ che fa parte della prima settimana dell'anno (o l'inizio della settimana ISO)
    // weekStartsOn: 1 significa LUNEDÌ
    const startOfFirstWeek = startOfWeek(firstJan, { weekStartsOn: 1 });

    // 3. Aggiungiamo le settimane per arrivare a quella giusta
    const weekStartDate = addWeeks(startOfFirstWeek, weekIndex);

    // 4. Calcoliamo la fine della settimana (Domenica)
    const weekEndDate = endOfWeek(weekStartDate, { weekStartsOn: 1 });

    // 5. Età precisa
    const age = differenceInYears(weekStartDate, birthDate);

    return {
        start: format(weekStartDate, 'd MMM', {locale: it}),
        end: format(weekEndDate, 'd MMM yyyy', {locale: it}),
        age: age
    };
};