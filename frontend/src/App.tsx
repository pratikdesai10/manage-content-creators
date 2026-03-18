import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "react-hot-toast"
import { PageLayout } from "./components/layout/PageLayout"
import { ProtectedRoute } from "./components/common/ProtectedRoute"
import { RoleRoute } from "./components/common/RoleRoute"
import { Home } from "./pages/Home"
import { Login } from "./pages/Login"
import { CreatorSignup } from "./pages/signup/CreatorSignup"
import { AgencySignup } from "./pages/signup/AgencySignup"
import { EmailVerification } from "./pages/signup/EmailVerification"
import { CreatorDashboard } from "./pages/dashboard/CreatorDashboard"
import { AgencyDashboard } from "./pages/dashboard/AgencyDashboard"
import { CreatorDiscovery } from "./pages/creators/CreatorDiscovery"
import { CreatorPublicProfile } from "./pages/creators/CreatorPublicProfile"
import { AgencyPublicProfile } from "./pages/agencies/AgencyPublicProfile"
import { CreatorEditProfile } from "./pages/dashboard/CreatorEditProfile"
import { AgencyEditProfile } from "./pages/dashboard/AgencyEditProfile"
import { Settings } from "./pages/Settings"
import { NotFound } from "./pages/NotFound"

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 1,
		},
	},
})

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<Toaster position="top-right" />
				<Routes>
					<Route element={<PageLayout />}>
						{/* Public routes */}
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/signup/creator" element={<CreatorSignup />} />
						<Route path="/signup/agency" element={<AgencySignup />} />
						<Route path="/signup/verify-email" element={<EmailVerification />} />

						{/* Protected — any authenticated role */}
						<Route element={<ProtectedRoute />}>
							<Route path="/creators" element={<CreatorDiscovery />} />
							<Route path="/creators/:id" element={<CreatorPublicProfile />} />
							<Route path="/agencies/:id" element={<AgencyPublicProfile />} />
							<Route path="/settings" element={<Settings />} />

							{/* CREATOR only */}
							<Route element={<RoleRoute role="CREATOR" />}>
								<Route path="/dashboard/creator" element={<CreatorDashboard />} />
								<Route path="/dashboard/creator/edit-profile" element={<CreatorEditProfile />} />
							</Route>

							{/* AGENCY only */}
							<Route element={<RoleRoute role="AGENCY" />}>
								<Route path="/dashboard/agency" element={<AgencyDashboard />} />
								<Route path="/dashboard/agency/edit-profile" element={<AgencyEditProfile />} />
							</Route>
						</Route>

						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	)
}
