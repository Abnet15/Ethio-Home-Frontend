import {
  Shield,
  Users,
  Award,
  Target,
  Heart,
  CheckCircle,
  Building,
  Globe,
  Clock,
  Star,
  TrendingUp,
  MapPin,
  ArrowRight,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import { aboutService } from "../services/aboutService";
import { propertyService } from "../services/propertyService";
import { userService } from "../services/userService";

const About = () => {
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load about content from API (for future dynamic content)
  useEffect(() => {
    const loadAboutContent = async () => {
      setLoading(true);
      try {
        const result = await aboutService.getAboutContent();
        if (result.success) {
          setAboutContent(result.data.data.about);
        } else {
          console.warn("Failed to load about content:", result.error);
        }
      } catch (error) {
        console.error("Failed to load about content:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAboutContent();
  }, []);

  // Fetch real stats from database
  const [stats, setStats] = useState([
    { icon: Building, label: "Properties Listed", value: "Loading..." },
    { icon: Users, label: "Happy Clients", value: "Loading..." },
    { icon: CheckCircle, label: "Verified Properties", value: "Loading..." },
    { icon: Award, label: "Years of Experience", value: "Loading..." },
  ]);

  // Load real stats from database
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Prefer lightweight public computations from existing endpoints
        // 1) Properties list (public) to compute counts and verified %
        const propsRes = await propertyService.getProperties({ limit: 500 });
        const props = propsRes.success ? propsRes.data?.data?.data || [] : [];
        const propertiesCount = props.length;
        const verifiedCount = props.filter(
          (p) => p.isVerified || p.status === "approved"
        ).length;
        const verifiedPercentage =
          propertiesCount > 0
            ? Math.round((verifiedCount / propertiesCount) * 100)
            : 0;

        // 2) Users count (protected). Try; if fails, approximate by unique owners from properties
        let usersCount = 0;
        try {
          const usersRes = await userService.getUsers();
          // Some backends include total in headers or response; try common shapes
          usersCount = usersRes.success
            ? usersRes.data?.results ||
              usersRes.data?.total ||
              usersRes.data?.data?.results ||
              0
            : 0;
          if (!usersCount) {
            const listRes = await userService.getUsers({ limit: 200 });
            const users = listRes.success ? listRes.data?.data?.data || [] : [];
            usersCount = users.length;
          }
        } catch (_) {
          // Fallback: unique owners derived from properties
          const uniqueOwners = new Set(
            (props || []).map((p) => p.owner?._id || p.owner || "")
          );
          usersCount = Math.max(0, uniqueOwners.size);
        }

        // Calculate years of experience (from 2016)
        const currentYear = new Date().getFullYear();
        const yearsOfExperience = currentYear - 2016;

        setStats([
          {
            icon: Building,
            label: "Properties Listed",
            value: `${propertiesCount.toLocaleString()}`,
          },
          {
            icon: Users,
            label: "Happy Clients",
            value: `${usersCount.toLocaleString()}`,
          },
          {
            icon: CheckCircle,
            label: "Verified Properties",
            value: `${verifiedPercentage}%`,
          },
          {
            icon: Award,
            label: "Years of Experience",
            value: `${yearsOfExperience}`,
          },
        ]);
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Fallback to static data if API fails
        setStats([
          { icon: Building, label: "Properties Listed", value: "0" },
          { icon: Users, label: "Happy Clients", value: "0" },
          { icon: CheckCircle, label: "Verified Properties", value: "0%" },
          {
            icon: Award,
            label: "Years of Experience",
            value: `${new Date().getFullYear() - 2016}`,
          },
        ]);
      }
    };

    loadStats();
  }, []);

  const values = aboutContent?.values
    ? aboutContent.values.map((value, index) => ({
        icon: [Shield, Heart, Target, Globe][index] || Shield, // Map to appropriate icons
        title: value.title,
        description: value.description,
      }))
    : [
        {
          icon: Shield,
          title: "Trust & Transparency",
          description:
            "We believe in complete transparency in all our dealings. Every property is thoroughly verified, and we provide honest, accurate information to help you make informed decisions.",
        },
        {
          icon: Heart,
          title: "Customer-Centric Approach",
          description:
            "Our clients are at the heart of everything we do. We listen to your needs, understand your dreams, and work tirelessly to help you find the perfect property.",
        },
        {
          icon: Target,
          title: "Excellence in Service",
          description:
            "We strive for excellence in every interaction. From the first inquiry to the final handover, we ensure a smooth, professional, and satisfying experience.",
        },
        {
          icon: Globe,
          title: "Local Expertise",
          description:
            "With deep knowledge of the Ethiopian real estate market, we provide insights and guidance that only comes from years of local experience and expertise.",
        },
      ];

  const team = aboutContent?.team || [
    {
      name: "Abnet Sisay",
      role: "Founder & CEO",
      experience: "15+ years in real estate",
      description:
        "Visionary leader with extensive experience in Ethiopian property development and investment.",
    },
    {
      name: "Weldeamlak Mezgebu",
      role: "Head of Operations",
      experience: "12+ years in operations",
      description:
        "Ensures smooth operations and exceptional customer service across all our platforms.",
    },
    {
      name: "Elshady",
      role: "Chief Technology Officer",
      experience: "10+ years in tech",
      description:
        "Leads our technology initiatives to provide the best digital real estate experience.",
    },
    {
      name: "Fitsum",
      role: "Head of Sales",
      experience: "8+ years in sales",
      description:
        "Drives our sales strategy and helps clients find their perfect properties.",
    },
  ];

  const milestones = aboutContent?.milestones || [
    {
      year: "2016",
      title: "Company Founded",
      description:
        "Ethio-Home was established with a vision to revolutionize Ethiopian real estate.",
    },
    {
      year: "2018",
      title: "Digital Platform Launch",
      description:
        "Launched our comprehensive online platform for property search and management.",
    },
    {
      year: "2020",
      title: "1000+ Properties",
      description:
        "Reached the milestone of 1000+ verified properties on our platform.",
    },
    {
      year: "2022",
      title: "Market Leadership",
      description:
        "Became the leading digital real estate platform in Ethiopia.",
    },
    {
      year: "2024",
      title: "Future Vision",
      description:
        "Expanding to serve more cities and introducing advanced AI-powered features.",
    },
  ]; // Show loading state while content is being fetched
  if (loading) {
    return (
      <div className="about-page">
        <div className="container">
          <div className="loading-state text-center py-20">
            <div
              className="loading-spinner mx-auto mb-4"
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <p className="text-lg">Loading about content...</p>
          </div>
        </div>
        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
    );
  }

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero bg-gradient-primary text-white">
        <div className="container">
          <div className="hero-content text-center fade-in">
            <h1 className="hero-title">About Ethio-Home</h1>
            <p className="hero-subtitle">
              Pioneering the future of real estate in Ethiopia through
              technology, trust, and transparency
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-2 gap-16 items-center">
            <div className="mission-content slide-up">
              <h2 className="text-4xl font-bold text-secondary-800 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-secondary-600 mb-6 leading-relaxed">
                To revolutionize the Ethiopian real estate market by providing a
                transparent, efficient, and user-friendly platform that connects
                property seekers with their dream homes while ensuring the
                highest standards of quality and trust.
              </p>
              <p className="text-lg text-secondary-600 mb-8 leading-relaxed">
                We believe that everyone deserves access to quality housing, and
                we're committed to making the property search process as smooth
                and reliable as possible for all our users.
              </p>
              <div className="flex gap-4">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to Top
                  <ArrowRight />
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => (window.location.href = "/contact")}
                >
                  Contact Us
                </button>
              </div>
            </div>
            <div
              className="mission-image slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="card p-8">
                <div className="text-center">
                  <Building className="w-24 h-24 mx-auto mb-6 text-primary-500" />
                  <h3 className="text-2xl font-bold text-secondary-800 mb-4">
                    Trusted Platform
                  </h3>
                  <p className="text-secondary-600">
                    Join thousands of satisfied customers who found their
                    perfect property with Ethio-Home
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="section bg-secondary-50">
        <div className="container">
          <div className="section-header mb-12">
            <h2 className="section-title">Our Achievements</h2>
            <p className="section-subtitle">
              Real numbers that reflect our commitment to excellence
            </p>
          </div>
          <div className="grid grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="stat-card card text-center slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="stat-icon">
                  <stat.icon />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Core Values</h2>
            <p className="section-subtitle">
              The principles that guide everything we do at Ethio-Home
            </p>
          </div>

          <div className="grid grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="value-card card slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="value-icon">
                  <value.icon />
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section bg-secondary-50">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle">
              The passionate professionals behind Ethio-Home's success
            </p>
          </div>

          <div className="grid grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="team-card card slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="team-avatar">
                  <Users />
                </div>
                <div className="team-info">
                  <h3 className="team-name">{member.name}</h3>
                  <div className="team-role">{member.role}</div>
                  <div className="team-experience">{member.experience}</div>
                  <p className="team-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Journey</h2>
            <p className="section-subtitle">
              Key milestones in Ethio-Home's growth and development
            </p>
          </div>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="timeline-item slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  <div className="timeline-line"></div>
                </div>
                <div className="timeline-content card">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3 className="timeline-title">{milestone.title}</h3>
                  <p className="timeline-description">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}

      <style>{`
        .mission-image {
          position: relative;
        }

        .stat-card {
          padding: var(--space-8);
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          background: var(--gradient-primary);
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
          color: white;
          flex-shrink: 0;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--primary-600);
          margin-bottom: var(--space-2);
          line-height: 1;
          text-align: center;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .stat-label {
          color: var(--secondary-600);
          font-weight: 500;
          text-align: center;
          line-height: 1.4;
          word-wrap: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }

        .value-card {
          padding: var(--space-8);
          text-align: center;
        }

        .value-icon {
          width: 80px;
          height: 80px;
          background: var(--gradient-secondary);
          border-radius: var(--radius-2xl);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-6);
          color: white;
        }

        .value-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary-800);
          margin-bottom: var(--space-3);
        }

        .value-description {
          color: var(--secondary-600);
          line-height: 1.6;
        }

        .team-card {
          padding: var(--space-6);
          text-align: center;
        }

        .team-avatar {
          width: 80px;
          height: 80px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-4);
          color: white;
        }

        .team-name {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--secondary-800);
          margin-bottom: var(--space-1);
        }

        .team-role {
          color: var(--primary-600);
          font-weight: 600;
          margin-bottom: var(--space-1);
        }

        .team-experience {
          color: var(--secondary-500);
          font-size: 0.875rem;
          margin-bottom: var(--space-3);
        }

        .team-description {
          color: var(--secondary-600);
          line-height: 1.6;
          font-size: 0.875rem;
        }

        .timeline {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
        }

        .timeline-item {
          display: flex;
          margin-bottom: var(--space-8);
        }

        .timeline-marker {
          position: relative;
          margin-right: var(--space-6);
        }

        .timeline-dot {
          width: 20px;
          height: 20px;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          border: 4px solid white;
          box-shadow: var(--shadow-md);
        }

        .timeline-line {
          position: absolute;
          left: 50%;
          top: 20px;
          width: 2px;
          height: calc(100% + var(--space-8));
          background: var(--gradient-primary);
          transform: translateX(-50%);
        }

        .timeline-item:last-child .timeline-line {
          display: none;
        }

        .timeline-content {
          flex: 1;
          padding: var(--space-6);
        }

        .timeline-year {
          display: inline-block;
          background: var(--gradient-primary);
          color: white;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: var(--space-3);
        }

        .timeline-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--secondary-800);
          margin-bottom: var(--space-2);
        }

        .timeline-description {
          color: var(--secondary-600);
          line-height: 1.6;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
        }

        .contact-link {
          color: white;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .contact-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
          
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .stat-card {
            min-height: 180px;
            padding: var(--space-6);
          }
          
          .stat-value {
            font-size: 2rem;
          }
          
          .stat-label {
            font-size: 0.9rem;
          }
          
          .timeline-item {
            flex-direction: column;
          }
          
          .timeline-marker {
            margin-right: 0;
            margin-bottom: var(--space-4);
          }
          
          .timeline-line {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .grid-cols-4 {
            grid-template-columns: 1fr;
          }
          
          .stat-card {
            min-height: 160px;
            padding: var(--space-4);
          }
          
          .stat-value {
            font-size: 1.75rem;
          }
          
          .stat-label {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
