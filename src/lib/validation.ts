// Input validation and sanitization utilities

// Basic XSS protection - sanitize HTML and script tags
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate date is not in the past and not too far in future (2 years)
export const isValidFutureDate = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const now = new Date();
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(now.getFullYear() + 2);
  
  return inputDate > now && inputDate <= twoYearsFromNow;
};

// Validate URL format if provided
export const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Sanitize and validate form data
export const validateEventData = (formData: any) => {
  const errors: string[] = [];
  
  // Title validation
  if (!formData.title?.trim()) {
    errors.push('Título é obrigatório');
  } else if (formData.title.length > 100) {
    errors.push('Título deve ter no máximo 100 caracteres');
  }
  
  // Date validation
  if (!formData.date) {
    errors.push('Data é obrigatória');
  } else if (!isValidFutureDate(`${formData.date}T${formData.time || '00:00'}`)) {
    errors.push('Data deve ser futura e dentro de 2 anos');
  }
  
  // Time validation
  if (!formData.time) {
    errors.push('Horário é obrigatório');
  }
  
  // Location validation
  if (!formData.location?.trim()) {
    errors.push('Local é obrigatório');
  } else if (formData.location.length > 200) {
    errors.push('Local deve ter no máximo 200 caracteres');
  }
  
  // Organizer name validation
  if (!formData.organizer_name?.trim()) {
    errors.push('Nome do organizador é obrigatório');
  } else if (formData.organizer_name.length > 100) {
    errors.push('Nome deve ter no máximo 100 caracteres');
  }
  
  // Email validation
  if (!formData.organizer_email?.trim()) {
    errors.push('Email é obrigatório');
  } else if (!isValidEmail(formData.organizer_email)) {
    errors.push('Email deve ter um formato válido');
  }
  
  // Optional fields validation
  if (formData.description && formData.description.length > 1000) {
    errors.push('Descrição deve ter no máximo 1000 caracteres');
  }
  
  if (formData.image_url && !isValidUrl(formData.image_url)) {
    errors.push('URL da imagem deve ser válida');
  }
  
  if (formData.max_attendees) {
    const maxAttendees = parseInt(formData.max_attendees);
    if (isNaN(maxAttendees) || maxAttendees < 1 || maxAttendees > 10000) {
      errors.push('Número máximo de participantes deve ser entre 1 e 10000');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize form data
export const sanitizeFormData = (formData: any) => {
  return {
    ...formData,
    title: sanitizeInput(formData.title),
    description: sanitizeInput(formData.description),
    location: sanitizeInput(formData.location),
    organizer_name: sanitizeInput(formData.organizer_name),
    organizer_email: formData.organizer_email?.toLowerCase().trim(),
    image_url: formData.image_url?.trim()
  };
};