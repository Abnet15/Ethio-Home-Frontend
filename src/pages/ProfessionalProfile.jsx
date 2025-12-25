import {
  Award,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Star,
  Upload,
  Plus,
  X,
  Edit,
  Save,
  Camera,
} from "lucide-react";
import React, { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getUserPhotoFromResponse } from '../utils/imageUtils';

const AgentProfile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    title: "Senior Real Estate Agent",
    company: "Ethio-Home Realty",
    experience: "5+ years",
    specializations: [
      "Residential Properties",
      "Commercial Real Estate",
      "Property Investment",
    ],
    certifications: [
      {
        name: "Licensed Real Estate Agent",
        issuer: "Ethiopian Real Estate Association",
        year: "2019",
      },
      {
        name: "Property Valuation Certificate",
        issuer: "Ministry of Urban Development",
        year: "2020",
      },
    ],
    languages: ["English", "Amharic", "Oromo"],
    serviceAreas: ["Addis Ababa", "Bole", "Kazanchis", "Gerji"],
    bio: "Experienced real estate professional with over 5 years of expertise in the Ethiopian property market. Specialized in helping clients find their dream homes and investment properties. Committed to providing exceptional service and building long-term relationships.",
    achievements: [
      "Top Performer 2023 - Ethio-Home Realty",
      "Sold over 200 properties",
      "Client Satisfaction Rating: 4.9/5",
    ],
    socialMedia: {
      linkedin: "",
      facebook: "",
      instagram: "",
      website: "",
    },
    contactPreferences: {
      phone: true,
      email: true,
      whatsapp: true,
    },
  });

  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    year: "",
  });
  const [showAddCertification, setShowAddCertification] = useState(false);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim()) {
      setProfileData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()],
      }));
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index) => {
    setProfileData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (
      newCertification.name &&
      newCertification.issuer &&
      newCertification.year
    ) {
      setProfileData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification],
      }));
      setNewCertification({ name: "", issuer: "", year: "" });
      setShowAddCertification(false);
    }
  };

  const removeCertification = (index) => {
    setProfileData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    // Here you would typically save to the backend
    setIsEditing(false);
    // Show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="bg-gradient-to-r from-ethiopian-green to-ethiopian-green/90 p-8 text-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">Agent Profile</h1>
              <p className="text-white/90 text-lg">Showcase your expertise and build trust with clients</p>
            </div>
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="px-6 py-3 bg-white text-ethiopian-green rounded-lg font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit size={16} />
                  Edit Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            gap: "32px",
          }}
        >
          {/* Left Column - Profile Card */}
          <div>
            <div
              className="card"
              style={{ padding: "32px", textAlign: "center" }}
            >
              {/* Profile Photo */}
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginBottom: "24px",
                }}
              >
                {user?.photo ? (
                  <img
                    src={getUserPhotoFromResponse(user)}
                    alt={user.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "48px",
                      fontWeight: "700",
                      color: "white",
                    }}
                  >
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
                {isEditing && (
                  <button
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary)",
                      border: "3px solid var(--bg-primary)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Camera style={{ width: "16px", height: "16px" }} />
                  </button>
                )}
              </div>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                {user?.name}
              </h2>

              {isEditing ? (
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="form-input"
                  style={{ marginBottom: "16px", textAlign: "center" }}
                />
              ) : (
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {profileData.title}
                </p>
              )}

              {isEditing ? (
                <input
                  type="text"
                  value={profileData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                  className="form-input"
                  style={{ marginBottom: "24px", textAlign: "center" }}
                />
              ) : (
                <p
                  style={{
                    color: "var(--color-primary)",
                    fontSize: "16px",
                    fontWeight: "500",
                    marginBottom: "24px",
                  }}
                >
                  {profileData.company}
                </p>
              )}

              {/* Contact Info */}
              <div
                style={{
                  textAlign: "left",
                  borderTop: "1px solid var(--border-primary)",
                  paddingTop: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Mail
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "var(--text-secondary)",
                    }}
                  />
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    {user?.email}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <Phone
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "var(--text-secondary)",
                    }}
                  />
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    {user?.phone}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <MapPin
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "var(--text-secondary)",
                    }}
                  />
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    {user?.location}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <Briefcase
                    style={{
                      width: "16px",
                      height: "16px",
                      color: "var(--text-secondary)",
                    }}
                  />
                  <span
                    style={{ color: "var(--text-secondary)", fontSize: "14px" }}
                  >
                    {profileData.experience}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div
              className="card"
              style={{ padding: "24px", marginTop: "24px" }}
            >
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                }}
              >
                Professional Stats
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--color-primary)",
                    }}
                  >
                    200+
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Properties Sold
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--color-primary)",
                    }}
                  >
                    4.9
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Client Rating
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--color-primary)",
                    }}
                  >
                    5+
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Years Experience
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--color-primary)",
                    }}
                  >
                    150+
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Happy Clients
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {/* Bio */}
            <div className="card" style={{ padding: "24px" }}>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                }}
              >
                Professional Bio
              </h3>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="form-textarea"
                  rows="4"
                />
              ) : (
                <p
                  style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}
                >
                  {profileData.bio}
                </p>
              )}
            </div>

            {/* Specializations */}
            <div className="card" style={{ padding: "24px" }}>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                }}
              >
                Specializations
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: isEditing ? "16px" : "0",
                }}
              >
                {profileData.specializations.map((spec, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      borderRadius: "20px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {spec}
                    {isEditing && (
                      <button
                        onClick={() => removeSpecialization(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: "12px", height: "12px" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Add specialization"
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={addSpecialization}
                    className="btn btn-secondary"
                  >
                    <Plus style={{ width: "16px", height: "16px" }} />
                  </button>
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="card" style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}
                >
                  Certifications & Licenses
                </h3>
                {isEditing && (
                  <button
                    onClick={() => setShowAddCertification(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus style={{ width: "16px", height: "16px" }} />
                  </button>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {profileData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      border: "1px solid var(--border-primary)",
                      borderRadius: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "var(--text-primary)",
                          marginBottom: "4px",
                        }}
                      >
                        {cert.name}
                      </h4>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {cert.issuer}
                      </p>
                      <p
                        style={{
                          color: "var(--text-tertiary)",
                          fontSize: "12px",
                        }}
                      >
                        {cert.year}
                      </p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeCertification(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-error)",
                          cursor: "pointer",
                        }}
                      >
                        <X style={{ width: "16px", height: "16px" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {showAddCertification && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Certification name"
                      value={newCertification.name}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Issuing organization"
                      value={newCertification.issuer}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          issuer: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="Year obtained"
                      value={newCertification.year}
                      onChange={(e) =>
                        setNewCertification((prev) => ({
                          ...prev,
                          year: e.target.value,
                        }))
                      }
                      className="form-input"
                    />
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={addCertification}
                        className="btn btn-primary btn-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddCertification(false)}
                        className="btn btn-secondary btn-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Areas */}
            <div className="card" style={{ padding: "24px" }}>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                }}
              >
                Service Areas
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {profileData.serviceAreas.map((area, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderRadius: "20px",
                      fontSize: "14px",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    <MapPin
                      style={{
                        width: "12px",
                        height: "12px",
                        marginRight: "4px",
                        display: "inline",
                      }}
                    />
                    {area}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;
