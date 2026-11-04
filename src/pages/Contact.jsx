import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Building,
  Users,
  HeadphonesIcon,
  ArrowRight,
  CheckCircle,
  CreditCard,
  Sparkles,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { contactService } from "../services/contactService";
import ContactForm from "../components/ContactForm";

const Contact = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch departments and FAQs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [deptResult, faqResult] = await Promise.all([
          contactService.getContactDepartments(),
          contactService.getContactFAQs(),
        ]);
        if (deptResult.success) {
          setDepartments(
            deptResult.data?.data?.departments || deptResult.data?.departments || []
          );
        }
        if (faqResult.success) {
          setFaqs(faqResult.data?.data?.faqs || faqResult.data?.faqs || []);
        }
      } catch (error) {
        console.error("Error fetching contact data:", error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (formData) => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    try {
      const result = await contactService.submitContact(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      } else {
        console.error("Failed to submit contact form:", result.error);
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Building": return Building;
      case "Users": return Users;
      case "HeadphonesIcon": return HeadphonesIcon;
      case "CreditCard": return CreditCard;
      default: return Building;
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      details: ["Bahir Dar, Ethiopia", "Near City Center", "Main Business District"],
      color: "from-rose-500 to-pink-600",
    },
    {
      icon: Phone,
      title: "Call Us",
      details: ["+251 924 862894", "+251 9 3635 82 53", "Mon-Fri: 8:00 AM - 6:00 PM"],
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: Mail,
      title: "Email Us",
      details: ["info@ethio-home.com", "abnetsisay@gmail.com", "weldeamlak12@gmail.com"],
      color: "from-[#0B6E4F] to-indigo-600",
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 4:00 PM", "Sunday: Closed"],
      color: "from-amber-500 to-orange-600",
    },
  ];

  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#4B5563] dark:text-[#A8B5AE] text-lg">Loading contact information...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] relative overflow-hidden transition-colors duration-200">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(48 96% 53% / 0.2) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute bottom-1/3 left-0 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(145 63% 32% / 0.2) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-14 sm:py-18 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B6E4F] via-[#095C42] to-[#043324]" />
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-30" />
        <motion.div
          className="absolute top-10 left-10 w-60 h-60 bg-gold-400/20 rounded-full blur-3xl"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="h-1.5 w-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))]" />
            <h1
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
            >
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
              We're here to help you find your dream property. Contact us anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards - 4 per row */}
      <section className="py-10 sm:py-14 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 -mt-10 sm:-mt-14">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="absolute -inset-2 rounded-3xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${info.color} blur-xl opacity-30`} />
                </div>
                <div className="relative bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-4 md:p-6 h-full overflow-hidden group-hover:border-gold-400/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${info.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                  <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${info.color} text-white mb-3 md:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <info.icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-foreground mb-2 md:mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-[#4B5563] dark:text-[#A8B5AE] text-xs md:text-sm">
                        {info.title === "Call Us" && detail.includes("+251") ? (
                          <a href={`tel:${detail.replace(/\s/g, "")}`} className="hover:text-gold-500 transition-colors">
                            {detail}
                          </a>
                        ) : info.title === "Email Us" && detail.includes("@") ? (
                          <a href={`mailto:${detail}`} className="hover:text-gold-500 transition-colors">
                            {detail}
                          </a>
                        ) : (
                          detail
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Form Section */}
      <section className="py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ContactForm
                user={user}
                isAuthenticated={isAuthenticated}
                onSubmit={handleSubmit}
                loading={loading}
                success={success}
              />
            </motion.div>

            {/* Right Column - Info & Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Why Contact Us */}
              <div className="bg-card/95 backdrop-blur-xl rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E]/50 p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gold-500" />
                  </div>
                  Why Contact Us?
                </h3>
                <ul className="space-y-4">
                  {[
                    "Get expert guidance on property investments",
                    "Schedule property viewings at your convenience",
                    "Receive personalized property recommendations",
                    "Get answers to all your real estate questions",
                  ].map((item, index) => (
                    <motion.li
                      key={index}
                      className="flex items-start gap-3 text-[#4B5563] dark:text-[#A8B5AE]"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Map Preview */}
              <div className="bg-card/95 backdrop-blur-xl rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E]/50 overflow-hidden">
                <div className="relative h-64 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <MapPin className="w-16 h-16 text-accent mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Visit Our Office</h3>
                    <p className="text-[#4B5563] dark:text-[#A8B5AE] mb-4">Bahir Dar, Ethiopia</p>
                    <motion.button
                      onClick={() => {
                        const address = encodeURIComponent("Bahir Dar, Ethiopia");
                        window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Open in Maps
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: "24h", label: "Response Time" },
                  { value: "98%", label: "Satisfaction Rate" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="bg-card/95 backdrop-blur-xl rounded-2xl border border-[#E5E0D8] dark:border-[#2A342E]/50 p-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-3xl font-bold text-gradient-gold mb-1">{stat.value}</div>
                    <div className="text-sm text-[#4B5563] dark:text-[#A8B5AE]">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Departments Section - 4 per row */}
      {departments.length > 0 && (
        <section className="py-20 bg-[#F0EDE6]/30 dark:bg-[#1C2420]/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-1 w-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-gold-400 to-gold-500" />
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Contact Our Departments
              </h2>
              <p className="text-xl text-[#4B5563] dark:text-[#A8B5AE] max-w-2xl mx-auto">
                Get in touch with the right team for your specific needs
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {departments.map((dept, index) => {
                const IconComponent = getIconComponent(dept.icon);
                return (
                  <motion.div
                    key={dept.id}
                    className="group relative"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="relative bg-white dark:bg-[#141A17] rounded-3xl border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm p-4 md:p-6 h-full group-hover:border-gold-400/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-gold-400/20 to-gold-500/10 flex items-center justify-center text-gold-500 mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-foreground mb-2">{dept.title}</h3>
                      <p className="text-[#4B5563] dark:text-[#A8B5AE] text-xs md:text-sm mb-3 md:mb-4">{dept.description}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-[#4B5563] dark:text-[#A8B5AE]">
                          <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <a href={`mailto:${dept.email}`} className="hover:text-gold-500 transition-colors truncate">
                            {dept.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-[#4B5563] dark:text-[#A8B5AE]">
                          <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <a href={`tel:${dept.phone?.replace(/\s/g, "")}`} className="hover:text-gold-500 transition-colors">
                            {dept.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section - 4 per row */}
      {faqs.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="h-1 w-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-[hsl(var(--ethiopian-green))] via-[hsl(var(--ethiopian-yellow))] to-[hsl(var(--ethiopian-red))]" />
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-[#4B5563] dark:text-[#A8B5AE] max-w-2xl mx-auto">
                Find answers to common questions about our services
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="bg-card/95 backdrop-blur-xl rounded-2xl border border-[#E5E0D8] dark:border-[#2A342E]/50 p-4 md:p-6 h-full group-hover:border-accent/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center text-accent mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-[#4B5563] dark:text-[#A8B5AE] text-xs md:text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Contact;
