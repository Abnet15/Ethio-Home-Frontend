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
          <Building className="h-16 w-16 mx-auto mb-4 text-[#4B5563] dark:text-[#A8B5AE]" />
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
          <p className="text-[#4B5563] dark:text-[#A8B5AE]">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(48 96% 53% / 0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-15"
             style={{ background: 'radial-gradient(circle, hsl(145 63% 32% / 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Premium Header */}
        <div className="mb-12 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="ethiopian-accent-bar w-16 mb-4"></div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">My Listings</h1>
              <p className="text-xl text-[#4B5563] dark:text-[#A8B5AE]">Manage your property listings</p>
            </div>
            <Link 
              to="/properties/new" 
              className="group px-8 py-4 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl font-bold text-lg shadow-lg hover:shadow-glow-green transition-all duration-300 flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Add New Listing
            </Link>
          </div>
        </div>

        {/* Premium Filter Buttons */}
        <div className="flex gap-4 flex-wrap mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {[
            { key: 'all', label: `All (${listings.length})` },
            { key: 'active', label: `Active (${listings.filter(l => l.status === 'active').length})` },
            { key: 'pending', label: `Pending (${listings.filter(l => l.status === 'pending').length})` },
            { key: 'sold', label: `Sold (${listings.filter(l => l.status === 'sold').length})` }
          ].map((item) => (
            <button
              key={item.key}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                filter === item.key
                  ? 'bg-gradient-to-r from-gold-400 to-gold-500 text-foreground shadow-glow-gold'
                  : 'glass border border-[#E5E0D8] dark:border-[#2A342E]/50 text-[#4B5563] dark:text-[#A8B5AE] hover:border-gold-400/30 hover:text-foreground'
              }`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-8 shadow-luxury">
              <Building className="h-16 w-16 text-[#4B5563] dark:text-[#A8B5AE]/50" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">No listings found</h2>
            <p className="text-lg text-[#4B5563] dark:text-[#A8B5AE] mb-8 text-center max-w-lg">
              {filter === 'all' 
                ? "You haven't created any listings yet." 
                : `No ${filter} listings found.`
              }
            </p>
            <Link 
              to="/properties/new" 
              className="px-10 py-5 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl font-bold text-lg hover:shadow-glow-green transition-all duration-300 flex items-center gap-3 hover:scale-[1.02]"
            >
              <Plus size={20} />
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 stagger-children">
            {filteredListings.map((listing, index) => (
              <div 
                key={listing.id} 
                className="group glass-card rounded-2xl border border-[#E5E0D8] dark:border-[#2A342E]/50 shadow-lg overflow-hidden hover:shadow-luxury hover:border-gold-400/30 transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <img 
                    src={listing.image} 
                    alt={listing.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent"></div>
                  
                  {/* Status badge */}
                  <div className="absolute top-4 left-4">
                    <span 
                      className="px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm"
                      style={{ 
                        backgroundColor: getStatusColor(listing.status),
                        boxShadow: `0 0 20px ${getStatusColor(listing.status)}50`
                      }}
                    >
                      {listing.status}
                    </span>
                  </div>
                  
                  {/* Price overlay */}
                  <div className="absolute bottom-4 left-4">
                    <span className="text-2xl font-black text-gradient-gold" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                      {formatPrice(listing.price, listing.currency)}
                      {listing.type === 'rent' && <span className="text-sm font-normal text-white/80">/month</span>}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5">
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3 group-hover:text-gold-500 transition-colors">{listing.title}</h3>
                  <div className="flex items-center gap-2 text-[#4B5563] dark:text-[#A8B5AE] mb-5">
                    <div className="p-1 rounded-md bg-gold-400/20">
                      <MapPin className="h-4 w-4 text-gold-500" />
                    </div>
                    <span className="text-sm">{listing.location}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-5 text-sm text-[#4B5563] dark:text-[#A8B5AE] flex-wrap">
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 rounded-lg">
                      <Home className="h-4 w-4 text-gold-500" />
                      {listing.propertyType}
                    </span>
                    {listing.bedrooms > 0 && (
                      <span className="flex items-center gap-2 px-3 py-1.5 bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 rounded-lg">
                        <Bed className="h-4 w-4 text-gold-500" />
                        {listing.bedrooms}
                      </span>
                    )}
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 rounded-lg">
                      <Bath className="h-4 w-4 text-gold-500" />
                      {listing.bathrooms}
                    </span>
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-[#F0EDE6]/50 dark:bg-[#1C2420]/50 rounded-lg">
                      <Square className="h-4 w-4 text-gold-500" />
                      {listing.area} m²
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-5 text-xs text-[#4B5563] dark:text-[#A8B5AE]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(listing.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.views} views
                    </span>
                  </div>

                  <div className="flex gap-3 pt-5 border-t border-[#E5E0D8] dark:border-[#2A342E]/50">
                    <Link 
                      to={`/properties/${listing.id}`} 
                      className="flex-1 px-4 py-3 glass border border-[#E5E0D8] dark:border-[#2A342E]/50 hover:border-gold-400/30 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 text-foreground hover:text-gold-500"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                    <Link 
                      to={`/properties/${listing.id}/edit`} 
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-gold-400/20 to-gold-500/10 border border-gold-400/30 text-gold-500 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-glow-gold"
                    >
                      <Edit size={16} />
                      Edit
                    </Link>
                    <button className="px-4 py-3 bg-ethiopian-red/10 border border-ethiopian-red/30 hover:bg-ethiopian-red/20 text-ethiopian-red rounded-xl font-semibold transition-all duration-300">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
