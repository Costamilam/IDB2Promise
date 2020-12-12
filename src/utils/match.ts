const has = (list: any[], value: any) => {
    const index = list.indexOf(value);

    if (index === -1)
        return false;

    list.splice(index, 1);

    return true;
};

export const match = (a: any, b: any): boolean => {
    if (a === null || a === undefined || b === null || b === undefined)
        return a === b;

    if (typeof a === 'function' || typeof b === 'function')
        return a === b;

    if (a === b || a.valueOf() === b.valueOf())
        return true;

    if (a instanceof Date)
        return false;

    if ((Array.isArray(a) || Array.isArray(b)) && a.length !== b.length)
        return false;

    if (typeof a !== 'object')
        return false;

    if (typeof b !== 'object')
        return false;

    const aKeys = Object.keys(a);

    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length)
        return false;

    return bKeys.every(key => has(aKeys, key)) && aKeys.every(key => match(a[key], b[key]));
};

export const include = <TypeA extends { [key: string]: any }, TypeB extends TypeA>(a: TypeA, b: TypeB): boolean => {
    if (typeof a !== 'object' || typeof b !== 'object')
        return false;

    if (a === null || b === null)
        return a === b;

    for (const aKey in a)
        if (aKey in b === false || !match(a[aKey], b[aKey]))
            return false;

    return true;
};
