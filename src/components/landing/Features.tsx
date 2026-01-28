import { motion } from "framer-motion";
import {
  CreditCard,
  Users,
  MessageSquare,
  Bell,
  Shield,
  BarChart3,
  Calendar,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "Maintenance Billing",
    description:
      "Automate bill generation, track payments, send reminders, and manage dues effortlessly with integrated payment gateways.",
  },
  {
    icon: Users,
    title: "Visitor Management",
    description:
      "Secure visitor registration with QR codes, real-time entry/exit logging, and instant resident notifications.",
  },
  {
    icon: MessageSquare,
    title: "Complaints & Requests",
    description:
      "Streamlined complaint submission and tracking. Keep residents informed with status updates and resolution timelines.",
  },
  {
    icon: Bell,
    title: "Notice Board",
    description:
      "Post announcements, event notifications, and important updates. Push notifications ensure no one misses out.",
  },
  {
    icon: Shield,
    title: "Security Dashboard",
    description:
      "Dedicated gatekeeper interface with real-time verification, vehicle tracking, and comprehensive security logs.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Comprehensive dashboards with insights on payments, complaints, visitor trends, and community engagement.",
  },
  {
    icon: Calendar,
    title: "Facility Booking",
    description:
      "Book community halls, sports facilities, and shared amenities with an easy-to-use reservation system.",
  },
  {
    icon: FileText,
    title: "Document Library",
    description:
      "Centralized repository for society bylaws, meeting minutes, and important documents accessible to all residents.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-accent font-semibold text-sm uppercase tracking-wider mb-4"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
          >
            Everything You Need to
            <span className="text-accent"> Manage Your Society</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            A comprehensive suite of tools designed to simplify society management,
            enhance security, and improve community living.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="feature-card group"
            >
              <div className="feature-icon mb-6">
                <feature.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
