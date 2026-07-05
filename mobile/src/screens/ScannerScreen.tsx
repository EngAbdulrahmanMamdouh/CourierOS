import React, { useEffect, useRef, useState } from 'react'
import { Alert, Animated, Pressable, Text, TextInput, View, Vibration, StatusBar } from 'react-native'
import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera'
import { LinearGradient } from 'expo-linear-gradient'
import { Flashlight, Search, Sparkles, XCircle, CheckCircle2, ScanLine } from 'lucide-react-native'

export function ScannerScreen({ navigation }: { navigation: any }) {
  const [permission, requestPermission] = useCameraPermissions()
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'failure'>('idle')
  const [loading, setLoading] = useState(false)
  const successScale = useRef(new Animated.Value(0.8)).current
  const failureX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (status === 'success') {
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, friction: 6 }).start()
    } else if (status === 'failure') {
      Animated.sequence([
        Animated.timing(failureX, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(failureX, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(failureX, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(failureX, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start()
    }
  }, [failureX, status, successScale])

  const handleLookup = (value: string) => {
    const normalized = value.trim().toUpperCase()
    if (!normalized) {
      Alert.alert('Enter tracking number', 'Add a barcode, QR, or shipment reference first.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      const isMatch = normalized.includes('SHP') || normalized.includes('TRK') || normalized.length >= 4
      if (isMatch) {
        Vibration.vibrate([50, 80, 50])
        setStatus('success')
        setScanned(true)
        setTimeout(() => {
          navigation.navigate('ShipmentDetails', { shipment: { id: normalized, title: 'Matched shipment', status: 'Accepted' } })
        }, 800)
      } else {
        Vibration.vibrate(120)
        setStatus('failure')
      }
      setLoading(false)
    }, 700)
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    handleLookup(data)
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#06111f', justifyContent: 'center', alignItems: 'center' }} />
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Camera access is needed</Text>
        <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 10 }}>Enable the camera to scan barcodes and QR codes for shipment lookup.</Text>
        <Pressable onPress={requestPermission} style={{ marginTop: 20, backgroundColor: '#38bdf8', borderRadius: 16, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Allow camera</Text>
        </Pressable>
      </LinearGradient>
    )
  }

  const cameraProps = {
    style: { flex: 1 },
    cameraType: 'back' as CameraType,
    onBarCodeScanned: handleBarcodeScanned,
    barCodeScannerSettings: { barCodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'] },
    flashMode: flashEnabled ? 'on' : 'off',
  } as any

  return (
    <LinearGradient colors={['#07111f', '#0f172a', '#0f766e']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <CameraView {...cameraProps} />
      <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Pressable onPress={() => navigation.goBack()} style={{ backgroundColor: 'rgba(0,0,0,0.34)', borderRadius: 999, padding: 10 }}>
            <XCircle size={20} color="#fff" />
          </Pressable>
          <Pressable onPress={() => setFlashEnabled((value) => !value)} style={{ backgroundColor: 'rgba(0,0,0,0.34)', borderRadius: 999, padding: 10 }}>
            <Flashlight size={20} color={flashEnabled ? '#38bdf8' : '#fff'} />
          </Pressable>
        </View>

        <View style={{ backgroundColor: 'rgba(2, 6, 23, 0.74)', borderRadius: 24, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ScanLine size={18} color="#38bdf8" />
            <Text style={{ color: '#fff', fontWeight: '800', marginLeft: 8 }}>Scanner ready</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.72)', marginTop: 8 }}>Scan a barcode or QR code to auto-open the shipment record. Manual entry is available below.</Text>

          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10 }}>
            <Search size={16} color="#38bdf8" />
            <TextInput value={manualCode} onChangeText={setManualCode} placeholder="Manual tracking number" placeholderTextColor="rgba(255,255,255,0.5)" style={{ flex: 1, color: '#fff', marginLeft: 8 }} />
          </View>

          <Pressable onPress={() => handleLookup(manualCode)} disabled={loading} style={{ marginTop: 12, backgroundColor: loading ? 'rgba(56,189,248,0.5)' : '#38bdf8', borderRadius: 16, paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{loading ? 'Looking up shipment…' : 'Lookup shipment'}</Text>
          </Pressable>
        </View>

        {(status === 'success' || status === 'failure') && (
          <Animated.View style={{ alignItems: 'center', transform: [{ scale: status === 'success' ? successScale : 1 }, { translateX: failureX }] }}>
            {status === 'success' ? (
              <View style={{ backgroundColor: 'rgba(16,185,129,0.18)', borderRadius: 999, padding: 16 }}>
                <CheckCircle2 size={48} color="#34d399" />
              </View>
            ) : (
              <View style={{ backgroundColor: 'rgba(248,113,113,0.16)', borderRadius: 999, padding: 16 }}>
                <XCircle size={48} color="#fb7185" />
              </View>
            )}
            <Text style={{ color: '#fff', fontWeight: '800', marginTop: 8 }}>{status === 'success' ? 'Shipment matched' : 'Lookup failed'}</Text>
          </Animated.View>
        )}
      </View>
    </LinearGradient>
  )
}

const StyleSheet = require('react-native').StyleSheet
