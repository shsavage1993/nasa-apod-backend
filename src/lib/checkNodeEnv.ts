export const inDevOrProd = () => {
    if (process.env.NODE_ENV) {
        if (['development', 'production'].includes(process.env.NODE_ENV)) return true
        else return false
    }
    else return false
}

export const inDevTest = () => {
    if (process.env.NODE_ENV === 'devTest') return true
    else return false
}