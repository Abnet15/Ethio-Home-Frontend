import { 
  Building, 
  MapPin, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Calendar,
  Home,
  Bed,
  Bath,
  Square
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';


const MyListings = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, pending, sold

  // Mock listings data - in a real app, this would come from an API
  const mockListings = [
    {
      id: 1,
      title: 'Modern Villa in Bole',
      location: 'Bole, Addis Ababa',
      price: 15000000,
      currency: 'ETB',
      type: 'sale',
      propertyType: 'Villa',
      bedrooms: 4,
      bathrooms: 3,
      area: 350,
      status: 'active',
      createdAt: '2024-01-15',
      views: 245,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Beautiful modern villa with garden and parking space.'
    },
    {
      id: 2,
      title: 'Apartment in Kazanchis',
      location: 'Kazanchis, Addis Ababa',
      price: 25000,
      currency: 'ETB',
      type: 'rent',
      propertyType: 'Apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 120,
      status: 'pending',
      createdAt: '2024-01-20',
      views: 156,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Cozy apartment in the heart of the city.'
    },
    {
      id: 3,
      title: 'Commercial Space in Merkato',
      location: 'Merkato, Addis Ababa',
      price: 8000000,
      currency: 'ETB',
      type: 'sale',
      propertyType: 'Commercial',
      bedrooms: 0,
      bathrooms: 2,
      area: 200,
      status: 'sold',
      createdAt: '2023-12-10',
      views: 89,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Prime commercial space perfect for retail business.'
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchListings = async () => {
      setLoading(true);
      // Filter listings by user (in a real app, this would be done server-side)
      const userListings = mockListings.filter(listing => {
        // For demo purposes, show all listings for sellers/agents/admins
        return user?.role === 'seller' || user?.role === 'agent' || user?.role === 'admin';
      });
      
      setTimeout(() => {
        setListings(userListings);
        setLoading(false);
      }, 1000);
    };

    fetchListings();
  }, [user]);

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'sold': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('en-US').format(price) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="bg-card rounded-xl border shadow-lg p-8 text-center max-w-md">
          <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-4">Please log in to view your listings</h2>
          <Link to="/login" className="inline-block px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ethiopian-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-2">My Listings</h1>
              <p className="text-xl text-muted-foreground">Manage your property listings</p>
            </div>
            <Link 
              to="/properties/new" 
              className="px-6 py-3 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Listing
            </Link>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white shadow-lg'
                  : 'bg-card border-2 border-gray-300 text-muted-foreground hover:border-ethiopian-green hover:text-foreground'
              }`}
              onClick={() => setFilter('all')}
            >
              All ({listings.length})
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white shadow-lg'
                  : 'bg-card border-2 border-gray-300 text-muted-foreground hover:border-ethiopian-green hover:text-foreground'
              }`}
              onClick={() => setFilter('active')}
            >
              Active ({listings.filter(l => l.status === 'active').length})
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white shadow-lg'
                  : 'bg-card border-2 border-gray-300 text-muted-foreground hover:border-ethiopian-green hover:text-foreground'
              }`}
              onClick={() => setFilter('pending')}
            >
              Pending ({listings.filter(l => l.status === 'pending').length})
            </button>
            <button
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                filter === 'sold'
                  ? 'bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white shadow-lg'
                  : 'bg-card border-2 border-gray-300 text-muted-foreground hover:border-ethiopian-green hover:text-foreground'
              }`}
              onClick={() => setFilter('sold')}
            >
              Sold ({listings.filter(l => l.status === 'sold').length})
            </button>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Building className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No listings found</h2>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              {filter === 'all' 
                ? "You haven't created any listings yet." 
                : `No ${filter} listings found.`
              }
            </p>
            <Link 
              to="/properties/new" 
              className="px-8 py-4 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-lg font-semibold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-card rounded-xl border shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: getStatusColor(listing.status) }}>
                    {listing.status}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 text-ethiopian-yellow" />
                    <span className="text-sm">{listing.location}</span>
                  </div>
                  
                  <div className="text-2xl font-black text-ethiopian-green mb-4">
                    {formatPrice(listing.price, listing.currency)}
                    {listing.type === 'rent' && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      {listing.propertyType}
                    </span>
                    {listing.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {listing.bedrooms} bed
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {listing.bathrooms} bath
                    </span>
                    <span className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      {listing.area} m²
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(listing.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.views} views
                    </span>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Link 
                      to={`/properties/${listing.id}`} 
                      className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                    <Link 
                      to={`/properties/${listing.id}/edit`} 
                      className="flex-1 px-4 py-2 bg-ethiopian-yellow/20 hover:bg-ethiopian-yellow/30 text-ethiopian-yellow rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </Link>
                    <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .my-listings-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .listings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-content h1 {
          margin: 0;
          color: var(--text-primary);
        }

        .header-content p {
          margin: 0.5rem 0 0 0;
          color: var(--text-secondary);
        }

        .listings-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border-color);
          background: var(--card-bg);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: var(--primary-color);
        }

        .filter-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .listings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .listing-card {
          background: var(--card-bg);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .listing-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .listing-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .listing-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .listing-status {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .listing-content {
          padding: 1.5rem;
        }

        .listing-content h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.25rem;
        }

        .listing-location {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .listing-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-color);
          font-weight: 600;
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .price-type {
          color: var(--text-secondary);
          font-weight: 400;
          font-size: 0.875rem;
        }

        .listing-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .listing-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .listing-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          text-decoration: none;
          transition: background-color 0.2s;
        }

        .view-btn {
          background: var(--primary-color);
          color: white;
        }

        .view-btn:hover {
          background: var(--primary-hover);
        }

        .edit-btn {
          background: var(--secondary-color);
          color: var(--text-primary);
        }

        .edit-btn:hover {
          background: var(--secondary-hover);
        }

        .delete-btn {
          background: #ef4444;
          color: white;
        }

        .delete-btn:hover {
          background: #dc2626;
        }

        .empty-state, .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .empty-state svg, .loading-state svg {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .empty-state h2 {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          font-size: 1rem;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-hover);
        }

        @media (max-width: 768px) {
          .my-listings-container {
            padding: 1rem;
          }

          .listings-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .listings-grid {
            grid-template-columns: 1fr;
          }

          .listings-filters {
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }

          .filter-btn {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default MyListings;

