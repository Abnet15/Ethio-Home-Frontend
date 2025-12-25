import { ArrowLeft, Mail, Users, BarChart3, CheckCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import ContactManagement from '../components/ContactManagement';
import { useAuth } from '../context/AuthContext';


const AdminContacts = () => {
  const { user, isAdmin, isEmployee } = useAuth();
  const navigate = useNavigate();

  // Check if user has access
  if (!isAdmin && !isEmployee) {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                className="p-2 rounded-lg hover:bg-white/20 transition-colors" 
                onClick={() => navigate('/admin-dashboard')}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl font-black mb-2">Contact Form Management</h1>
                <p className="text-white/90">Manage and respond to customer inquiries and support requests</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Mail size={16} />
                <span>Contact Forms</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Users size={16} />
                <span>{isAdmin ? 'Admin' : 'Employee'} Access</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <BarChart3 size={16} />
                <span>Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <ContactManagement 
          userRole={isAdmin ? 'admin' : 'employee'}
          showStats={true}
          showActions={true}
        />

        {/* Info Section */}
        <div className="mt-8 bg-card rounded-xl border shadow-lg p-6">
          <h3 className="text-2xl font-black text-foreground mb-4">Contact Management Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-foreground mb-3">For All Staff (Admin & Employee)</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  View all contact form submissions
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Update contact status (new, in-progress, resolved, closed)
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Respond to customer inquiries
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Add internal notes and comments
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Set priority levels (low, medium, high, urgent)
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  Filter and search contacts by various criteria
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-3">Admin Only Features</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-blue-500 mr-2" />
                  Delete contact form submissions
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-blue-500 mr-2" />
                  Assign contacts to specific employees
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-blue-500 mr-2" />
                  Full access to all contact management features
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-blue-500 mr-2" />
                  Manage contact priorities and categories
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mt-8 bg-card rounded-xl border shadow-lg p-6">
          <h3 className="text-2xl font-black text-foreground mb-4">Contact Workflow</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-black text-2xl">1</span>
              </div>
              <h4 className="font-bold text-foreground mb-1">Customer Submits</h4>
              <p className="text-sm text-muted-foreground">Contact form is submitted through the website</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-black text-2xl">2</span>
              </div>
              <h4 className="font-bold text-foreground mb-1">Staff Reviews</h4>
              <p className="text-sm text-muted-foreground">Admin or employee reviews and categorizes the inquiry</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-black text-2xl">3</span>
              </div>
              <h4 className="font-bold text-foreground mb-1">Response Provided</h4>
              <p className="text-sm text-muted-foreground">Staff responds to the customer inquiry</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-gray-600 font-black text-2xl">4</span>
              </div>
              <h4 className="font-bold text-foreground mb-1">Resolution</h4>
              <p className="text-sm text-muted-foreground">Contact is marked as resolved or closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;
