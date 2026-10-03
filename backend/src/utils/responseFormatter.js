/**
 * Response Formatter Utilities
 */

export const successResponse = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode, message, errorCode = null, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errorCode) {
    response.error = errorCode;
  }

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Format user data (exclude sensitive information)
export const formatUserData = (user) => {
  return {
    id: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

// Format club data
export const formatClubData = (club) => {
  return {
    id: club.clubId,
    name: club.name,
    address: club.address,
    email: club.email,
    phone: club.phone,
    website: club.website,
    sport: club.sport,
    country: club.country,
  };
};

// Format modules data
export const formatModulesData = (moduleConfig) => {
  const modules = [];
  
  if (moduleConfig.membership) modules.push("MEMBERSHIP");
  if (moduleConfig.courtBooking) modules.push("COURT_BOOKING");
  if (moduleConfig.shop) modules.push("SHOP");
  if (moduleConfig.bar) modules.push("BAR");
  if (moduleConfig.hr) modules.push("HR");
  if (moduleConfig.accounting) modules.push("ACCOUNTING");

  return modules;
};
