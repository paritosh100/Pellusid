// Type declaration for astronomia module
declare module 'astronomia' {
    export namespace julian {
        class CalendarGregorian {
            constructor(year: number, month: number, day: number);
            toJD(): number;
        }
    }

    export namespace solar {
        class Solar {
            constructor(jd: number);
            apparentLongitude(): number;
        }
    }

    export namespace moonposition {
        class Position {
            constructor(jd: number);
            geocentric(): { lon: number; lat: number; range: number };
        }
    }

    export namespace sidereal {
        function apparent(jd: number): number;
    }
}
