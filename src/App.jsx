import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from "@/context/AuthContext";

import DashboardRedirect from "./components/DashboardRedirect";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import TestConnection from "./components/TestConnection";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
// Pages
import About from "./pages/About";
import AdminActivity from "./pages/AdminActivity";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMessages from "./pages/AdminMessages";
import AdminPropertyManagement from "./pages/AdminPropertyManagement";
import AdminReviews from "./pages/AdminReviews";
import AdminRoleManagement from "./pages/AdminRoleManagement";
import AdminUserManagement from "./pages/AdminUserManagement";
import AgentDashboard from "./pages/AgentDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Contact from "./pages/Contact";
import EmailVerification from "./pages/EmailVerification";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Favorites from "./pages/Favorites";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import MyListings from "./pages/MyListings";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentVerification from "./pages/PaymentVerification";
import AgentProfile from "./pages/ProfessionalProfile";
import Profile from "./pages/Profile";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import PropertyForm from "./pages/PropertyForm";
import PropertyVerificationPending from "./pages/PropertyVerificationPending";
import PurchasedProperty from "./pages/PurchasedProperty";
import ResetPassword from "./pages/ResetPassword";
import ReviewForm from "./pages/ReviewForm";
import SellerDashboard from "./pages/SellerDashboard";
import Signup from "./pages/Signup";
import Subscription from "./pages/Subscription";
import SubscriptionCreatePlan from "./pages/SubscriptionCreatePlan";
import SubscriptionPaymentVerification from "./pages/SubscriptionPaymentVerification";
import Unauthorized from "./pages/Unauthorized";

// Styles
import "./App.css";
import "./styles/design-system.css";

      function App() {
        // Wrapper component to handle Navbar re-rendering
        const AppContent = () => {
          const { user, isAuthenticated } = useAuth();
          
          return (
            <Router>
              <div className="App">
                <Navbar key={`navbar-${isAuthenticated ? 'authenticated' : 'guest'}-${user?.role || 'none'}`} />
                      <main className="app-main page-transition">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          {/* <Route path="/test" element={<TestConnection />} /> */}
                          <Route path="/properties" element={<Properties />} />
                          <Route path="/properties/:id" element={<PropertyDetails />} />
                          <Route path="/payment/:propertyId" element={<Payment />} />
                          <Route path="/payment-success" element={<PaymentSuccess />} />
                          <Route path="/selling/verify-payment/:tx_ref" element={<PaymentVerification />} />
                          <Route path="/property/verification-pending" element={<PrivateRoute allowedRoles={["seller","agent","employee","admin"]}><PropertyVerificationPending /></PrivateRoute>} />
                          <Route path="/review-form/:propertyId?" element={<ReviewForm />} />
                          <Route path="/purchased/:propertyId?" element={<PurchasedProperty />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password/:token" element={<ResetPassword />} />
                          <Route path="/users/verifyEmail/:userId" element={<EmailVerification />} />
                          <Route
                            path="/properties/new"
                            element={
                              <PrivateRoute allowedRoles={["seller", "agent", "employee", "admin"]}>
                                <PropertyForm />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/properties/:id/edit"
                            element={
                              <PrivateRoute allowedRoles={["seller", "agent", "employee", "admin"]}>
                                <PropertyForm />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/dashboard"
                            element={
                              <PrivateRoute>
                                <DashboardRedirect />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/favorites"
                            element={
                              <PrivateRoute>
                                <Favorites />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <PrivateRoute>
                                <Profile />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/my-listings"
                            element={
                              <PrivateRoute>
                                <MyListings />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/professional-profile"
                            element={
                              <PrivateRoute allowedRoles={["agent"]}>
                                <AgentProfile />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/buyer-dashboard"
                            element={
                              <PrivateRoute allowedRoles={["buyer"]}>
                                <BuyerDashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/seller-dashboard"
                            element={
                              <PrivateRoute allowedRoles={["seller"]}>
                                <SellerDashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/agent-dashboard"
                            element={
                              <PrivateRoute allowedRoles={["agent"]}>
                                <AgentDashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/employee-dashboard"
                            element={
                              <PrivateRoute allowedRoles={["employee"]}>
                                <EmployeeDashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin-dashboard"
                            element={
                              <PrivateRoute allowedRoles={["admin"]}>
                                <AdminDashboard />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin/users"
                            element={
                              <PrivateRoute allowedRoles={["admin"]}>
                                <AdminUserManagement />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin/properties"
                            element={
                              <PrivateRoute allowedRoles={["admin"]}>
                                <AdminPropertyManagement />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin/roles"
                            element={
                              <PrivateRoute allowedRoles={["admin"]}>
                                <AdminRoleManagement />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin/messages"
                            element={
                              <PrivateRoute allowedRoles={["admin", "employee"]}>
                                <AdminMessages />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin/reviews"
                            element={
                              <PrivateRoute allowedRoles={["admin"]}>
                                <AdminReviews />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin/activity"
                            element={
                              <PrivateRoute allowedRoles={["admin"]}>
                                <AdminActivity />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin/properties-list"
                            element={
                              <PrivateRoute allowedRoles={["admin"]}>
                                <AdminPropertyManagement />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/messages"
                            element={
                              <PrivateRoute>
                                <Messages />
                              </PrivateRoute>
                            }
                          />
                          <Route path="/unauthorized" element={<Unauthorized />} />
                          <Route path="/subscription" element={<Subscription />} />
                          <Route path="/subscription/create-plan" element={<PrivateRoute allowedRoles={["seller","agent"]}><SubscriptionCreatePlan /></PrivateRoute>} />
                          <Route path="/subscription/verify-payment/:tx_ref" element={<SubscriptionPaymentVerification />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="*" element={<div>404 - Page Not Found</div>} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  </Router>
            );
        };

        return (
          <ThemeProvider>
            <LanguageProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        );
      }

      export default App;
