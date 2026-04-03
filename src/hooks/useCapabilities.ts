import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import {
  CAPABILITY_KEYS,
  DEFAULT_CAPABILITIES,
  type CapabilityKey,
  type CapabilityMap,
  type CapabilityState,
} from '@/types/capabilities';

const CAPABILITIES_QUERY_KEY = ['system', 'capabilities'] as const;

let capabilitySnapshot: CapabilityMap = DEFAULT_CAPABILITIES;

const normalizeCapabilityState = (
  key: CapabilityKey,
  value: unknown,
): CapabilityState => {
  const fallback = DEFAULT_CAPABILITIES[key];

  if (typeof value !== 'object' || value === null) {
    return fallback;
  }

  const candidate = value as Partial<CapabilityState>;
  return {
    enabled: typeof candidate.enabled === 'boolean' ? candidate.enabled : fallback.enabled,
    reason: typeof candidate.reason === 'string' && candidate.reason.trim().length > 0
      ? candidate.reason
      : fallback.reason,
  };
};

export const normalizeCapabilitiesResponse = (value: unknown): CapabilityMap => {
  if (typeof value !== 'object' || value === null) {
    return DEFAULT_CAPABILITIES;
  }

  const payload = value as Partial<Record<CapabilityKey, unknown>>;
  return CAPABILITY_KEYS.reduce((acc, key) => {
    acc[key] = normalizeCapabilityState(key, payload[key]);
    return acc;
  }, {} as CapabilityMap);
};

export const setCapabilitiesSnapshot = (capabilities: CapabilityMap) => {
  capabilitySnapshot = capabilities;
};

export const resetCapabilitiesSnapshot = () => {
  capabilitySnapshot = DEFAULT_CAPABILITIES;
};

export const getCapabilitiesSnapshot = () => capabilitySnapshot;

export const getCapabilityState = (
  key: CapabilityKey,
  capabilities: CapabilityMap = capabilitySnapshot,
): CapabilityState => capabilities[key] ?? DEFAULT_CAPABILITIES[key];

export const getCapabilityReason = (
  key: CapabilityKey,
  capabilities: CapabilityMap = capabilitySnapshot,
): string | undefined => getCapabilityState(key, capabilities).reason;

export const isCapabilityEnabled = (
  key: CapabilityKey,
  capabilities: CapabilityMap = capabilitySnapshot,
): boolean => getCapabilityState(key, capabilities).enabled;

export const fetchCapabilities = async (): Promise<CapabilityMap> => {
  try {
    const payload = await apiFetch('/system/capabilities');
    const normalized = normalizeCapabilitiesResponse(payload);
    setCapabilitiesSnapshot(normalized);
    return normalized;
  } catch (error) {
    console.error('Failed to fetch capabilities:', error);
    setCapabilitiesSnapshot(DEFAULT_CAPABILITIES);
    return DEFAULT_CAPABILITIES;
  }
};

export function useCapabilities() {
  const query = useQuery({
    queryKey: CAPABILITIES_QUERY_KEY,
    queryFn: fetchCapabilities,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: getCapabilitiesSnapshot,
  });

  return {
    ...query,
    capabilities: query.data ?? getCapabilitiesSnapshot(),
  };
}
