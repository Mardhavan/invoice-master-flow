import { motion } from "framer-motion";
import { FiFileText, FiZap, FiDownload, FiClock } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import applyWizzLogo from "@/assets/applywizz-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FiZap,
      title: "Lightning Fast",
      description: "Create professional invoices in minutes with our intuitive interface",
    },
    {
      icon: FiFileText,
      title: "Live Preview",
      description: "See your invoice in real-time as you make changes",
    },
    {
      icon: FiDownload,
      title: "PDF Export",
      description: "Download your invoices as high-quality PDF files instantly",
    },
    {
      icon: FiClock,
      title: "Auto-Save",
      description: "Never lose your work with automatic local storage",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a]">
      {/* Futuristic Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 -left-40 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-40 w-[600px] h-[600px] bg-green-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '6s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Diagonal Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(34,211,238,0.05)_50%,transparent_70%)] animate-slide-diagonal" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 -z-5 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse-glow"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 flex justify-center"
            >
              <motion.img
                src={applyWizzLogo}
                alt="Apply Wizz Logo"
                className="h-24 w-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                animate={{ 
                  filter: [
                    "drop-shadow(0 0 30px rgba(34,211,238,0.4))",
                    "drop-shadow(0 0 50px rgba(34,211,238,0.6))",
                    "drop-shadow(0 0 30px rgba(34,211,238,0.4))"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-6xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
                Invoice Creator
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto"
            >
              Create stunning, professional invoices in seconds with our futuristic invoice system
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/invoice")}
                  className="bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-white text-lg px-12 py-6 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.4)] hover:shadow-[0_0_50px_rgba(34,211,238,0.6)] transition-all duration-300"
                >
                  <FiFileText className="mr-2 h-5 w-5" />
                  Create Invoice
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => navigate("/history")}
                  variant="outline"
                  className="border-cyan-500/30 text-white hover:bg-cyan-500/10 text-lg px-12 py-6 rounded-full"
                >
                  <FiClock className="mr-2 h-5 w-5" />
                  View History
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-green-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center mt-24"
          >
            <p className="text-zinc-500 text-sm mb-8">
              Powered by Apply Wizz • The Future of Invoicing
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
