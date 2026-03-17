import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  SafeAreaView,
} from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useAuthStore } from '../../store';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

type Mode = 'set' | 'confirm' | 'enter';

export default function LockScreen() {
  const { hasPin, checkPin, login, loginWithBiometric, setPin } = useAuthStore();
  const [mode, setMode] = useState<Mode>('enter');
  const [pin, setLocalPin] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      await checkPin();
    })();
  }, [checkPin]);

  useEffect(() => {
    if (!hasPin) {
      setMode('set');
    } else {
      setMode('enter');
      tryBiometric();
    }
  }, [hasPin]);

  const tryBiometric = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available } = await rnBiometrics.isSensorAvailable();
      if (!available) return;
      const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Unlock PhyJio' });
      if (success) loginWithBiometric();
    } catch {
      // ignore
    }
  };

  const shake = () => {
    Vibration.vibrate(400);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKey = async (key: string) => {
    if (key === '') return;
    if (key === '⌫') {
      setLocalPin(p => p.slice(0, -1));
      return;
    }
    const newPin = pin + key;
    setLocalPin(newPin);

    if (newPin.length < 4) return;

    // Full PIN entered
    if (mode === 'set') {
      setFirstPin(newPin);
      setLocalPin('');
      setMode('confirm');
      return;
    }

    if (mode === 'confirm') {
      if (newPin === firstPin) {
        await setPin(newPin);
      } else {
        shake();
        setLocalPin('');
        setFirstPin('');
        setMode('set');
      }
      return;
    }

    // mode === 'enter'
    const ok = await login(newPin);
    if (!ok) {
      shake();
      setLocalPin('');
    }
  };

  const subtitle =
    mode === 'set'
      ? 'Create a 4-digit PIN'
      : mode === 'confirm'
      ? 'Confirm your PIN'
      : 'Enter your PIN';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🩺</Text>
        <Text style={styles.appName}>PhyJio</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
        ))}
      </Animated.View>

      <View style={styles.keypad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key, ki) => (
              <TouchableOpacity
                key={ki}
                style={[styles.key, key === '' && styles.keyEmpty]}
                onPress={() => handleKey(key)}
                activeOpacity={0.7}
                disabled={key === ''}
              >
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {mode === 'enter' && (
        <TouchableOpacity style={styles.biometricBtn} onPress={tryBiometric}>
          <Text style={styles.biometricText}>Use Biometrics 🔐</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  emoji: { fontSize: 56 },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.surface,
    marginTop: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    marginTop: Spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.xxxl,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.surface,
    borderColor: Colors.surface,
  },
  keypad: { gap: Spacing.md },
  keyRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.surface,
  },
  biometricBtn: {
    marginTop: Spacing.xxxl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  biometricText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
  },
});
