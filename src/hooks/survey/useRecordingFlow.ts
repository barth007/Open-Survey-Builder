
import { useState, useEffect } from 'react';
import { Survey } from '@/types/survey';
import { useRecordingPermissions } from '@/components/survey/recording/useRecordingPermissions';
import { debugLog } from '@/lib/logger';

interface UseRecordingFlowReturn {
  needsPermissions: boolean;
  recordingActive: boolean;
  recordingDeclined: boolean;
  handlePermissionGranted: (permissions: { audio: boolean; video: boolean }) => void;
  handlePermissionDeclined: () => void;
  canProceedToSurvey: boolean;
  shouldShowThankYou: boolean;
}

export const useRecordingFlow = (survey: Survey | null): UseRecordingFlowReturn => {
  const { permissions, hasPermissions } = useRecordingPermissions();
  const [recordingDeclined, setRecordingDeclined] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const recordingEnabled = survey?.recordingEnabled || false;
  const recordingRequired = survey?.recordingRequired || false;

  // Check if we need to ask for permissions
  const needsPermissions = recordingEnabled && !permissions && !recordingDeclined && !permissionsGranted;

  // Check if recording is active
  const recordingActive = recordingEnabled && permissionsGranted && hasPermissions(true, recordingEnabled);

  // Check if user can proceed to survey
  const canProceedToSurvey = !recordingEnabled || // No recording required
                            permissionsGranted || // Permissions granted
                            (recordingDeclined && !recordingRequired); // Recording declined but optional

  // Check if should show thank you (user declined required recording)
  const shouldShowThankYou = recordingDeclined && recordingRequired;

  const handlePermissionGranted = (grantedPermissions: { audio: boolean; video: boolean }) => {
    debugLog('Recording permissions granted in flow:', grantedPermissions);
    setPermissionsGranted(true);
    setRecordingDeclined(false);
  };

  const handlePermissionDeclined = () => {
    debugLog('Recording permissions declined in flow');
    setRecordingDeclined(true);
    setPermissionsGranted(false);
  };

  return {
    needsPermissions,
    recordingActive,
    recordingDeclined,
    handlePermissionGranted,
    handlePermissionDeclined,
    canProceedToSurvey,
    shouldShowThankYou
  };
};
