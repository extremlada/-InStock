import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import React from 'react';


const styles = StyleSheet.create({
  page: { fontSize: 12, padding: 20 },
  header: { fontSize: 18, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 10 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: "row" },
  tableColHeader: { width: "20%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#eee', padding: 4 },
  tableCol: { width: "20%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  tableCellHeader: { fontWeight: 'bold' },
});

const InvoicePDF = ({ invoiceData }) => {
  const { szamla_szam, kelt, elado, vevo, fizetesi_mod, fizetesi_hatarido, megjegyzes, items } = invoiceData;

  // Összesítések számolása
  const nettoOsszeg = items.reduce((acc, item) => acc + item.netto_osszeg, 0);
  const afaOsszeg = items.reduce((acc, item) => acc + item.afa_ertek, 0);
  const bruttoOsszeg = items.reduce((acc, item) => acc + item.brutto_osszeg, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>SZÁMLA</Text>

        <View style={styles.section}>
          <Text>Számla sorszám: {szamla_szam}</Text>
          <Text>Kelt: {kelt}</Text>
        </View>

        <View style={styles.section}>
          <Text>Eladó:</Text>
          <Text>{elado.nev}</Text>
          <Text>{elado.cim}</Text>
          <Text>Adószám: {elado.adoszam}</Text>
        </View>

        <View style={styles.section}>
          <Text>Vevő:</Text>
          <Text>{vevo.nev}</Text>
          <Text>{vevo.cim}</Text>
          <Text>Adószám: {vevo.adoszam || '-'}</Text>
        </View>

        <View style={styles.section}>
          <Text>Fizetési mód: {fizetesi_mod}</Text>
          <Text>Fizetési határidő: {fizetesi_hatarido || '-'}</Text>
        </View>

        <View style={[styles.table, { marginBottom: 10 }]}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Megnevezés</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Mennyiség</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Egységár (nettó)</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>ÁFA kulcs (%)</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>ÁFA érték</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Nettó összeg</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Bruttó összeg</Text>
          </View>

          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.tableCol}>{item.termek_nev}</Text>
              <Text style={styles.tableCol}>{item.mennyiseg}</Text>
              <Text style={styles.tableCol}>{Number(item.egysegar).toFixed(2)}</Text>
              <Text style={styles.tableCol}>{Number(item.afa_kulcs).toFixed(2)}</Text>
              <Text style={styles.tableCol}>{Number(item.afa_ertek).toFixed(2)}</Text>
              <Text style={styles.tableCol}>{Number(item.netto_osszeg).toFixed(2)}</Text>
              <Text style={styles.tableCol}>{Number(item.brutto_osszeg).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text>Összesen:</Text>
          <Text>Nettó: {nettoOsszeg.toFixed(2)} Ft</Text>
          <Text>ÁFA: {afaOsszeg.toFixed(2)} Ft</Text>
          <Text>Bruttó: {bruttoOsszeg.toFixed(2)} Ft</Text>
        </View>

        <View style={styles.section}>
          <Text>Megjegyzés:</Text>
          <Text>{megjegyzes || "-"}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default InvoicePDF;