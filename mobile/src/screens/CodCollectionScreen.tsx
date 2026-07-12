import React, { useMemo, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, Vibration } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, CircleDollarSign, FileText, Receipt, Sparkles } from 'lucide-react-native'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { useAppTheme } from '../hooks/useTheme'
import { queueOfflineOperation } from '../services/offlineQueue'
import { submitCodCollectionViaFinance } from '../services/shipment'

const sampleShipment = {
  id: 'SHP-1001',
  title: 'Al Noor Pharmacy',
  address: '88 Marina Blvd, Dubai',
  cod: '$180',
}

export function CodCollectionScreen({ navigation, route }: { navigation: any; route: any }) {
  const { colors } = useAppTheme()
  const shipment = route?.params?.shipment ?? sampleShipment
  const amountDue = Number(String(shipment.cod).replace(/[^0-9.]/g, '')) || 180
  const [cashTendered, setCashTendered] = useState('')
  const [collected, setCollected] = useState(amountDue)
  const tenderedValue = Number(cashTendered)
  const changeDue = useMemo(() => Math.max(0, tenderedValue - amountDue), [amountDue, tenderedValue])
  const remaining = Math.max(0, amountDue - tenderedValue)

  const handleConfirm = async () => {
    if (!cashTendered || tenderedValue < amountDue) {
      Alert.alert('Enter valid amount', 'The customer must pay at least the COD amount before confirming collection.')
      return
    }

    Vibration.vibrate(60)
    try {
      await submitCodCollectionViaFinance(Number(shipment.id), {
        amountDue,
        cashTendered: tenderedValue,
        changeDue,
        transactionReference: `MOB-${shipment.id}`,
        notes: 'Collected via mobile app',
      })
      setCollected(amountDue)
      Alert.alert('COD collected', `Collected ${shipment.cod} and recorded successfully.`)
      navigation.goBack()
    } catch {
      await queueOfflineOperation({
        type: 'cod_collection',
        payload: {
          shipmentId: shipment.id,
          amountDue,
          cashTendered: tenderedValue,
          changeDue,
        },
      })
      setCollected(amountDue)
      Alert.alert('COD collected', `Collected ${shipment.cod} and queued receipt generation.`)
      navigation.goBack()
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
          <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <ArrowLeft size={18} color="#fff" />
            <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Back</Text>
          </Pressable>

          <PremiumCard title="COD collection" subtitle={`Shipment • ${shipment.id}`}>
            <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 10 }}>Collect cash on delivery and issue a receipt to the customer.</Text>
          </PremiumCard>

          <SectionHeader title="Amount due" subtitle="Confirm exact cash tendered" />
          <PremiumCard title={shipment.cod} subtitle="Total cash due at delivery">
            <View style={{ marginTop: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Collected so far</Text>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 6 }}>${collected}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Remaining: ${Math.max(0, amountDue - collected)}</Text>
            </View>
          </PremiumCard>

          <PremiumCard title="Cash tendered" subtitle="Enter the amount the customer handed over" style={{ marginTop: 12 }}>
            <TextInput
              keyboardType="numeric"
              value={cashTendered}
              onChangeText={(value) => setCashTendered(value.replace(/[^0-9.]/g, ''))}
              placeholder="Enter cash amount"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={{ color: '#fff', marginTop: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingVertical: 10 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Change due</Text>
                <Text style={{ color: '#fff', fontWeight: '700', marginTop: 4 }}>${changeDue.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Remaining</Text>
                <Text style={{ color: '#fff', fontWeight: '700', marginTop: 4 }}>${remaining.toFixed(2)}</Text>
              </View>
            </View>
          </PremiumCard>

          <PremiumCard title="Receipt preview" subtitle="What will be generated for the customer" style={{ marginTop: 12 }}>
            <View style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Receipt size={16} color="#38bdf8" />
                <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Receipt ID: RCT-{shipment.id.slice(-4)}</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 8 }}>Amount due: {shipment.cod}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Customer paid: ${tenderedValue || 0}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Change: ${changeDue.toFixed(2)}</Text>
            </View>
          </PremiumCard>

          <Pressable onPress={handleConfirm} style={{ marginTop: 18, backgroundColor: '#34d399', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm COD collection</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}
