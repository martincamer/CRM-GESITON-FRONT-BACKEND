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
  subtitle: {
    fontSize: 12,
    color: "#666666",
    marginTop: 5,
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
  infoText: {
    fontSize: 10,
    marginBottom: 3,
    color: "#444444",
  },
  paymentDetails: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
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
  col1: { width: "25%" },
  col2: { width: "25%" },
  col3: { width: "25%", textAlign: "right" },
  col4: { width: "25%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    padding: 8,
    fontWeight: "bold",
  },
  totalLabel: {
    width: "20%",
    textAlign: "right",
    paddingRight: 8,
  },
  totalValue: {
    width: "25%",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#666666",
    fontSize: 10,
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 10,
  },
  observation: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
});

const PaymentProviderPDF = ({ pago, proveedor }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return amount.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  };

  const getPaymentMethod = (method) => {
    const methods = {
      EFECTIVO: "Efectivo",
      TRANSFERENCIA: "Transferencia",
      CHEQUE: "Cheque",
    };
    return methods[method] || method;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>COMPROBANTE DE PAGO</Text>
            <Text style={styles.subtitle}>
              {pago?.reference ? `#${pago.reference}` : ""}
            </Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={styles.infoText}>Fecha: {formatDate(pago?.date)}</Text>
          </View>
        </View>

        {/* Company & Provider Info */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={styles.infoGroup}>
            <Text style={styles.infoTitle}>EMPRESA</Text>
            <Text style={styles.infoText}>Tu Empresa S.A.</Text>
            <Text style={styles.infoText}>CUIT: XX-XXXXXXXX-X</Text>
            <Text style={styles.infoText}>Dirección de la Empresa</Text>
            <Text style={styles.infoText}>Ciudad, País</Text>
            <Text style={styles.infoText}>Tel: +XX XXX XXXXXX</Text>
          </View>

          <View style={styles.infoGroup}>
            <Text style={styles.infoTitle}>PROVEEDOR</Text>
            <Text style={styles.infoText}>{proveedor?.businessName}</Text>
            <Text style={styles.infoText}>CUIT: {proveedor?.taxId}</Text>
            <Text style={styles.infoText}>
              {proveedor?.address
                ? `${proveedor.address.street} ${proveedor.address.number}${
                    proveedor.address.floor
                      ? `, Piso ${proveedor.address.floor}`
                      : ""
                  }${
                    proveedor.address.apartment
                      ? `, Depto ${proveedor.address.apartment}`
                      : ""
                  }, ${proveedor.address.city}, ${proveedor.address.state} ${
                    proveedor.address.zipCode
                  }`
                : "-"}
            </Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentDetails}>
          <Text style={styles.infoTitle}>DETALLES DEL PAGO</Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ width: "48%" }}>
              <Text style={styles.infoText}>
                Método: {getPaymentMethod(pago?.paymentMethod)}
              </Text>
              {pago?.accountId && (
                <Text style={styles.infoText}>Cuenta: {pago.accountName}</Text>
              )}
            </View>
            <View style={{ width: "48%", alignItems: "flex-end" }}>
              <Text
                style={[styles.infoText, { fontSize: 12, fontWeight: "bold" }]}
              >
                Monto Total: {formatAmount(pago?.amount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoices Table */}
        <View style={styles.table}>
          <Text style={styles.infoTitle}>FACTURAS ASOCIADAS</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Número</Text>
            <Text style={styles.col2}>Fecha</Text>
            <Text style={styles.col3}>Total</Text>
            <Text style={styles.col4}>Monto Pagado</Text>
          </View>

          {pago?.invoices?.map((factura, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{factura.invoiceNumber}</Text>
              <Text style={styles.col2}>{formatDate(factura.date)}</Text>
              <Text style={styles.col3}>{formatAmount(factura.total)}</Text>
              <Text style={styles.col4}>
                {formatAmount(factura.amountPaid)}
              </Text>
            </View>
          ))}
        </View>

        {/* Observations */}
        {pago?.observation && (
          <View style={styles.observation}>
            <Text style={styles.infoTitle}>OBSERVACIONES</Text>
            <Text style={styles.infoText}>{pago.observation}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Este documento es un comprobante válido de pago
        </Text>
      </Page>
    </Document>
  );
};

export default PaymentProviderPDF;
