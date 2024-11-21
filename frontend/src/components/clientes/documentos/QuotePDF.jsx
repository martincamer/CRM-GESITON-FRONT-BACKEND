import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Registrar fuentes
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    fontSize: 11,
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#112233",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#112233",
  },
  infoText: {
    fontSize: 10,
    marginBottom: 3,
    color: "#444444",
  },
  infoGroup: {
    flexDirection: "column",
    width: "48%",
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#112233",
    marginBottom: 5,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 8,
    fontWeight: "bold",
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    padding: 8,
    fontSize: 10,
  },
  description: { width: "40%", textTransform: "capitalize" },
  quantity: { width: "15%", textAlign: "center" },
  price: { width: "15%", textAlign: "right" },
  discount: { width: "15%", textAlign: "right" },
  subtotal: { width: "15%", textAlign: "right" },
  totals: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 5,
  },
  totalLabel: {
    width: "15%",
    textAlign: "right",
    fontWeight: "bold",
    marginRight: 8,
  },
  totalValue: {
    width: "15%",
    textAlign: "right",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#666",
    fontSize: 10,
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  validUntil: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
  },
});

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatNumber = (number) => {
  if (!number) return "0";
  return number.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const QuotePDF = ({ presupuesto, cliente, productos }) => {
  const getProductName = (productId) => {
    const product = productos.find(
      (p) => p._id?.toString() === productId?.toString()
    );
    return product ? product.name : "Producto no encontrado";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PRESUPUESTO</Text>
            <Text style={styles.infoText}>#{presupuesto.quoteNumber}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.infoText}>
              Fecha: {formatDate(presupuesto.date)}
            </Text>
            <Text style={styles.infoText}>
              Válido hasta: {formatDate(presupuesto.validUntil)}
            </Text>
          </View>
        </View>

        {/* Info Sections */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.infoGroup}>
            <Text style={styles.infoTitle}>EMPRESA</Text>
            <Text style={styles.infoText}>Tu Empresa S.A.</Text>
            <Text style={styles.infoText}>Dirección de la Empresa</Text>
            <Text style={styles.infoText}>Ciudad, País</Text>
            <Text style={styles.infoText}>Tel: +XX XXX XXXXXX</Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.infoTitle}>CLIENTE</Text>
            <Text style={styles.infoText}>{cliente?.fantasyName}</Text>
            <Text style={styles.infoText}>CUIT: {cliente?.taxId}</Text>
            <Text style={styles.infoText}>
              {cliente?.address
                ? `${cliente.address.street} ${cliente.address.number}${
                    cliente.address.floor
                      ? `, Piso ${cliente.address.floor}`
                      : ""
                  }${
                    cliente.address.apartment
                      ? `, Depto ${cliente.address.apartment}`
                      : ""
                  }, ${cliente.address.city}, ${cliente.address.state} ${
                    cliente.address.zipCode
                  }`
                : "-"}
            </Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Descripción</Text>
            <Text style={styles.quantity}>Cantidad</Text>
            <Text style={styles.price}>Precio</Text>
            <Text style={styles.discount}>Descuento</Text>
            <Text style={styles.subtotal}>Subtotal</Text>
          </View>

          {presupuesto.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.description}>
                {getProductName(item.productId)}
              </Text>
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Text style={styles.price}>${formatNumber(item.unitPrice)}</Text>
              <Text style={styles.discount}>{item.discount}%</Text>
              <Text style={styles.subtotal}>
                ${formatNumber(item.subtotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ${formatNumber(presupuesto.total)}
            </Text>
          </View>
        </View>

        {/* Valid Until */}
        <View style={styles.validUntil}>
          <Text style={styles.infoTitle}>VALIDEZ DEL PRESUPUESTO</Text>
          <Text style={styles.infoText}>
            Este presupuesto es válido hasta el{" "}
            {formatDate(presupuesto.validUntil)}
          </Text>
        </View>

        {/* Observations */}
        {presupuesto.observation && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.infoTitle}>OBSERVACIONES</Text>
            <Text style={styles.infoText}>{presupuesto.observation}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>Gracias por confiar en nosotros</Text>
      </Page>
    </Document>
  );
};

export default QuotePDF;
