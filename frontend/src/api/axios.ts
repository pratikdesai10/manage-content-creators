import axios from "axios"
import { useAuthStore } from "../stores/authStore"

const apiClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
	headers: {
		"Content-Type": "application/json",
	},
})

// Request interceptor: attach JWT token from Zustand store
apiClient.interceptors.request.use(
	config => {
		const token = useAuthStore.getState().token
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => Promise.reject(error),
)

// Response interceptor: handle 401 by logging out
apiClient.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			useAuthStore.getState().logout()
		}
		return Promise.reject(error)
	},
)

export default apiClient
