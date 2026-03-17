export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function parseMoney(value: string) {
  return Number.parseFloat(value.replace(",", ".")) || 0;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
