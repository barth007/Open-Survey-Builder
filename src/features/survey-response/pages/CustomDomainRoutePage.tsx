import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { apiFetch } from '@/lib/api';
import type { ResolvedCustomDomainRoute } from '@/types/custom-domain';
import PublicSurvey from './PublicSurvey';

const CustomDomainRoutePage = () => {
  const location = useLocation();
  const host = typeof window !== 'undefined' ? window.location.host : '';

  const resolveQuery = useQuery({
    queryKey: ['customDomainRoute', host, location.pathname],
    queryFn: async () => await apiFetch(
      `/domains/resolve?host=${encodeURIComponent(host)}&path=${encodeURIComponent(location.pathname)}`,
    ) as ResolvedCustomDomainRoute,
    enabled: Boolean(host),
    retry: false,
  });

  if (resolveQuery.isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (resolveQuery.error || !resolveQuery.data) {
    return (
      <ErrorState
        fullScreen
        title="Page Not Found"
        message="This path does not resolve to a published branded form."
      />
    );
  }

  return (
    <PublicSurvey
      publicCodeOverride={resolveQuery.data.publicCode}
      domainContext={resolveQuery.data.domain}
    />
  );
};

export default CustomDomainRoutePage;
