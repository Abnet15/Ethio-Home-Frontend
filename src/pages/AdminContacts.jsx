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
    <div className="modern-admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/admin-dashboard')}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Contact Form Management</h1>
            <p>Manage and respond to customer inquiries and support requests</p>
          </div>
        </div>
        <div className="header-right">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Mail size={16} />
              <span>Contact Forms</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users size={16} />
              <span>{isAdmin ? 'Admin' : 'Employee'} Access</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <BarChart3 size={16} />
              <span>Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <ContactManagement 
          userRole={isAdmin ? 'admin' : 'employee'}
          showStats={true}
          showActions={true}
        />
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Management Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">For All Staff (Admin & Employee)</h4>
            <ul className="space-y-2 text-sm text-gray-600">
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
            <h4 className="font-medium text-gray-800 mb-2">Admin Only Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
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
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Customer Submits</h4>
            <p className="text-sm text-gray-600">Contact form is submitted through the website</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-yellow-600 font-bold">2</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Staff Reviews</h4>
            <p className="text-sm text-gray-600">Admin or employee reviews and categorizes the inquiry</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <h4 className="text-sm font-medium text-gray-800 mb-1">Response Provided</h4>
            <p className="text-sm text-gray-600">Staff responds to the customer inquiry</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-gray-600 font-bold">4</span>
            </div>
            <h4 className="font-medium text-gray-800 mb-1">Resolution</h4>
            <p className="text-sm text-gray-600">Contact is marked as resolved or closed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;
