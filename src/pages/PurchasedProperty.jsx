import { Home, LayoutDashboard, ArrowRight, CheckCircle } from 'lucide-react';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PurchasedProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-2xl border shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-2">Thank you for your purchase!</h1>
          <p className="text-white/90">Your property is now available.</p>
        </div>

        <div className="p-8 space-y-4">
          <button
            className="w-full py-4 bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2"
            onClick={() => navigate(propertyId ? `/properties/${propertyId}` : '/')}
          >
            <Home size={20} />
            {propertyId ? 'View Property' : 'Go Home'}
          </button>

          <button
            className="w-full py-4 border-2 border-[#E5E0D8] dark:border-[#2A342E] text-[#1A1A1A] dark:text-[#A8B5AE] bg-white rounded-xl font-semibold hover:border-ethiopian-green hover:text-ethiopian-green transition-all flex items-center justify-center gap-2"
            onClick={() => navigate('/buyer-dashboard')}
          >
            <LayoutDashboard size={20} />
            Go to Dashboard
          </button>

          <button
            className="w-full py-4 bg-[#F0EDE6] dark:bg-[#1C2420] text-foreground rounded-xl font-semibold hover:bg-[#F0EDE6] dark:bg-[#1C2420]/80 transition-all flex items-center justify-center gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowRight size={20} />
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasedProperty;


