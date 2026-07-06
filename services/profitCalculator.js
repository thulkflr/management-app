const toNumber = (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : 0;
};

const roundMoney = (value) => Number(toNumber(value).toFixed(2));

export function getInvestedAmountsByPartner(transactions = []) {
    return transactions.reduce((totals, tx) => {
        if (tx.type !== 'capital' || !tx.memberId) return totals;

        totals[tx.memberId] = roundMoney((totals[tx.memberId] || 0) + toNumber(tx.amount));
        return totals;
    }, {});
}

export function withTotalInvestedAmounts(partners = [], transactions = []) {
    const investedByPartner = getInvestedAmountsByPartner(transactions);

    return partners.map(partner => {
        const transactionTotal = investedByPartner[partner.id];
        const storedTotal = toNumber(partner.totalInvestedAmount);

        return {
            ...partner,
            totalInvestedAmount: roundMoney(transactionTotal ?? storedTotal),
        };
    });
}

export function calculateProfits(partners = [], netProfit = 0) {
    const totalCapital = partners.reduce(
        (sum, partner) => sum + toNumber(partner.totalInvestedAmount),
        0
    );

    if (totalCapital === 0) {
        return partners.map(partner => ({
            partnerId: partner.id,
            percentage: 0,
            profit: 0,
            totalInvestedAmount: 0,
        }));
    }

    return partners.map(partner => {
        const totalInvestedAmount = toNumber(partner.totalInvestedAmount);
        const percentage = totalInvestedAmount / totalCapital;

        return {
            partnerId: partner.id,
            percentage,
            profit: roundMoney(toNumber(netProfit) * percentage),
            totalInvestedAmount: roundMoney(totalInvestedAmount),
        };
    });
}
