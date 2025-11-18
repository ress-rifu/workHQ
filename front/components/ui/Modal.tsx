import React, { ReactNode } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { radius, spacing } from '../../constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
}

export const Modal = React.memo(function Modal({
  visible,
  onClose,
  children,
  animationType = 'fade',
  transparent = true,
}: ModalProps) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        {/* Backdrop - Solid overlay */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card, // Solid, warm background
                borderColor: colors.borderLight,
              },
            ]}
          >
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    padding: spacing.xl,
  },
  modalContent: {
    borderRadius: radius.xl, // Soft, rounded corners
    padding: spacing.xxl, // Generous padding
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});

