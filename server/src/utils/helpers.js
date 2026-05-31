// Helper functions for the application

/**
 * Generate a unique tracking ID for complaints
 * Format: LWMS-YYYYMMDD-XXXXX (where XXXXX is random)
 */
export const generateTrackingId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");

  return `LWMS-${year}${month}${day}-${random}`;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colors = {
    Pending: "#FFA500",
    "In Progress": "#3B82F6",
    Completed: "#10B981",
  };
  return colors[status] || "#6B7280";
};

/**
 * Paginate array
 */
export const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      pages: Math.ceil(array.length / limit),
    },
  };
};
