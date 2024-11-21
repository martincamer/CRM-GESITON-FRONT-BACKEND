export const formatearDinero = (cantidad) => {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(cantidad);
};

// Función alternativa con símbolo personalizado
export const formatearPesos = (cantidad) => {
  const numero = Number(cantidad)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return `$ ${numero}`;
};
