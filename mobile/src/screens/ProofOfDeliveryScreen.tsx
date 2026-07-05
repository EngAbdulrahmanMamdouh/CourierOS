import React, { useMemo, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View, Vibration } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, Camera, CheckCircle2, FileText, ShieldCheck, Signature, UserCheck } from 'lucide-react-native'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { useAppTheme } from '../hooks/useTheme'
import { queueOfflineOperation } from '../services/offlineQueue'

const sampleShipment = {
  id: 'SHP-1001',
  title: 'Al Noor Pharmacy',
  receiver: 'Al Noor Pharmacy',
  address: '88 Marina Blvd, Dubai',
  cod: '$180',
}

export function ProofOfDeliveryScreen({ navigation, route }: { navigation: any; route: any }) {
  const { colors } = useAppTheme()
  const shipment = route?.params?.shipment ?? sampleShipment
  const [recipientName, setRecipientName] = useState('')
  const [relation, setRelation] = useState('Self')
  const [notes, setNotes] = useState('Left package with customer after identity verification.')
  const [signatureCaptured, setSignatureCaptured] = useState(false)
  const [photoCount, setPhotoCount] = useState(0)

  const otp = useMemo(() => '7421', [])
  const deliveryReady = signatureCaptured || photoCount > 0

  const captureSignature = () => {
    Vibration.vibrate(60)
    setSignatureCaptured(true)
    Alert.alert('Signature captured', 'Delivery signature has been saved locally.')
  }

  const addPhoto = () => {
    setPhotoCount((count) => count + 1)
    Vibration.vibrate(30)
  }

  const handleConfirm = async () => {
    if (!signatureCaptured) {
      Alert.alert('Capture signature', 'Please capture the recipient signature before confirming delivery.')
      return
    }

    await queueOfflineOperation({
      type: 'proof_of_delivery',
      payload: {
        shipmentId: shipment.id,
        recipientName: recipientName || 'Recipient',
        relation,
        otp,
        notes,
        photos: photoCount,
        signature: true,
      },
    })

    Alert.alert('Delivery confirmed', 'Proof of delivery has been queued for sync.')
    navigation.goBack()
  }

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <ArrowLeft size={18} color="#fff" />
          <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '700' }}>Back</Text>
        </Pressable>

        <PremiumCard title="Proof of delivery" subtitle={`Shipment • ${shipment.id}`}>
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{shipment.receiver}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 4 }}>{shipment.address}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(56,189,248,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Text style={{ color: '#38bdf8', fontWeight: '700' }}>OTP {otp}</Text>
              </View>
            </View>
          </View>
        </PremiumCard>

        <SectionHeader title="Recipient verification" subtitle="Confirm identity and get the final sign-off" />
        <PremiumCard title="Recipient details" subtitle="Fill in the delivery acceptance information">
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <UserCheck size={16} color="#38bdf8" />
              <TextInput value={recipientName} onChangeText={setRecipientName} placeholder="Recipient name" placeholderTextColor="rgba(255,255,255,0.5)" style={{ flex: 1, color: '#fff', marginLeft: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingVertical: 6 }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              {['Self', 'Spouse', 'Manager'].map((option) => (
                <Pressable key={option} onPress={() => setRelation(option)} style={{ flex: 1, backgroundColor: relation === option ? '#38bdf8' : 'rgba(255,255,255,0.08)', borderRadius: 16, paddingVertical: 12, alignItems: 'center' }}>
                  <Text style={{ color: relation === option ? '#fff' : 'rgba(255,255,255,0.7)', fontWeight: '700' }}>{option}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </PremiumCard>

        <PremiumCard title="Capture proof" subtitle="Signature, photos, and notes" style={{ marginTop: 12 }}>
          <View style={{ gap: 12 }}>
            <Pressable onPress={captureSignature} style={{ backgroundColor: signatureCaptured ? '#22c55e' : '#38bdf8', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Signature size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700' }}>{signatureCaptured ? 'Signature captured' : 'Capture recipient signature'}</Text>
              </View>
            </Pressable>

            <Pressable onPress={addPhoto} style={{ backgroundColor: '#0f172a', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(56,189,248,0.20)', paddingVertical: 14, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Camera size={18} color="#38bdf8" />
                <Text style={{ color: '#fff', fontWeight: '700' }}>Add photo proof</Text>
              </View>
            </Pressable>

            <Text style={{ color: 'rgba(255,255,255,0.75)' }}>{photoCount} photo(s) attached</Text>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 }}>
              <TextInput multiline numberOfLines={4} value={notes} onChangeText={setNotes} placeholder="Add delivery notes and handoff details" placeholderTextColor="rgba(255,255,255,0.5)" style={{ color: '#fff', minHeight: 90, textAlignVertical: 'top' }} />
            </View>
          </View>
        </PremiumCard>

        <PremiumCard title="Delivery readiness" subtitle="Final verification before confirmation" style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>Proof status</Text>
              <Text style={{ color: '#fff', fontWeight: '700', marginTop: 4 }}>{deliveryReady ? 'Ready to confirm' : 'Incomplete'}</Text>
            </View>
            <View style={{ backgroundColor: signatureCaptured ? 'rgba(34,197,94,0.16)' : 'rgba(248,113,113,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: signatureCaptured ? '#22c55e' : '#fb7185', fontWeight: '700' }}>{signatureCaptured ? 'Signed' : 'Pending signature'}</Text>
            </View>
          </View>
        </PremiumCard>

        <Pressable onPress={handleConfirm} style={{ marginTop: 16, backgroundColor: deliveryReady ? '#34d399' : 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm proof of delivery</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  )
}
