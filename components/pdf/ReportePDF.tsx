// components/pdf/ReportePDF.tsx
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer"

interface RowData {
  question_text: string
  option_text: string
  cantidad: number
}

interface Filters {
  dre?: string
  ugel?: string
  colegio?: string
  tipoEncuesta?: string
}

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 10 },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 4
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 4
  },
  cellHeader: {
    flex: 1,
    fontWeight: "bold",
  },
  cell: {
    flex: 1,
  },
  filtersBox: {
    marginBottom: 12
  },
  filterItem: {
    fontSize: 11,
    marginBottom: 2
  }
})

export default function ReportePDF({
  rows,
  filters
}: {
  rows: RowData[];
  filters: Filters;
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Reporte de Resultados de "Tu Voz Nos Importa"</Text>
        <View style={styles.filtersBox}>
          {filters?.dre && (
            <Text style={styles.filterItem}>DRE: {filters.dre}</Text>
          )}
          {filters?.ugel && (
            <Text style={styles.filterItem}>UGEL: {filters.ugel}</Text>
          )}
          {filters?.colegio && (
            <Text style={styles.filterItem}>
              Colegio: {String(filters.colegio || "")}
            </Text>
          )}
          {filters?.tipoEncuesta && (
            <Text style={styles.filterItem}>Tipo de Encuesta: {filters.tipoEncuesta}</Text>
          )}
        </View>

        <View>
          <View style={styles.headerRow}>
            <Text style={styles.cellHeader}>Pregunta</Text>
            <Text style={styles.cellHeader}>Opción</Text>
            <Text style={styles.cellHeader}>Cantidad</Text>
          </View>

          {rows.map((r, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cell}>{r.question_text}</Text>
              <Text style={styles.cell}>{r.option_text}</Text>
              <Text style={styles.cell}>{String(r.cantidad)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
