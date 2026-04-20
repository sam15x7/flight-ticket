import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import { TicketData } from '../types/flight';

// Register fonts
Font.register({
  family: 'DM Sans',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/dmsans/v13/rP2Hp2ywxg089UriCZOIHTWEBlw.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/dmsans/v13/rP2Bp2ywxg089UriCZOIHTWEBlw.ttf', fontWeight: 700 }
  ]
});

Font.register({
  family: 'IBM Plex Mono',
  src: 'https://fonts.gstatic.com/s/ibmplexmono/v19/-F63fjptAgt5VM-kVkqdyU8n1iIq129k.ttf'
});

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 30, fontFamily: 'DM Sans' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  platformLogoPlaceholder: { width: 40, height: 40, backgroundColor: '#000', marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  platformLogoText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  platformLogo: { width: 50, height: 50, marginRight: 12 },
  titleBar: { borderBottom: '1pt solid #dddddd', paddingBottom: 8, marginBottom: 12 },
  destinationTitle: { fontSize: 22, fontWeight: 700, color: '#111111', textTransform: 'uppercase' },
  passengerTable: { border: '1pt solid #cccccc', padding: 10, marginBottom: 16 },
  tableHeader: { flexDirection: 'row', borderBottom: '1pt solid #dddddd', paddingBottom: 6, marginBottom: 6 },
  tableRow: { flexDirection: 'row' },
  col: { flex: 1, fontSize: 9 },
  flightBlock: { flexDirection: 'row', gap: 12 },
  itineraryPanel: { flex: 3, border: '1pt solid #cccccc', padding: 12 },
  pricePanel: { flex: 2, gap: 12 },
  priceSummaryBox: { border: '1pt solid #cccccc', padding: 12 },
  additionalBox: { border: '1pt solid #cccccc', padding: 10 },
  confirmedBadge: { color: '#15803d', fontWeight: 700, fontSize: 10 },
  airlineLogo: { width: 40, height: 25, objectFit: 'contain', marginRight: 10 },
  legRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 4 },
  legDest: { flex: 1, fontSize: 10, fontWeight: 700 },
  legTime: { fontSize: 13, fontWeight: 700 },
  layoverBar: { textAlign: 'center', fontSize: 8, color: '#666666', borderTop: '1pt solid #eeeeee', borderBottom: '1pt solid #eeeeee', paddingVertical: 4, marginVertical: 8, textTransform: 'uppercase' },
  finePrint: { fontSize: 7, color: '#888888', marginTop: 10 },
  rulesSection: { marginTop: 16, borderTop: '1pt solid #eeeeee', paddingTop: 8 },
  totalLine: { fontWeight: 700, borderTop: '1pt solid #cccccc', paddingTop: 6, marginTop: 4, fontSize: 10 },
  disclaimer: { position: 'absolute', bottom: 20, left: 30, right: 30, textAlign: 'center', fontSize: 7, color: '#999999', borderTop: '1pt solid #eeeeee', paddingTop: 6 }
});

export const TicketPDF: React.FC<{ data: TicketData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* ── HEADER ── */}
      <View style={styles.header}>
        {data.platform.logoBase64 ? (
          <Image src={data.platform.logoBase64} style={styles.platformLogo} />
        ) : (
          <View style={styles.platformLogoPlaceholder}>
            <Text style={styles.platformLogoText}>{data.platform.name.charAt(0)}</Text>
          </View>
        )}
        <View>
          <Text style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase' }}>{data.platform.name}</Text>
          <Text style={{ fontSize: 8, color: '#666666', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
            {data.platform.tagline}
          </Text>
        </View>
      </View>

      {/* ── TITLE BAR ── */}
      <View style={styles.titleBar}>
        <Text style={styles.destinationTitle}>{data.itinerary.destination.city}</Text>
        <Text style={{ fontSize: 9, color: '#555555', marginTop: 6, textTransform: 'uppercase' }}>
          {data.itinerary.date}   |   Itinerary # {data.passenger.ticketNumber}
        </Text>
      </View>

      {/* ── PASSENGER TABLE ── */}
      <View style={styles.passengerTable}>
        <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 8 }}>Passenger Information</Text>
        <View style={styles.tableHeader}>
          {['Name', 'Birthdate', 'Ticketnumber', 'FFD'].map(h => (
            <Text key={h} style={[styles.col, { fontWeight: 700, fontSize: 8, color: '#444' }]}>{h}</Text>
          ))}
        </View>
        <View style={styles.tableRow}>
          <Text style={[styles.col, { fontWeight: 700 }]}>{data.passenger.name}</Text>
          <Text style={styles.col}>{data.passenger.dob}</Text>
          <Text style={[styles.col, { fontFamily: 'IBM Plex Mono' }]}># {data.passenger.ticketNumber}</Text>
          <Text style={styles.col}>{data.passenger.ffd}</Text>
        </View>
        <Text style={styles.finePrint}>
          Seat assignments, special meals, frequent flyer point awards and special assistance
          requests should be confirmed directly with the airline.
        </Text>
      </View>

      {/* ── FLIGHT BLOCK ── */}
      <View style={styles.flightBlock}>

        {/* Left: Itinerary Panel */}
        <View style={styles.itineraryPanel}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>
              {data.itinerary.origin.city} ({data.itinerary.origin.iata}) → {data.itinerary.destination.city} ({data.itinerary.destination.iata})
            </Text>
            <Text style={styles.confirmedBadge}>{data.itinerary.status}</Text>
          </View>
          <Text style={{ fontSize: 9, marginBottom: 12, color: '#555555', textTransform: 'uppercase' }}>
            {data.itinerary.date}, {data.itinerary.tripType.toLowerCase()} ticket
          </Text>

          <View style={{ border: '1pt solid #dddddd', padding: 8, marginBottom: 12, backgroundColor: '#f9fafb' }}>
            <Text style={{ fontSize: 8, fontWeight: 700, marginBottom: 6 }}>
              Your reservation is booked and confirmed. There is no need to call us to reconfirm this reservation
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 8, color: '#555' }}>{data.itinerary.date} - Departure   {data.itinerary.legs.length > 1 ? `${data.itinerary.legs.length - 1} stop` : 'Direct'}</Text>
              <Text style={{ fontSize: 8, color: '#555' }}>Total travel time: {data.itinerary.totalDuration}</Text>
            </View>
          </View>

          {data.itinerary.legs.map((leg, i) => (
            <View key={i}>
              <View style={styles.legRow}>
                {leg.airline.logoBase64 ? (
                  <Image src={leg.airline.logoBase64} style={styles.airlineLogo} />
                ) : (
                  <View style={{ width: 40, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: 700 }}>{leg.airline.iataCode}</Text>
                  </View>
                )}
                
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={styles.legDest}>{leg.origin.city}</Text>
                    <Text style={styles.legTime}>{leg.origin.time || 'TBD'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.legDest}>{leg.destination.city}</Text>
                    <Text style={styles.legTime}>{leg.destination.time || 'TBD'}</Text>
                  </View>
                </View>
              </View>
              
              <View style={{ marginLeft: 50 }}>
                <Text style={{ fontSize: 9, fontWeight: 700, color: '#111' }}>{leg.flightNumber}</Text>
                <Text style={{ fontSize: 8, color: '#666666', marginTop: 2 }}>
                  {leg.cabin} | Confirm seats with the airline*
                </Text>
              </View>

              {leg.layoverAfter && (
                <Text style={styles.layoverBar}>Layover: {leg.layoverAfter}</Text>
              )}
            </View>
          ))}

          <View style={styles.rulesSection}>
            <Text style={{ fontWeight: 700, fontSize: 9, marginBottom: 4 }}>Airline Rules & Regulations</Text>
            <Text style={{ fontSize: 7, color: '#555', marginBottom: 2 }}>• This price includes a non-refundable booking fee.</Text>
            <Text style={{ fontSize: 7, color: '#555', marginBottom: 2 }}>• Please read the complete penalty rules for changes and cancellations.</Text>
            <Text style={{ fontSize: 7, color: '#555', marginBottom: 2 }}>• Please read important information regarding airline liability limitations.</Text>
          </View>
        </View>

        {/* Right: Price Panel */}
        <View style={styles.pricePanel}>
          <View style={styles.priceSummaryBox}>
            <Text style={{ fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase' }}>Price summary</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 9 }}>Traveller {data.pricing.adultCount}: Adult</Text>
              <Text style={{ fontSize: 9 }}>{data.pricing.currency} {data.pricing.baseFare.toFixed(2)}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 8, color: '#555' }}>Flight</Text>
              <Text style={{ fontSize: 8, color: '#555' }}>{data.pricing.currency} {data.pricing.baseFare.toFixed(2)}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 8, color: '#555' }}>Taxes & Fees</Text>
              <Text style={{ fontSize: 8, color: '#555' }}>{data.pricing.currency} {data.pricing.taxes.toFixed(2)}</Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 8, color: '#555' }}>Booking Fee</Text>
              <Text style={{ fontSize: 8, color: '#555' }}>{data.pricing.currency} {data.pricing.bookingFee.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.totalLine, { flexDirection: 'row', justifyContent: 'space-between' }]}>
              <Text>Total:</Text>
              <Text>{data.pricing.currency} {(data.pricing.baseFare + data.pricing.taxes + data.pricing.bookingFee).toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.additionalBox}>
            <Text style={{ fontSize: 9, fontWeight: 700, marginBottom: 6 }}>Additional Flight Services</Text>
            <Text style={{ fontSize: 7, color: '#555' }}>
              • The airline may charge additional fees for checked baggage or other optional services.
            </Text>
          </View>
        </View>

      </View>

      <Text style={styles.disclaimer}>
        This is a demonstration ticket generated for design/mock purposes only and is not a valid travel document.
      </Text>
    </Page>
  </Document>
);
