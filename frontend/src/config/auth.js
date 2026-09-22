// Giriş yapan kullanıcının token'ını isteklere eklemek için
export const authHeaders = (extraHeaders = {}) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.token
    ? { ...extraHeaders, Authorization: `Bearer ${user.token}` }
    : extraHeaders;
};
