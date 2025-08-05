import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Eye,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Check,
  X,
  Settings,
} from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/property-card-unbelievable.css";

const PropertyCard = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  viewMode = "grid",
  isAdmin = false,
  onStatusChange = null,
  onImageManage = null,
  canManageImages = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle multiple images - backend provides imagesUrl array or fallback to images array
  const imagesRaw =
    property.imagesUrl && Array.isArray(property.imagesUrl)
      ? property.imagesUrl
      : property.images && Array.isArray(property.images)
      ? property.images
      : [property.image];
  const images = (imagesRaw || []).filter(Boolean);
  if (images.length === 0) {
    images.push("/vite.svg");
  }

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    //e.stopPropagation();
    /* if (onToggleFavorite) { */
    onToggleFavorite(property._id);
    console.log("property._id", property._id);

    //}
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleApprove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(property._id, "approved");
    }
  };

  const handleReject = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onStatusChange) {
      onStatusChange(property._id, "rejected");
    }
  };

  if (viewMode === "list") {
    return (
      <div className="property-card-list">
        <div className="property-image-container">
          <img
            src={images[currentImageIndex]}
            alt={property.title}
            className="property-image"
          />

          {/* Image Navigation Controls */}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="image-nav-btn prev-btn">
                <ChevronLeft style={{ width: "16px", height: "16px" }} />
              </button>
              <button onClick={nextImage} className="image-nav-btn next-btn">
                <ChevronRight style={{ width: "16px", height: "16px" }} />
              </button>

              {/* Image Counter */}
              <div className="image-counter">
                <ImageIcon style={{ width: "14px", height: "14px" }} />
                {currentImageIndex + 1}/{images.length}
              </div>

              {/* Image Dots */}
              <div className="image-dots">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => goToImage(index, e)}
                    className={`image-dot ${
                      index === currentImageIndex ? "active" : ""
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="property-badges">
            <span
              className={`status-badge ${(property.status || "unknown")
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {property.status || "Unknown"}
            </span>
            {property.isVerified && (
              <span className="verified-badge">
                <CheckCircle style={{ width: "14px", height: "16px" }} />
                Verified
              </span>
            )}
          </div>

          {/* Image Management Button */}
          {canManageImages && onImageManage && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onImageManage();
              }}
              className="image-manage-btn"
              title="Manage Images"
            >
              <Settings size={16} />
            </button>
          )}

          {onToggleFavorite && (
            <button
              onClick={handleFavoriteClick}
              className={`favorite-btn ${isFavorite ? "active" : ""}`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart style={{ width: "18px", height: "18px" }} />
            </button>
          )}

          {/* Admin Actions */}
          {isAdmin && onStatusChange && (
            <div className="admin-actions">
              <button
                onClick={handleApprove}
                className="admin-action-btn approve"
                title="Approve Property"
              >
                <Check style={{ width: "16px", height: "16px" }} />
              </button>
              <button
                onClick={handleReject}
                className="admin-action-btn reject"
                title="Reject Property"
              >
                <X style={{ width: "16px", height: "16px" }} />
              </button>
            </div>
          )}
        </div>

        <div className="property-content">
          <div className="property-header">
            <div className="property-price">
              ETB {formatPrice(property.price)}
              <span className="property-type">{property.type}</span>
            </div>
            <h3 className="property-title">
              <Link to={`/properties/${property._id || property.id}`}>
                {property.title}
              </Link>
            </h3>
            <div className="property-location">
              <MapPin style={{ width: "14px", height: "14px" }} />
              {property.location}
            </div>
          </div>

          <div className="property-features">
            {property.bedrooms && (
              <div className="feature">
                <Bed style={{ width: "16px", height: "16px" }} />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="feature">
                <Bath style={{ width: "16px", height: "16px" }} />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.features?.bedrooms && (
              <div className="feature">
                <Bed style={{ width: "16px", height: "16px" }} />
                <span>{property.features.bedrooms}</span>
              </div>
            )}
            {property.features?.bathrooms && (
              <div className="feature">
                <Bath style={{ width: "16px", height: "16px" }} />
                <span>{property.features.bathrooms}</span>
              </div>
            )}
            <div className="feature">
              <Square style={{ width: "16px", height: "16px" }} />
              <span>{property.features?.area || property.area || "N/A"}m²</span>
            </div>
            {property.features?.parking && (
              <div className="feature">
                <span>🚗 Parking</span>
              </div>
            )}
          </div>

          <p className="property-description">{property.description}</p>

          {/* Admin Approval Buttons - Show prominently for pending properties */}
          {isAdmin && property.status === "pending" && (
            <div className="admin-approval-buttons">
              <button
                onClick={handleApprove}
                className="admin-approve-btn"
                title="Approve Property"
              >
                <Check style={{ width: "16px", height: "16px" }} />
                Approve
              </button>
              <button
                onClick={handleReject}
                className="admin-reject-btn"
                title="Reject Property"
              >
                <X style={{ width: "16px", height: "16px" }} />
                Reject
              </button>
            </div>
          )}

          <div className="property-actions">
            <Link
              to={`/properties/${property._id || property.id}`}
              className="btn btn-primary"
            >
              <Eye style={{ width: "16px", height: "16px" }} />
              View Details
            </Link>
            {/* <Link to={`/properties/${property._id || property.id}`} className="btn btn-secondary">
            <button>
              <Calendar style={{ width: "16px", height: "16px" }} />
              Schedule Visit
            </button>
            </Link> */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="property-card">
      <div className="property-image-container">
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          className="property-image"
        />

        {/* Image Navigation Controls */}
        {images.length > 1 && (
          <>
            <button onClick={prevImage} className="image-nav-btn prev-btn">
              <ChevronLeft style={{ width: "16px", height: "16px" }} />
            </button>
            <button onClick={nextImage} className="image-nav-btn next-btn">
              <ChevronRight style={{ width: "16px", height: "16px" }} />
            </button>

            {/* Image Counter */}
            <div className="image-counter">
              <ImageIcon style={{ width: "14px", height: "14px" }} />
              {currentImageIndex + 1}/{images.length}
            </div>

            {/* Image Dots */}
            <div className="image-dots">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`image-dot ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="property-badges">
          <span
            className={`status-badge ${(property.status || "unknown")
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {property.status || "Unknown"}
          </span>
          {property.isVerified && (
            <span className="verified-badge">
              <CheckCircle style={{ width: "14px", height: "16px" }} />
              Verified
            </span>
          )}
        </div>

        {/* Image Management Button */}
        {canManageImages && onImageManage && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onImageManage();
            }}
            className="image-manage-btn"
            title="Manage Images"
          >
            <Settings size={16} />
          </button>
        )}

        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={`favorite-btn ${isFavorite ? "active" : ""}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart style={{ width: "18px", height: "18px" }} />
          </button>
        )}
      </div>

      <div className="property-content">
        <div className="property-price">
          ETB {formatPrice(property.price)}
          <span className="property-type">{property.type}</span>
        </div>

        <h3 className="property-title">
          <Link to={`/properties/${property._id || property.id}`}>
            {property.title}
          </Link>
        </h3>

        <div className="property-location">
          <MapPin style={{ width: "14px", height: "16px" }} />
          {property.location}
        </div>

        <div className="property-features">
          {property.bedrooms && (
            <div className="feature">
              <Bed style={{ width: "16px", height: "16px" }} />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="feature">
              <Bath style={{ width: "16px", height: "16px" }} />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.features?.bedrooms && (
            <div className="feature">
              <Bed style={{ width: "16px", height: "16px" }} />
              <span>{property.features.bedrooms}</span>
            </div>
          )}
          {property.features?.bathrooms && (
            <div className="feature">
              <Bath style={{ width: "16px", height: "16px" }} />
              <span>{property.features.bathrooms}</span>
            </div>
          )}
          <div className="feature">
            <Square style={{ width: "16px", height: "16px" }} />
            <span>{property.features?.area || property.area || "N/A"}m²</span>
          </div>
          {property.features?.parking && (
            <div className="feature">
              <span>🚗 Parking</span>
            </div>
          )}
        </div>

        <p className="property-description">
          {(property.description || "").length > 100
            ? `${(property.description || "").substring(0, 100)}...`
            : property.description || ""}
        </p>

        {/* Admin Approval Buttons - Show prominently for pending properties */}
        {isAdmin && property.status === "pending" && (
          <div className="admin-approval-buttons">
            <button
              onClick={handleApprove}
              className="admin-approve-btn"
              title="Approve Property"
            >
              <Check style={{ width: "16px", height: "16px" }} />
              Approve
            </button>
            <button
              onClick={handleReject}
              className="admin-reject-btn"
              title="Reject Property"
            >
              <X style={{ width: "16px", height: "16px" }} />
              Reject
            </button>
          </div>
        )}

        <div className="property-actions">
          <Link
            to={`/properties/${property._id || property.id}`}
            className="btn btn-primary btn-sm"
          >
            View Details
          </Link>
          {/* <button className="btn btn-secondary btn-sm">Schedule Visit</button> */}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;