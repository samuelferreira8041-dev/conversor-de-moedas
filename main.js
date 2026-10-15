const convertButton = document.querySelector('.convert-button')
const currencySelect = document.querySelector('.currency-select')
const currencyFromSelect = document.querySelector('.currency-from-select')

const currencyData = {
    brl: { label: 'Real Brasileiro', symbol: 'R$', code: 'BRL', flag: '🇧🇷' },
    usd: { label: 'Dólar Americano', symbol: 'US$', code: 'USD', flag: '🇺🇸' },
    eur: { label: 'Euro', symbol: '€', code: 'EUR', flag: '🇪🇺' },
    gbp: { label: 'Libra Esterlina', symbol: '£', code: 'GBP', flag: '🇬🇧' },
    jpy: { label: 'Iene Japonês', symbol: '¥', code: 'JPY', flag: '🇯🇵' },
    cad: { label: 'Dólar Canadense', symbol: 'C$', code: 'CAD', flag: '🇨🇦' },
    chf: { label: 'Franco Suíço', symbol: 'CHF', code: 'CHF', flag: '🇨🇭' },
    aud: { label: 'Dólar Australiano', symbol: 'A$', code: 'AUD', flag: '🇦🇺' },
    btc: { label: 'Bitcoin', symbol: '₿', code: 'BTC', flag: '₿' }
}


let exchangeRates = {
    brl: 1,
    usd: 0.1923,
    eur: 0.1785,
    gbp: 0.1548,
    jpy: 28.4,
    cad: 0.266,
    chf: 0.183,
    aud: 0.287
}


async function loadExchangeRates() {
    const currencyCodes = Object.values(currencyData)
        .filter(currency => currency.code !== 'BRL')
        .map(currency => `${currency.code}-BRL`)
        .join(',')
    const response = await fetch(`https://economia.awesomeapi.com.br/last/${currencyCodes}`)
    if (!response.ok) {
        throw new Error(`Falha ao buscar cotações: ${response.status}`)
    }
    const data = await response.json()

    const updatedRates = { brl: 1 }
    for (const [currencyKey, currency] of Object.entries(currencyData)) {
        if (currency.code === 'BRL') continue

        const rateInBrl = Number(data[`${currency.code}BRL`]?.bid)
        if (!Number.isFinite(rateInBrl) || rateInBrl <= 0) {
            throw new Error(`A API retornou uma cotação inválida para ${currency.label}.`)
        }

        updatedRates[currencyKey] = 1 / rateInBrl
    }

    exchangeRates = updatedRates
    convertValues()
}

function parseCurrencyValue(value) {
    if (!value) return 0

    const normalizedValue = value.replace('.', '').replace(',', '.')
    const numericValue = Number(normalizedValue)

    return Number.isFinite(numericValue) ? numericValue : 0
}

function formatCurrency(value, currencyKey) {
    const currency = currencyData[currencyKey] || currencyData.brl
    if (currencyKey === 'btc') {
        const formattedValue = new Intl.NumberFormat('pt-BR', {
            maximumFractionDigits: 8
        }).format(value)
        return `${currency.symbol} ${formattedValue}`
    }

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency.code
    }).format(value)
}

function convertBetween(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount

    const amountInBrl = amount / exchangeRates[fromCurrency]
    return amountInBrl * exchangeRates[toCurrency]
}

function updateCurrencyDisplay() {
    const fromCurrency = currencyData[currencyFromSelect.value]
    const toCurrency = currencyData[currencySelect.value]

    const fromFlag = document.getElementById('from-flag')
    const toFlag = document.getElementById('to-flag')
    const fromName = document.getElementById('from-currency-name')
    const toName = document.getElementById('currency-name')

    if (fromFlag) fromFlag.textContent = fromCurrency.flag
    if (toFlag) toFlag.textContent = toCurrency.flag
    if (fromName) fromName.textContent = fromCurrency.label
    if (toName) toName.textContent = toCurrency.label
}

function convertValues() {
    const inputCurrencyValue = parseCurrencyValue(document.querySelector('.input-currency').value)
    const fromCurrency = currencyFromSelect.value
    const toCurrency = currencySelect.value
    const currencyValueToConvert = document.querySelector('.currency-value-to-convert')
    const currencyValueConverted = document.querySelector('.currency-value')

    currencyValueToConvert.textContent = formatCurrency(inputCurrencyValue, fromCurrency)
    if (!Number.isFinite(exchangeRates[fromCurrency]) || !Number.isFinite(exchangeRates[toCurrency])) {
        currencyValueConverted.textContent = 'Cotação indisponível'
        return
    }

    const convertedValue = convertBetween(inputCurrencyValue, fromCurrency, toCurrency)

    currencyValueConverted.textContent = formatCurrency(convertedValue, toCurrency)


}

function changeCurrency() {
    updateCurrencyDisplay()
    convertValues()
}

currencySelect.addEventListener('change', changeCurrency)
currencyFromSelect.addEventListener('change', changeCurrency)
convertButton.addEventListener('click', convertValues)

updateCurrencyDisplay()
convertValues()

loadExchangeRates().catch(error => {
    console.error('Não foi possível carregar as cotações:', error)
})
