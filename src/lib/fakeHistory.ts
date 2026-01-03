export function generateFakeHistory(currentPrice: number, days = 30) {
  const data: number[] = [];
  let price = currentPrice;

  for (let i = days; i >= 0; i--) {
    // simulate daily drift ±2%
    const change = (Math.random() - 0.5) * 0.04;
    price = price * (1 + change);
    data.unshift(Number(price.toFixed(2)));
  }

  return data;
}

export function generateDates(days = 30) {
  const dates = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(d.toLocaleDateString());
  }

  return dates;
}
