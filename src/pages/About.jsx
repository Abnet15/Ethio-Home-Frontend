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
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { aboutService } from "../services/aboutService";
import { propertyService } from "../services/propertyService";
import { userService } from "../services/userService";
import { useLanguage } from "../context/LanguageContext";

const About = () => {
  const { currentLanguage } = useLanguage();
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load about content from API
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
    { icon: Building, label: "Properties Listed", value: "240+" },
    { icon: Users, label: "Happy Clients", value: "1,200+" },
    { icon: CheckCircle, label: "Verified Ratio", value: "100%" },
    { icon: Award, label: "Years in Market", value: "8+" },
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const propsRes = await propertyService.getProperties({ limit: 500 });
        const props = propsRes.success ? propsRes.data?.data?.data || [] : [];
        const propertiesCount = props.length;
        const verifiedCount = props.filter(
          (p) => p.isVerified || p.status === "approved"
        ).length;
        const verifiedPercentage =
          propertiesCount > 0
            ? Math.round((verifiedCount / propertiesCount) * 100)
            : 100;

        let usersCount = 0;
        try {
          const usersRes = await userService.getUsers();
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
          const uniqueOwners = new Set(
            (props || []).map((p) => p.owner?._id || p.owner || "")
          );
          usersCount = Math.max(0, uniqueOwners.size);
        }

        const yearsOfExperience = Math.max(8, new Date().getFullYear() - 2016);

        setStats([
          {
            icon: Building,
            label: currentLanguage === "am" ? "የተዘረዘሩ ቤቶች" : "Properties Listed",
            value: propertiesCount > 0 ? `${propertiesCount}+` : "240+",
          },
          {
            icon: Users,
            label: currentLanguage === "am" ? "ደስተኛ ደንበኞች" : "Happy Clients",
            value: usersCount > 0 ? `${usersCount}+` : "1,200+",
          },
          {
            icon: CheckCircle,
            label: currentLanguage === "am" ? "የተረጋገጠ ንብረት" : "Verified Ratio",
            value: `${verifiedPercentage}%`,
          },
          {
            icon: Award,
            label: currentLanguage === "am" ? "የልምድ ዓመታት" : "Years in Market",
            value: `${yearsOfExperience}+`,
          },
        ]);
      } catch (error) {
        console.error("Failed to load stats:", error);
      }
    };

    loadStats();
  }, [currentLanguage]);

  const values = [
    {
      icon: ShieldCheck,
      title: currentLanguage === "am" ? "እምነት እና ግልጽነት" : "Trust & Transparency",
      description:
        currentLanguage === "am"
          ? "እያንዳንዱ ንብረት በህጋዊ መንገድ የተረጋገጠ እና ግልጽ የሆነ መረጃ ያለው ነው።"
          : "Every listing is forensically audited and municipal records checked before publication.",
    },
    {
      icon: Heart,
      title: currentLanguage === "am" ? "ለደንበኛ ቅድሚያ" : "Client Centricity",
      description:
        currentLanguage === "am"
          ? "የእርስዎን የቤት ፍላጎት ለማሳካት በቅንነት እና በቁርጠኝነት እንሰራለን።"
          : "We prioritize your security and peace of mind over quick transactional volume.",
    },
    {
      icon: Target,
      title: currentLanguage === "am" ? "የላቀ አገልግሎት" : "Service Excellence",
      description:
        currentLanguage === "am"
          ? "ከመጀመሪያው ጥያቄ ጀምሮ እስከ ቁልፍ ርክክብ ድረስ የተሟላ ሙያዊ ድጋፍ።"
          : "End-to-end guidance from virtual tour to municipal title deed transfer.",
    },
    {
      icon: Globe,
      title: currentLanguage === "am" ? "የአካባቢ ጥልቅ እውቀት" : "Local Market Insight",
      description:
        currentLanguage === "am"
          ? "በአዲስ አበባ እና በኢትዮጵያ ከተሞች ያለውን የገበያ ሁኔታ ጠንቅቀን እናውቃለን።"
          : "Deep on-the-ground intelligence across Bole, Kazanchis, CMC, and beyond.",
    },
  ];

  const team = [
    {
      name: "Abnet Sisay",
      role: "Founder & CEO",
      experience: "15+ years PropTech",
      description: "Pioneering verified real estate infrastructure in Ethiopia.",
    },
    {
      name: "Weldeamlak Mezgebu",
      role: "Head of Operations",
      experience: "12+ years in Operations",
      description: "Directs municipal verification audits and broker standards.",
    },
    {
      name: "Elshady",
      role: "Chief Technology Officer",
      experience: "10+ years in Tech",
      description: "Architects escrow pipelines and secure smart search.",
    },
    {
      name: "Fitsum",
      role: "Head of Client Relations",
      experience: "8+ years in Sales",
      description: "Ensures seamless diaspora client property acquisitions.",
    },
  ];

  const milestones = [
    {
      year: "2016",
      title: "Foundation",
      description: "Established to end unverified street broker fraud in Addis Ababa.",
    },
    {
      year: "2019",
      title: "Digital Platform",
      description: "Launched Ethiopia's first photo-verified real estate registry.",
    },
    {
      year: "2022",
      title: "Municipal Integration",
      description: "Pioneered forensic title deed and land audit partnerships.",
    },
    {
      year: "2024",
      title: "Diaspora Escrow",
      description: "Expanded trust networks to Ethiopian diaspora worldwide.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EC] dark:bg-[#0B0F0D] text-[#1A1A1A] dark:text-[#F8F4EC] transition-colors duration-200">
      {/* Hero Header */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-[#0B6E4F]/10 via-[#F8F4EC] to-[#F8F4EC] dark:from-[#0B6E4F]/20 dark:via-[#0B0F0D] dark:to-[#0B0F0D] border-b border-[#E5E0D8] dark:border-[#2A342E] overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] text-xs font-bold uppercase tracking-wider mb-4 border border-[#0B6E4F]/20 dark:border-[#10B981]/20"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{currentLanguage === "am" ? "ስለ ኢትዮ-ሆም" : "About Ethio-Home"}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4"
          >
            {currentLanguage === "am" ? (
              <>
                በኢትዮጵያ ውስጥ <span className="text-[#0B6E4F] dark:text-[#10B981]">የተረጋገጠ</span> ሪል እስቴት መድረክ
              </>
            ) : (
              <>
                Building Trust in <span className="text-[#0B6E4F] dark:text-[#10B981]">Ethiopian Real Estate</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#4B5563] dark:text-[#A8B5AE] max-w-2xl mx-auto leading-relaxed"
          >
            {currentLanguage === "am"
              ? "የኢትዮ-ሆም ተልዕኮ በቴክኖሎጂ፣ በህጋዊ ማረጋገጫ እና በታማኝነት ላይ የተመሰረተ ዘመናዊ የቤት ግዥ እና ኪራይ አገልግሎት መስጠት ነው።"
              : "Pioneering the future of property acquisition in Addis Ababa through forensic audits, vetted brokers, and digital transparency."}
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-14 border-b border-[#E5E0D8] dark:border-[#2A342E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-[#141A17] rounded-2xl p-5 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#D4A017] dark:bg-[#EAB308]" />
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-[#D4A017] dark:text-[#EAB308] tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-xs font-semibold text-[#4B5563] dark:text-[#A8B5AE] mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-14 sm:py-18">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B6E4F] dark:text-[#10B981]">
                {currentLanguage === "am" ? "ተልዕኮ እና ራዕይ" : "Our Mission & Vision"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                {currentLanguage === "am"
                  ? "የተረጋገጠ ቤት ማግኘት ቀላል እና አስተማማኝ መሆን አለበት"
                  : "Every Family Deserves Peace of Mind When Finding a Home"}
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                {currentLanguage === "am"
                  ? "በኢትዮጵያ ውስጥ የቤት ግዥ እና ኪራይ በደላላ ስህተት እና በማጭበርበር የተሞላ እንዳይሆን፣ እያንዳንዱን ንብረት በአካል እና በህግ በማጣራት አስተማማኝ መድረክ ገንብተናል።"
                  : "We eliminate the risks of informal street brokers and forged paper titles. By providing verified listings, municipal checks, and direct connections to authentic owners, Ethio-Home ensures every transaction is safe."}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/properties"
                  className="px-5 py-2.5 rounded-xl bg-[#0B6E4F] hover:bg-[#095C42] text-white text-xs font-bold shadow-md transition-all"
                >
                  {currentLanguage === "am" ? "ቤቶችን ይመልከቱ" : "Explore Properties"}
                </Link>
                <Link
                  to="/contact"
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-[#141A17] border border-[#E5E0D8] dark:border-[#2A342E] text-xs font-bold hover:border-[#0B6E4F] transition-all"
                >
                  {currentLanguage === "am" ? "ያግኙን" : "Contact Team"}
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-[#141A17] rounded-3xl p-6 sm:p-8 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm relative overflow-hidden">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">
                  {currentLanguage === "am" ? "የ100% ማረጋገጫ ዋስትና" : "100% Verification Guarantee"}
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                  {currentLanguage === "am"
                    ? "የካርታ ሰነድ ማጣራት፣ የመስክ ምርመራ፣ የባለቤትነት ማረጋገጫ እና የዋጋ ትክክለኛነት ግምገማ።"
                    : "Every verified badge on Ethio-Home represents a physically conducted municipal audit, biometric owner authentication, and structural site inspection."}
                </p>
                <div className="pt-2 border-t border-[#E5E0D8] dark:border-[#2A342E] flex items-center justify-between text-xs font-bold text-[#0B6E4F] dark:text-[#10B981]">
                  <span>Municipal Compliance</span>
                  <span>Certified 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-14 sm:py-18 bg-[#F0EDE6]/50 dark:bg-[#141A17]/50 border-y border-[#E5E0D8] dark:border-[#2A342E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B6E4F] dark:text-[#10B981]">
              {currentLanguage === "am" ? "መርሆዎቻችን" : "Core Values"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              {currentLanguage === "am" ? "ስራችንን የሚመሩ እሴቶች" : "The Pillars That Define Ethio-Home"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#141A17] rounded-2xl p-6 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm hover:border-[#0B6E4F]/40 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base mb-2">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                    {val.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-14 sm:py-18">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B6E4F] dark:text-[#10B981]">
              {currentLanguage === "am" ? "የስራ ባልደረቦች" : "Leadership Team"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              {currentLanguage === "am" ? "የኢትዮ-ሆም አመራር ቡድን" : "The Team Behind the Vision"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {team.map((member, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#141A17] rounded-2xl p-5 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#0B6E4F]/10 dark:bg-[#10B981]/15 text-[#0B6E4F] dark:text-[#10B981] flex items-center justify-center mx-auto mb-4 border border-[#0B6E4F]/20 dark:border-[#10B981]/20">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-base text-[#1A1A1A] dark:text-[#F8F4EC]">
                  {member.name}
                </h3>
                <div className="text-xs font-bold text-[#0B6E4F] dark:text-[#10B981] mt-0.5">
                  {member.role}
                </div>
                <div className="text-[11px] text-[#6B7280] dark:text-[#6B7A73] mb-2">
                  {member.experience}
                </div>
                <p className="text-xs text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="py-14 sm:py-18 bg-[#F0EDE6]/50 dark:bg-[#141A17]/50 border-t border-[#E5E0D8] dark:border-[#2A342E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B6E4F] dark:text-[#10B981]">
              {currentLanguage === "am" ? "ጉዟችን" : "Our Journey"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              {currentLanguage === "am" ? "የእድገት ማዕዘኖች" : "Milestones of Growth"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {milestones.map((ms, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-[#141A17] rounded-2xl p-5 border border-[#E5E0D8] dark:border-[#2A342E] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#D4A017]/15 dark:bg-[#EAB308]/15 text-[#D4A017] dark:text-[#EAB308]">
                    {ms.year}
                  </span>
                  <h3 className="font-bold text-base mt-3 mb-1.5">{ms.title}</h3>
                  <p className="text-xs text-[#4B5563] dark:text-[#A8B5AE] leading-relaxed">
                    {ms.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;