import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, LayoutAnimation, Platform, Pressable, ScrollView, Text, TextInput, View, Vibration } from 'react-native'
import { CameraView, type CameraPictureOptions, useCameraPermissions } from 'expo-camera'
import { LinearGradient } from 'expo-linear-gradient'
import { ArrowLeft, Camera as CameraIcon, CheckCircle2, FileText, Signature as SignatureIcon, Trash2, UserCheck } from 'lucide-react-native'
import { PremiumCard } from '../components/PremiumCard'
import { SectionHeader } from '../components/SectionHeader'
import { useAppTheme } from '../hooks/useTheme'
import { queueOfflineOperation } from '../services/offlineQueue'
import { SignatureCanvas } from '../components/SignatureCanvas'
import { useSubmitProofOfDeliveryMutation } from '../hooks/useShipmentQueries'
import { checkNetworkConnectivity } from '../services/connectivity'

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
  const [photoUris, setPhotoUris] = useState<string[]>([])
  const [signatureData, setSignatureData] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [online, setOnline] = useState<boolean | null>(null)
  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<CameraView | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [capturing, setCapturing] = useState(false)

  const proofMutation = useSubmitProofOfDeliveryMutation()

  const signatureCaptured = signatureData.length > 0
  const photoCount = photoUris.length
  const deliveryReady = signatureCaptured || photoCount > 0
  const otp = useMemo(() => '7421', [])

  useEffect(() => {
    const refreshStatus = async () => setOnline(await checkNetworkConnectivity())
    refreshStatus()
  }, [])

  const handleTakePhoto = useCallback(async () => {
    if (!cameraRef.current || !cameraReady) {
      return
    }

    setCapturing(true)
    try {
      const options: CameraPictureOptions = {
        quality: 0.7,
        skipProcessing: true,
      }
      const result = await cameraRef.current.takePictureAsync(options)
      setPhotoUris((prev) => [result.uri, ...prev])
      Vibration.vibrate(40)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    } catch {
      Alert.alert('Capture failed', 'Unable to capture image. Please try again.')
    } finally {
      setCapturing(false)
    }
  }, [cameraReady])

  const handleRemovePhoto = (uri: string) => {
    setPhotoUris((prev) => prev.filter((item) => item !== uri))
  }

  const submitProof = async () => {
    if (!deliveryReady) {
      Alert.alert('Incomplete proof', 'Please capture at least a signature or photo before confirming delivery.')
      return
    }

    const payload = {
      recipientName: recipientName || 'Recipient',
      relation,
      notes,
      photos: photoUris,
      signatureData,
    }

    const performOfflineQueue = async () => {
      await queueOfflineOperation({
        type: 'proof_of_delivery',
        payload: {
          shipmentId: shipment.id,
          ...payload,
        },
      })
      Alert.alert('Proof queued', 'Proof of delivery has been saved locally and will sync automatically once online.')
      navigation.goBack()
    }

    setSubmitting(true)
    try {
      const isConnected = online ?? (await checkNetworkConnectivity())
      if (isConnected) {
        await proofMutation.mutateAsync({ shipmentId: Number(shipment.id), payload })
        Alert.alert('Delivered', 'Proof of delivery has been submitted successfully.')
        navigation.navigate('CODCollection', { shipment })
      } else {
        await performOfflineQueue()
      }
    } catch (error) {
      await performOfflineQueue()
    } finally {
      setSubmitting(false)
    }
  }

  const confirmSubmission = () => {
    Alert.alert('Confirm delivery', 'Mark this shipment as delivered and upload proof of delivery?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: submitProof },
    ])
  }

  if (permission === null) {
    return <View style={{ flex: 1, backgroundColor: '#07111f' }} />
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#07111f', '#0f172a']} style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Camera access required</Text>
        <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 10 }}>Enable the camera to capture delivery photos and proof of handoff.</Text>
        <Pressable onPress={requestPermission} style={{ marginTop: 24, backgroundColor: '#38bdf8', borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Allow camera access</Text>
        </Pressable>
      </LinearGradient>
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

          <SectionHeader title="Delivery capture" subtitle="Customer signature, photo proof, and final notes" />

          <PremiumCard title="Live photo capture" subtitle="Capture evidence directly from the delivery location">
            <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: '#0b1522' }}>
              <CameraView
                ref={cameraRef}
                style={{ width: '100%', height: 220, minHeight: 220 }}
                facing="back"
                onCameraReady={() => setCameraReady(true)}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: 'rgba(0,0,0,0.24)' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{photoCount} photo(s)</Text>
                <Pressable onPress={handleTakePhoto} disabled={capturing} style={{ backgroundColor: '#38bdf8', borderRadius: 16, paddingVertical: 10, paddingHorizontal: 16 }}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>{capturing ? 'Capturing...' : 'Capture'}</Text>
                </Pressable>
              </View>
            </View>
            {photoUris.length > 0 ? (
              <View style={{ marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {photoUris.map((uri) => (
                  <View key={uri} style={{ position: 'relative', width: 100, height: 100, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(56,189,248,0.18)' }}>
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
                    <Pressable onPress={() => handleRemovePhoto(uri)} style={{ position: 'absolute', right: 8, top: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 999, padding: 6 }}>
                      <Trash2 size={14} color="#fff" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </PremiumCard>

          <PremiumCard title="Customer signature" subtitle="Capture handwritten acceptance from the recipient" style={{ marginTop: 12 }}>
            <SignatureCanvas onSignatureChange={(value) => setSignatureData(value)} />
            {signatureCaptured ? (
              <Text style={{ color: '#34d399', marginTop: 10, fontWeight: '700' }}>Signature captured</Text>
            ) : (
              <Text style={{ color: 'rgba(255,255,255,0.65)', marginTop: 10 }}>Sign above to complete proof of delivery.</Text>
            )}
          </PremiumCard>

          <PremiumCard title="Delivery notes" subtitle="Record handoff details for operations and audit" style={{ marginTop: 12 }}>
            <TextInput
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add delivery notes and handoff details"
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={{ color: '#fff', minHeight: 110, textAlignVertical: 'top', padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18 }}
            />
          </PremiumCard>

          <PremiumCard title="Review & confirm" subtitle="Verify everything before marking delivered" style={{ marginTop: 12 }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Connectivity</Text>
                  <Text style={{ color: '#fff', fontWeight: '700', marginTop: 4 }}>{online === false ? 'Offline' : online === true ? 'Online' : 'Checking...'}</Text>
                </View>
                <View style={{ backgroundColor: online === false ? 'rgba(248,113,113,0.16)' : 'rgba(34,197,94,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: online === false ? '#fb7185' : '#22c55e', fontWeight: '700' }}>{online === false ? 'Offline queue' : 'Live sync'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={18} color={deliveryReady ? '#34d399' : '#94a3b8'} />
                <Text style={{ color: '#fff', fontWeight: '700' }}>{deliveryReady ? 'Proof ready' : 'Proof incomplete'}</Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{photoCount} photo(s), signature {signatureCaptured ? 'captured' : 'pending'}, notes ready.</Text>
            </View>
          </PremiumCard>

          <Pressable onPress={confirmSubmission} disabled={submitting} style={{ marginTop: 16, backgroundColor: deliveryReady ? '#34d399' : 'rgba(255,255,255,0.12)', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{submitting ? 'Submitting...' : 'Mark delivered'}</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}
