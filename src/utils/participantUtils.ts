
/**
 * Participant utilities for anonymous survey access
 */

// Generate a unique participant ID or retrieve from localStorage
export const getParticipantId = (): string => {
  const storedId = localStorage.getItem('survey_participant_id');
  if (storedId) {
    return storedId;
  }
  
  // Generate a new UUID-like ID
  const newId = crypto.randomUUID();
  localStorage.setItem('survey_participant_id', newId);
  return newId;
};

// Collect metadata about the participant's browser and device
export const collectMetadata = async (): Promise<Record<string, any>> => {
  const metadata: Record<string, any> = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenSize: {
      width: window.screen.width,
      height: window.screen.height
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timestamp: new Date().toISOString()
  };

  // Determine device type
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /(iPad|tablet|Nexus 7|Nexus 10)/i.test(navigator.userAgent);
  
  metadata.deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');
  
  // Optionally add geolocation if available and user permits
  try {
    if (navigator.geolocation) {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 600000 // 10 minutes
        });
      });
      
      metadata.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    }
  } catch (error) {
    // Geolocation failed or was denied, that's okay
    metadata.geolocationError = "Location access denied or unavailable";
  }
  
  return metadata;
};
