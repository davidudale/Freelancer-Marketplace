const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const firstValidationError = data?.errors?.[0]?.msg;
    throw new Error(firstValidationError || data?.message || "Request failed");
  }

  return data;
};

const register = async (payload) => {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const login = async (payload) => {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const me = async () => {
  return request("/auth/me");
};

const logout = async () => {
  return request("/auth/logout", {
    method: "POST",
  });
};

const getProfile = async () => {
  return request("/profile/me");
};

const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append("document", file);

  const response = await fetch(`${API_BASE_URL}/profile/upload-document`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const firstValidationError = data?.errors?.[0]?.msg;
    throw new Error(firstValidationError || data?.message || "Upload failed");
  }

  return data;
};

const saveProfile = async (payload) => {
  return request("/profile", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const getMyListings = async () => {
  return request("/listings/mine");
};

const createListing = async (payload) => {
  return request("/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const updateListing = async (id, payload) => {
  return request(`/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

const searchListings = async (query) => {
  const params = new URLSearchParams(query).toString();
  return request(`/listings?${params}`);
};

const createBooking = async (payload) => {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const getClientBookings = async () => {
  return request("/bookings/client");
};

const getProviderBookings = async () => {
  return request("/bookings/provider");
};

const createQuote = async (bookingId, payload) => {
  return request(`/bookings/${bookingId}/quotes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const acceptQuote = async (bookingId, quoteId) => {
  return request(`/bookings/${bookingId}/quotes/${quoteId}/accept`, {
    method: "POST",
  });
};

const rejectQuote = async (bookingId, quoteId) => {
  return request(`/bookings/${bookingId}/quotes/${quoteId}/reject`, {
    method: "POST",
  });
};

const completeBooking = async (bookingId) => {
  return request(`/bookings/${bookingId}/complete`, {
    method: "POST",
  });
};

const cancelBooking = async (bookingId) => {
  return request(`/bookings/${bookingId}/cancel`, {
    method: "POST",
  });
};

const getAdminSummary = async () => {
  return request("/admin/summary");
};

const getEscrowByBooking = async (bookingId) => {
  return request(`/escrow/booking/${bookingId}`);
};

const fundEscrow = async (bookingId, payload = {}) => {
  return request(`/escrow/booking/${bookingId}/fund`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const releaseEscrow = async (bookingId) => {
  return request(`/escrow/booking/${bookingId}/release`, {
    method: "POST",
  });
};

const refundEscrow = async (bookingId) => {
  return request(`/escrow/booking/${bookingId}/refund`, {
    method: "POST",
  });
};

const getPublicStats = async () => {
  return request("/public-stats");
};

const getAdminUsers = async () => {
  return request("/admin/users");
};

const deleteAdminUser = async (userId) => {
  return request(`/admin/users/${userId}`, { method: "DELETE" });
};

const getAdminListings = async () => {
  return request("/admin/listings");
};

const toggleAdminListingActive = async (listingId) => {
  return request(`/admin/listings/${listingId}/toggle`, { method: "PUT" });
};

const getAdminBookings = async () => {
  return request("/admin/bookings");
};

const getAdminEscrows = async () => {
  return request("/admin/escrows");
};

const getPendingVerifications = async () => {
  return request("/admin/verifications");
};

const verifyProfile = async (profileId, status) => {
  return request(`/admin/verify/${profileId}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

const getProviderProfile = async (providerId) => {
  return request(`/profile/provider/${providerId}`);
};

export {
  register,
  login,
  me,
  logout,
  getProfile,
  saveProfile,
  uploadDocument,
  getMyListings,
  createListing,
  updateListing,
  searchListings,
  createBooking,
  getClientBookings,
  getProviderBookings,
  createQuote,
  acceptQuote,
  rejectQuote,
  completeBooking,
  cancelBooking,
  getAdminSummary,
  getEscrowByBooking,
  fundEscrow,
  releaseEscrow,
  refundEscrow,
  getPublicStats,
  getAdminUsers,
  deleteAdminUser,
  getAdminListings,
  toggleAdminListingActive,
  getAdminBookings,
  getAdminEscrows,
  getPendingVerifications,
  verifyProfile,
  getProviderProfile,
};
