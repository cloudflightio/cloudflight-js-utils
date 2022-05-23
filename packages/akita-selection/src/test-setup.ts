if (!('observable' in Symbol)) {
    Object.defineProperty(Symbol, 'observable', {
        value: Symbol('observable'),
    });
}
