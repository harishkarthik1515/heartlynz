import React from 'react';
import { Heart, Award, Users, Sparkles, Clock, Shield } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Handcrafted with Love',
      description: 'Every piece is carefully handmade with passion and attention to detail.'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We use only the finest materials and techniques for lasting beauty.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction is our priority with exceptional service.'
    },
    {
      icon: Sparkles,
      title: 'Unique Designs',
      description: 'Our designs are inspired by nature, emotions, and stories.'
    }
  ];

  const milestones = [
    { year: '2022', title: 'Founded', description: 'Started our journey with a passion for handmade jewelry' },
    { year: '2023', title: '500+ Customers', description: 'Reached our first major milestone of happy customers' },
    { year: '2024', title: 'Premium Collection', description: 'Launched our premium collection with exclusive designs' },
    { year: '2025', title: 'Going Digital', description: 'Expanding our reach through our beautiful online store' }
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
            <Sparkles className="h-6 w-6 lg:h-10 lg:w-10 text-purple-400" />
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 lg:mb-6">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600">Story</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Born from a passion for creating beautiful, meaningful jewelry that tells your unique story.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - Compact */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-4 lg:space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Crafting Dreams into Reality
              </h2>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Heartlynz began as a small dream in 2022, born from our founder's passion for creating 
                unique, handmade jewelry that speaks to the heart. What started as a hobby quickly 
                grew into a mission to bring beautiful, affordable, and meaningful jewelry to people 
                who appreciate the art of handcrafted accessories.
              </p>
              <p className="text-base lg:text-lg text-gray-600 leading-relaxed">
                Each piece in our collection is carefully designed and handcrafted using premium 
                materials. We believe that jewelry should not just be an accessory, but a reflection 
                of your personality, your story, and your dreams.
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-6 lg:space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-rose-600">1000+</div>
                  <div className="text-sm lg:text-base text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-rose-600">250+</div>
                  <div className="text-sm lg:text-base text-gray-600">Unique Designs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-rose-600">3+</div>
                  <div className="text-sm lg:text-base text-gray-600">Years of Excellence</div>
                </div>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <img
                src="https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Jewelry crafting process"
                className="w-full h-64 lg:h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 lg:-bottom-6 lg:-right-6 bg-white p-4 lg:p-6 rounded-2xl shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-rose-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 lg:h-6 lg:w-6 text-rose-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm lg:text-base">Made with Love</div>
                    <div className="text-xs lg:text-sm text-gray-600">Every Single Piece</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Compact */}
      <section className="py-12 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do, from design to delivery
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 lg:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4">{value.title}</h3>
                <p className="text-sm lg:text-base text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section - Compact */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
              From humble beginnings to becoming a trusted name in handmade jewelry
            </p>
          </div>
          
          {/* Mobile Timeline */}
          <div className="block lg:hidden space-y-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-xl font-bold text-rose-600 mb-2">{milestone.year}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                <p className="text-gray-600">{milestone.description}</p>
              </div>
            ))}
          </div>

          {/* Desktop Timeline */}
          <div className="hidden lg:block relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-rose-500 to-purple-500 rounded-full"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-2xl font-bold text-rose-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-white border-4 border-rose-500 rounded-full"></div>
                  </div>
                  
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Compact */}
      <section className="py-12 lg:py-20 bg-gradient-to-r from-rose-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">
            Ready to Find Your Perfect Piece?
          </h2>
          <p className="text-lg lg:text-xl text-rose-100 mb-6 lg:mb-8 max-w-2xl mx-auto">
            Explore our collection of handmade jewelry and discover pieces that speak to your heart
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 bg-white text-rose-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Shop Collection
              <Heart className="ml-2 h-4 w-4 lg:h-5 lg:w-5" />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-rose-600 transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;