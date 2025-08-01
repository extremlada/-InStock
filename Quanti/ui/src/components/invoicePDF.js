import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: { fontSize: 12, padding: 20 },
  header: { fontSize: 18, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' },
  section: { marginBottom: 10 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { flexDirection: "row" },
  tableColHeader: { width: "14.3%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#eee', padding: 4 },
  tableCol: { width: "14.3%", borderStyle: "solid", borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0, padding: 4 },
  tableCellHeader: { fontWeight: 'bold', fontSize: 10 },
  tableCell: { fontSize: 9 },
});

const InvoicePDF = ({ invoiceData }) => {
  // Frissített adatstruktúra kezelése - az új stepper formátumhoz
  const fejlec = invoiceData.fejlec || {};
  const elado = invoiceData.elado || {};
  const vevo = invoiceData.vevo || {};
  const tetelek = invoiceData.tetelek || invoiceData.items || [];

  // Összesítések számolása az új mezőnevekkel
  const nettoOsszeg = tetelek.reduce((acc, item) => {
    return acc + (parseFloat(item.nettoErtek || item.netto_osszeg || 0));
  }, 0);
  
  const afaOsszeg = tetelek.reduce((acc, item) => {
    return acc + (parseFloat(item.afaErtek || item.afa_ertek || 0));
  }, 0);
  
  const bruttoOsszeg = tetelek.reduce((acc, item) => {
    return acc + (parseFloat(item.bruttoErtek || item.brutto_osszeg || 0));
  }, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>SZÁMLA</Text>

        <View style={styles.section}>
          <Text>Számla sorszám: {fejlec.szamlaszam || invoiceData.szamla_szam || '-'}</Text>
          <Text>Kelt: {fejlec.keltDatum || invoiceData.kelt || '-'}</Text>
          <Text>Teljesítés: {fejlec.teljesitesDatum || '-'}</Text>
        </View>

        <View style={styles.section}>
          <Text>Eladó:</Text>
          <Text>{elado.nev || '-'}</Text>
          <Text>{elado.irsz || ''} {elado.telepules || ''}</Text>
          <Text>{elado.cim || '-'}</Text>
          <Text>Adószám: {elado.adoszam || '-'}</Text>
        </View>

        <View style={styles.section}>
          <Text>Vevő:</Text>
          <Text>{vevo.nev || '-'}</Text>
          <Text>{vevo.irsz || ''} {vevo.telepules || ''}</Text>
          <Text>{vevo.cim || '-'}</Text>
          <Text>Adószám: {vevo.adoszam || '-'}</Text>
        </View>

        <View style={styles.section}>
          <Text>Fizetési mód: {fejlec.fizmod || invoiceData.fizetesi_mod || '-'}</Text>
          <Text>Fizetési határidő: {fejlec.fizetesiHataridoDatum || invoiceData.fizetesi_hatarido || '-'}</Text>
        </View>

        <View style={[styles.table, { marginBottom: 10 }]}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Megnevezés</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Mennyiség</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>M.egys.</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Nettó egységár</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>ÁFA kulcs (%)</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Nettó érték</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>ÁFA érték</Text>
            <Text style={[styles.tableColHeader, styles.tableCellHeader]}>Bruttó érték</Text>
          </View>

          {tetelek.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {item.megnevezes || item.termek_nev || item.name || '-'}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {Number(item.mennyiseg || item.quantity || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {item.mertekegyseg || 'db'}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {Number(item.nettoEgysegar || item.egysegar || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {Number(item.afakulcs || item.afa_kulcs || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {Number(item.nettoErtek || item.netto_osszeg || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {Number(item.afaErtek || item.afa_ertek || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.tableCell]}>
                {Number(item.bruttoErtek || item.brutto_osszeg || 0).toFixed(2)}
              </Text>
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
          <Text>{fejlec.megjegyzes || invoiceData.megjegyzes || "-"}</Text>
        </View>

      </Page>
    </Document>
  );
};

export default InvoicePDF;