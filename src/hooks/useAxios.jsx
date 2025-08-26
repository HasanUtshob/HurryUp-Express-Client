import { useEffect } from "react";
import useAuth from "./useAuth";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://hurryup-express-server-1.onrender.com/",
});

const useAxios = () => {
  const { user } = useAuth();

  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        if (user) {
          try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error("Error getting token:", error);
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && user) {
          try {
            // Try to refresh token
            const newToken = await user.getIdToken(true);
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance.request(error.config);
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [user]);

  return axiosInstance;
};

export default useAxios;
