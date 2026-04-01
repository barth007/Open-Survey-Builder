const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const parseInvitationPayload = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false as const,
      message: 'A valid email address is required',
    };
  }

  const email = typeof (payload as { email?: unknown }).email === 'string'
    ? (payload as { email: string }).email.trim().toLowerCase()
    : '';
  const rawRole = typeof (payload as { role?: unknown }).role === 'string'
    ? (payload as { role: string }).role
    : undefined;

  if (!email || !EMAIL_PATTERN.test(email)) {
    return {
      success: false as const,
      message: 'A valid email address is required',
    };
  }

  if (rawRole && !['admin', 'member'].includes(rawRole)) {
    return {
      success: false as const,
      message: 'Invitation role must be admin or member',
    };
  }

  return {
    success: true as const,
    data: { email, role: rawRole as 'admin' | 'member' | undefined },
  };
};

export const parseRoleUpdatePayload = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false as const,
      message: 'Role must be admin or member',
    };
  }

  const role = typeof (payload as { role?: unknown }).role === 'string'
    ? (payload as { role: string }).role
    : '';

  if (!['admin', 'member'].includes(role)) {
    return {
      success: false as const,
      message: 'Role must be admin or member',
    };
  }

  return {
    success: true as const,
    data: { role: role as 'admin' | 'member' },
  };
};
