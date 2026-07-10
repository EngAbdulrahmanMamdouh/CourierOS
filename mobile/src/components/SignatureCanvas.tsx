import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PanResponder, type GestureResponderEvent, type PanResponderGestureState, type LayoutChangeEvent, View, Text, StyleSheet } from 'react-native'
import Svg, { Path } from 'react-native-svg'

type Point = { x: number; y: number }

type SignatureCanvasProps = {
  onSignatureChange: (signatureJson: string) => void
  disabled?: boolean
}

const buildPath = (points: Point[]) => {
  if (!points.length) return ''
  return points.reduce((path, point, index) => {
    const prefix = index === 0 ? 'M' : 'L'
    return `${path} ${prefix} ${point.x} ${point.y}`
  }, '')
}

export function SignatureCanvas({ onSignatureChange, disabled }: SignatureCanvasProps) {
  const [strokes, setStrokes] = useState<Point[][]>([])
  const [currentStroke, setCurrentStroke] = useState<Point[]>([])
  const [layout, setLayout] = useState({ width: 320, height: 260 })

  const stageRef = useRef<View | null>(null)

  useEffect(() => {
    onSignatureChange(JSON.stringify(strokes))
  }, [onSignatureChange, strokes])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent
        setCurrentStroke([{ x: locationX, y: locationY }])
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent
        setCurrentStroke((prev) => [...prev, { x: locationX, y: locationY }])
      },
      onPanResponderRelease: () => {
        if (currentStroke.length) {
          setStrokes((prev) => [...prev, currentStroke])
          setCurrentStroke([])
        }
      },
      onPanResponderTerminate: () => {
        if (currentStroke.length) {
          setStrokes((prev) => [...prev, currentStroke])
          setCurrentStroke([])
        }
      },
    }),
  ).current

  const paths = useMemo(
    () => [...strokes, currentStroke].filter(Boolean).map((stroke) => buildPath(stroke)),
    [currentStroke, strokes],
  )

  const handleClear = () => {
    setStrokes([])
    setCurrentStroke([])
    onSignatureChange('')
  }

  return (
    <View style={styles.container}>
      <View
        {...panResponder.panHandlers}
        ref={stageRef}
        onLayout={(event: LayoutChangeEvent) => {
          const { width, height } = event.nativeEvent.layout
          setLayout({ width, height })
        }}
        style={styles.canvas}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${layout.width} ${layout.height}`} preserveAspectRatio="none">
          {paths.map((path, index) => (
            <Path key={index} d={path} stroke="#38bdf8" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>
        {strokes.length === 0 && currentStroke.length === 0 ? (
          <View style={styles.placeholder} pointerEvents="none">
            <Text style={styles.placeholderText}>Sign here</Text>
            <Text style={styles.placeholderSubtext}>Use your finger to capture the recipient signature.</Text>
          </View>
        ) : null}
      </View>
      <Text onPress={handleClear} style={styles.clearText}>Clear signature</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  canvas: {
    minHeight: 260,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.18)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  placeholderText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 16,
  },
  placeholderSubtext: {
    color: '#94a3b8',
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  clearText: {
    color: '#38bdf8',
    marginTop: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
})
