import React, {useCallback} from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {colors, radius, spacing} from '../theme';

interface ReceiptPickerProps {
  photoUri: string | undefined;
  onChange: (uri: string | undefined) => void;
}

/**
 * Lets the user attach a receipt photo to a transaction, either by taking
 * a new photo or picking one from the gallery.
 *
 * Known MVP limitation: camera captures are kept in a temporary cache
 * location by the OS unless copied to permanent app storage (which would
 * require an extra native dependency, e.g. `react-native-fs`). Gallery
 * picks use a persistent `content://` URI. This is documented in the
 * README Roadmap as a follow-up hardening item.
 */
export function ReceiptPicker({photoUri, onChange}: ReceiptPickerProps) {
  const handleTakePhoto = useCallback(async () => {
    const result = await launchCamera({mediaType: 'photo', quality: 0.6});
    if (result.didCancel) {
      return;
    }
    if (result.errorCode) {
      Alert.alert(
        'Could not open camera',
        result.errorMessage ?? result.errorCode,
      );
      return;
    }
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      onChange(uri);
    }
  }, [onChange]);

  const handlePickFromGallery = useCallback(async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.6});
    if (result.didCancel) {
      return;
    }
    if (result.errorCode) {
      Alert.alert(
        'Could not open gallery',
        result.errorMessage ?? result.errorCode,
      );
      return;
    }
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      onChange(uri);
    }
  }, [onChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Receipt (optional)</Text>
      {photoUri ? (
        <View style={styles.previewRow}>
          <Image source={{uri: photoUri}} style={styles.thumbnail} />
          <TouchableOpacity
            onPress={() => onChange(undefined)}
            style={styles.removeButton}>
            <Text style={styles.removeLabel}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleTakePhoto}>
            <Text style={styles.actionLabel}>📷 Take photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickFromGallery}>
            <Text style={styles.actionLabel}>🖼️ Choose photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  actionLabel: {
    fontWeight: '600',
    color: colors.text,
    fontSize: 13,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.border,
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  removeLabel: {
    color: colors.danger,
    fontWeight: '600',
  },
});
