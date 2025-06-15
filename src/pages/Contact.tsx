import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Heart, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'hello@heartlynz.com',
      description: 'Send us an email anytime!'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+91 98765 43210',
      description: 'Mon-Sat 9AM-7PM IST'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'Mumbai, Maharashtra',
      description: 'India'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: 'Mon - Sat: 9AM - 7PM',
      description: 'Sunday: Closed'
    }
  ];

  const faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'We offer free shipping on orders above ₹999. Standard delivery takes 3-5 business days within India.'
    },
    {
      question: 'Do you offer custom jewelry?',
      answer: 'Yes! We love creating custom pieces. Contact us with your ideas and we\'ll work with you to create something special.'
    },
    {
      question: 'What materials do you use?',
      answer: 'We use high-quality materials including sterling silver, gold-plated metals, natural stones, and premium threads.'
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for unused items in original condition. Custom pieces are non-returnable.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Compact */}
      <section className="relative py-12 lg:py-20 bg-gradient-to-br from-rose-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-5 lg:top-20 lg:left-10 animate-pulse">
            <Heart className="h-8 w-8 lg:h-12 lg:w-12 text-rose-400" />
          </div>
          <div className="absolute bottom-10 right-5 lg:bottom-20 lg:right-10 animate-pulse delay-1000">
            <MessageCircle className="h-6 w-6 lg:h-10 lg:w-10 text-purple-400" />
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Touch</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have a question about our jewelry? Want to create something custom? 
            We'd love to hear from you and help bring your vision to life.
          </p>
        </div>
      </section>

      {/* Contact Info Cards - Compact */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 lg:mb-16">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                  <info.icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-base lg:text-lg font-medium text-rose-600 mb-1">{info.details}</p>
                <p className="text-sm lg:text-base text-gray-600">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map - Compact */}
      <section className="py-12 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Contact Form */}
            <div>
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="custom">Custom Jewelry Request</option>
                      <option value="order">Order Support</option>
                      <option value="wholesale">Wholesale Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 lg:py-4 px-6 rounded-lg font-semibold hover:from-rose-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-6 lg:space-y-8">
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-xl">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Visit Our Studio</h3>
                <div className="aspect-video bg-gradient-to-br from-rose-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 lg:mb-6">
                  <div className="text-center">
                    <MapPin className="h-10 w-10 lg:h-12 lg:w-12 text-rose-500 mx-auto mb-4" />
                    <p className="text-gray-600">Interactive map coming soon</p>
                    <p className="text-sm text-gray-500 mt-2">Mumbai, Maharashtra, India</p>
                  </div>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="font-medium text-gray-900">Business Hours</p>
                      <p className="text-gray-600 text-sm">Monday - Saturday: 9:00 AM - 7:00 PM</p>
                      <p className="text-gray-600 text-sm">Sunday: Closed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="font-medium text-gray-900">Call for Appointment</p>
                      <p className="text-gray-600 text-sm">We recommend scheduling a visit in advance</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-purple-600 p-6 lg:p-8 rounded-2xl text-white">
                <h3 className="text-xl lg:text-2xl font-bold mb-4">Need Immediate Help?</h3>
                <p className="mb-4 lg:mb-6 text-rose-100">
                  For urgent inquiries or immediate assistance with your order, 
                  don't hesitate to call us directly.
                </p>
                <div className="space-y-3">
                  <a
                    href="tel:+919876543210"
                    className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm p-3 lg:p-4 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Phone className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="font-medium">+91 98765 43210</span>
                  </a>
                  <a
                    href="mailto:hello@heartlynz.com"
                    className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm p-3 lg:p-4 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Mail className="h-4 w-4 lg:h-5 lg:w-5" />
                    <span className="font-medium">hello@heartlynz.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Compact */}
      <section className="py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-base lg:text-lg text-gray-600">
              Quick answers to common questions about our jewelry and services
            </p>
          </div>
          
          <div className="space-y-4 lg:space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-4 lg:p-6 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2 lg:mb-3">{faq.question}</h3>
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 lg:mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <a
              href="mailto:hello@heartlynz.com"
              className="inline-flex items-center px-6 py-3 bg-rose-600 text-white font-semibold rounded-full hover:bg-rose-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Mail className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;