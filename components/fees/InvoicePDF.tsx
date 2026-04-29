'use client'

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import type { Fee } from '@/types/app.types'

interface InvoicePDFProps {
  fee: Fee
  studentName: string
  academyName?: string
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #d4a843',
    paddingBottom: 15,
  },
  academyName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: '#666',
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    color: '#666',
    width: '40%',
  },
  value: {
    fontFamily: 'Helvetica-Bold',
    width: '60%',
    textAlign: 'right',
  },
  divider: {
    borderBottom: '1 solid #eee',
    marginVertical: 8,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f0e6',
    padding: 8,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #eee',
  },
  col1: { width: '40%' },
  col2: { width: '20%', textAlign: 'right' },
  col3: { width: '20%', textAlign: 'right' },
  col4: { width: '20%', textAlign: 'right' },
  totalSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #d4a843',
  },
  statusBadge: {
    marginTop: 15,
    padding: '6 12',
    borderRadius: 4,
    alignSelf: 'flex-start',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTop: '1 solid #eee',
    paddingTop: 10,
  },
})

function getStatusStyle(status: string) {
  switch (status) {
    case 'paid':
      return { backgroundColor: '#d4edda', color: '#155724' }
    case 'partially_paid':
      return { backgroundColor: '#fff3cd', color: '#856404' }
    case 'unpaid':
      return { backgroundColor: '#f8d7da', color: '#721c24' }
    default:
      return { backgroundColor: '#e2e3e5', color: '#383d41' }
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'paid':
      return 'PAID'
    case 'partially_paid':
      return 'PARTIALLY PAID'
    case 'unpaid':
      return 'UNPAID'
    default:
      return status.toUpperCase()
  }
}

function InvoiceDocument({ fee, studentName, academyName = 'Chess Academy' }: InvoicePDFProps) {
  const monthLabel = new Date(fee.month + 'T00:00:00').toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.academyName}>{academyName}</Text>
          <Text style={styles.subtitle}>Fee Invoice</Text>
        </View>

        {/* Invoice Info */}
        <Text style={styles.invoiceTitle}>Invoice — {monthLabel}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Student Name</Text>
          <Text style={styles.value}>{studentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Billing Month</Text>
          <Text style={styles.value}>{monthLabel}</Text>
        </View>
        {fee.due_date && (
          <View style={styles.row}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>
              {new Date(fee.due_date + 'T00:00:00').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {/* Fee Breakdown Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>Description</Text>
            <Text style={styles.col2}>Due</Text>
            <Text style={styles.col3}>Paid</Text>
            <Text style={styles.col4}>Balance</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.col1}>Monthly Coaching Fee — {monthLabel}</Text>
            <Text style={styles.col2}>₹{Number(fee.amount_due).toLocaleString('en-IN')}</Text>
            <Text style={styles.col3}>₹{Number(fee.amount_paid).toLocaleString('en-IN')}</Text>
            <Text style={styles.col4}>₹{Number(fee.balance).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.row}>
            <Text style={[styles.label, { fontFamily: 'Helvetica-Bold' }]}>Total Amount Due</Text>
            <Text style={styles.value}>₹{Number(fee.amount_due).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { fontFamily: 'Helvetica-Bold' }]}>Total Paid</Text>
            <Text style={styles.value}>₹{Number(fee.amount_paid).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, { fontFamily: 'Helvetica-Bold', fontSize: 12 }]}>Outstanding Balance</Text>
            <Text style={[styles.value, { fontSize: 12 }]}>₹{Number(fee.balance).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, getStatusStyle(fee.status)]}>
          <Text>{getStatusLabel(fee.status)}</Text>
        </View>

        {/* Notes */}
        {fee.notes && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: '#666', marginBottom: 4 }}>Notes:</Text>
            <Text>{fee.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString('en-IN')} • {academyName}
        </Text>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(fee: Fee, studentName: string): Promise<Blob> {
  const blob = await pdf(
    <InvoiceDocument fee={fee} studentName={studentName} />
  ).toBlob()
  return blob
}
