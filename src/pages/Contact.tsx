import React, { useState, useEffect } from "react";
import { getPortfolioData, ContactExtraData, HeroData } from "@/lib/portfolioData";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, Github } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { saveContactMessage } from "@/lib/turso";

const Contact = () => {
  const [hero, setHero] = useState<HeroData>(() => getPortfolioData().hero);
  const [extra, setExtra] = useState<ContactExtraData>(() => getPortfolioData().contactExtra);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const p = getPortfolioData();
    setHero(p.hero);
    setExtra(p.contactExtra);

    const handleUpdate = () => {
      const updated = getPortfolioData();
      setHero(updated.hero);
      setExtra(updated.contactExtra);
    };
    window.addEventListener("portfolioDataUpdate", handleUpdate);
    return () => window.removeEventListener("portfolioDataUpdate", handleUpdate);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await saveContactMessage(name, email, subject, message);
      if (success) {
        toast.success("Thank you! Your message has been sent successfully.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-serif text-foreground mb-3">
          Get in <span className="text-primary">Touch</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-primary to-accent-foreground mx-auto rounded-full" />
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Interested in working together or hiring me? Send a message and let's start a conversation.
        </p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-5 gap-8"
      >
        {/* Info Sidebar */}
        <motion.div variants={itemVariants} className="md:col-span-2 space-y-6">
          {/* Availability Widget */}
          <div className="bg-card border border-border p-5 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary" />
            <div className="flex items-start gap-3">
              <Clock className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-foreground text-sm font-serif">Work Availability</h4>
                <p className="text-xs text-primary font-semibold mt-1">{extra.availability}</p>
                <span className="text-[10px] text-muted-foreground block mt-1.5 font-mono">
                  Response Speed: {extra.responseTime}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold font-serif text-foreground mb-4">Contact Info</h3>
            
            <div className="space-y-4 text-xs">
              <a 
                href={`mailto:${hero.email}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Mail size={15} />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Email Address</span>
                  <span className="font-mono text-foreground font-semibold">{hero.email}</span>
                </div>
              </a>

              <a 
                href={`tel:${hero.phone}`}
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <Phone size={15} />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Phone Contact</span>
                  <span className="font-mono text-foreground font-semibold">{hero.phone}</span>
                </div>
              </a>

              <div className="flex items-center gap-3 text-muted-foreground group">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary">
                  <MapPin size={15} />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">Location</span>
                  <span className="text-foreground font-semibold">{extra.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map / Location visual */}
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm h-48 relative overflow-hidden flex flex-col justify-end text-xs text-foreground font-mono">
            {/* Background design pattern resembling map coordinates */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#334155_1px,transparent_1px)]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-ping absolute" />
              <div className="w-6 h-6 rounded-full bg-primary border-2 border-background shadow-md z-10" />
            </div>

            <div className="relative z-10 p-2">
              <p className="font-bold flex items-center gap-1"><Globe size={13} className="text-primary" /> Coimbatore</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Tamil Nadu, India</p>
            </div>
          </div>
        </motion.div>

        {/* Message Form */}
        <motion.div variants={itemVariants} className="md:col-span-3">
          <div className="bg-card border border-border p-6 md:p-8 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold font-serif text-foreground">Send Message</h3>
              <p className="text-xs text-muted-foreground mt-1">Fields marked with * are required.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Your Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter message subject"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Message Body *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message details..."
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-95 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-sm text-xs"
              >
                <Send size={13} />
                {isSubmitting ? "Sending message..." : "Send Message"}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Contact;
