import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

/*==================== Response Interceptor ====================*/
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const is401 = error.response?.status === 401;
        const isRefreshRoute = originalRequest.url?.includes("/auth/refresh");
        const hasNotRetried = !originalRequest._retry;

        if (is401 && !isRefreshRoute && hasNotRetried) {
            originalRequest._retry = true;

            try {
                await api.post("/auth/refresh");
                return api(originalRequest);
            } catch {
                window.location.href = "/auth/sign-in";
            }
        }

        return Promise.reject(error);
    }
);
/*==================== End of Response Interceptor ====================*/

export default api;