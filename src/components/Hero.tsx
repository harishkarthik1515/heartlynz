import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Star, ShoppingBag, Crown, Gem, Zap, Play, Gift, Award } from 'lucide-react';

const Hero: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const features = [
    {
      title: "Handcrafted",
      subtitle: "with Love",
      description: "Every piece is carefully made with passion and precision",
      icon: Heart,
      color: "from-rose-500 to-pink-500"
    },
    {
      title: "Premium",
      subtitle: "Quality",
      description: "Using only the finest materials for lasting beauty",
      icon: Crown,
      color: "from-purple-500 to-rose-500"
    },
    {
      title: "Unique",
      subtitle: "Designs",
      description: "Each piece tells a story, crafted just for you",
      icon: Gem,
      color: "from-pink-500 to-purple-500"
    },
    {
      title: "Special",
      subtitle: "Offers",
      description: "Exclusive deals and discounts for our customers",
      icon: Gift,
      color: "from-orange-500 to-rose-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const currentFeatureData = features[currentFeature];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 overflow-hidden flex items-center">
      {/* Dynamic Background with Mouse Interaction */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-rose-300/30 to-pink-300/30 rounded-full blur-3xl animate-float"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: '10%',
            left: '10%'
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-purple-300/30 to-rose-300/30 rounded-full blur-3xl animate-float delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            bottom: '10%',
            right: '10%'
          }}
        ></div>
        <div 
          className="absolute w-64 h-64 bg-gradient-to-r from-pink-300/30 to-purple-300/30 rounded-full blur-3xl animate-float delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            top: '50%',
            right: '20%'
          }}
        ></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full opacity-40 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-purple-200 to-rose-200 rounded-lg opacity-30 animate-float delay-1000 rotate-45"></div>
        <div className="absolute bottom-32 left-20 w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-50 animate-float delay-2000"></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-gradient-to-br from-rose-300 to-pink-300 rounded-lg opacity-25 animate-float delay-500 rotate-12"></div>
        
        {/* Floating icons with parallax - Hidden on mobile */}
        <div 
          className="hidden md:block absolute top-32 left-1/4 animate-float delay-1500"
          style={{ transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)` }}
        >
          <Heart className="h-6 w-6 text-rose-400 opacity-60" />
        </div>
        <div 
          className="hidden md:block absolute top-1/3 right-1/4 animate-float delay-3000"
          style={{ transform: `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * -0.008}px)` }}
        >
          <Sparkles className="h-8 w-8 text-purple-400 opacity-50" />
        </div>
        <div 
          className="hidden md:block absolute bottom-1/3 left-1/3 animate-float delay-2500"
          style={{ transform: `translate(${mousePosition.x * 0.003}px, ${mousePosition.y * 0.003}px)` }}
        >
          <Crown className="h-7 w-7 text-pink-500 opacity-60" />
        </div>
        <div 
          className="hidden md:block absolute bottom-40 right-1/3 animate-float delay-1000"
          style={{ transform: `translate(${mousePosition.x * -0.006}px, ${mousePosition.y * -0.006}px)` }}
        >
          <Gem className="h-6 w-6 text-rose-500 opacity-50" />
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[85vh]">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Animated Badge */}
            <div className="inline-flex items-center px-4 lg:px-6 py-2 lg:py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-rose-100 animate-bounce-in">
              <Sparkles className="h-3 w-3 lg:h-4 lg:w-4 mr-2 text-rose-600 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-rose-700 font-medium text-xs lg:text-sm">Handcrafted Since 2022</span>
            </div>
            
            {/* Main Heading with Advanced Animation */}
            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block text-gray-900 animate-fade-in-up">Jewelry That</span>
                <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${currentFeatureData.color} animate-gradient-x transition-all duration-1000`}>
                  Tells Your Story
                </span>
              </h1>
              
              <p className="text-lg lg:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-300">
                {currentFeatureData.description}
              </p>
            </div>

            {/* CTA Buttons with Advanced Hover Effects */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start animate-fade-in-up delay-500">
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-rose-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-700 to-pink-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <ShoppingBag className="relative mr-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:animate-bounce" />
                <span className="relative">Shop Collection</span>
                <ArrowRight className="relative ml-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/offers"
                className="group relative inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 bg-white/80 backdrop-blur-sm text-gray-800 font-semibold rounded-full border border-gray-200 hover:border-rose-300 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-50 to-pink-50 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                <Gift className="relative mr-2 h-4 w-4 lg:h-5 lg:w-5 group-hover:text-rose-600 transition-colors" />
                <span className="relative">View Offers</span>
              </Link>
            </div>

            {/* Enhanced Stats with Hover Effects - Simplified for mobile */}
            <div className="grid grid-cols-3 gap-4 lg:gap-8 pt-6 lg:pt-8 animate-fade-in-up delay-700">
              <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
                <div className="text-2xl lg:text-4xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">1000+</div>
                <div className="text-xs lg:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Happy Customers</div>
              </div>
              <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
                <div className="text-2xl lg:text-4xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">250+</div>
                <div className="text-xs lg:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Unique Designs</div>
              </div>
              <div className="text-center group cursor-pointer transform hover:scale-105 transition-all duration-300">
                <div className="text-2xl lg:text-4xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors">3+</div>
                <div className="text-xs lg:text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Years of Craft</div>
              </div>
            </div>

            {/* Trust Indicators with Enhanced Design - Simplified for mobile */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 pt-4 lg:pt-6 animate-fade-in-up delay-900">
              <div className="flex items-center space-x-2 group">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400 fill-current group-hover:animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span className="text-gray-600 font-medium text-sm lg:text-base">4.9/5 Rating</span>
              </div>
              <div className="hidden sm:block text-gray-400">•</div>
              <div className="text-gray-600 font-medium text-sm lg:text-base">Free Shipping ₹999+</div>
            </div>
          </div>

          {/* Right Content - Mobile Optimized Feature Cards */}
          <div className="relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-md lg:max-w-lg">
              {/* Mobile: Feature Cards Grid */}
              <div className="block lg:hidden">
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div 
                      key={index}
                      className={`relative p-6 bg-white/40 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl transition-all duration-500 ${
                        index === currentFeature ? 'scale-105 shadow-2xl' : 'hover:scale-102'
                      }`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 text-center mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600 text-center">{feature.subtitle}</p>
                    </div>
                  ))}
                </div>
                
                {/* Feature indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentFeature 
                          ? 'w-8 h-3 bg-gradient-to-r from-rose-500 to-pink-500' 
                          : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop: Interactive Circle Design */}
              <div className="hidden lg:block">
                <div className="w-[450px] h-[450px] relative group cursor-pointer">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 opacity-20 animate-spin" style={{ animationDuration: '20s' }}></div>
                  
                  {/* Middle ring */}
                  <div className="absolute inset-4 rounded-full bg-gradient-to-r from-purple-500 via-rose-500 to-pink-500 opacity-15 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
                  
                  {/* Main content circle */}
                  <div className="absolute inset-8 bg-white/40 backdrop-blur-lg rounded-full border border-white/30 shadow-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-all duration-500">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 to-purple-100/50 rounded-full"></div>
                    
                    {/* Center content with feature animation */}
                    <div className="relative z-10 text-center space-y-6 p-8 transition-all duration-1000">
                      <div className={`w-28 h-28 bg-gradient-to-br ${currentFeatureData.color} rounded-full flex items-center justify-center mx-auto shadow-lg transform transition-all duration-1000 group-hover:scale-110`}>
                        <currentFeatureData.icon className="h-14 w-14 text-white animate-pulse" />
                      </div>
                      
                      <div className="space-y-3 transition-all duration-1000">
                        <h3 className="text-3xl font-bold text-gray-800">{currentFeatureData.title}</h3>
                        <p className="text-xl text-gray-600">{currentFeatureData.subtitle}</p>
                      </div>
                      
                      {/* Enhanced feature indicators */}
                      <div className="flex justify-center space-x-3">
                        {features.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentFeature(index)}
                            className={`transition-all duration-500 rounded-full ${
                              index === currentFeature 
                                ? 'w-8 h-3 bg-gradient-to-r from-rose-500 to-pink-500' 
                                : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Floating Elements - Desktop only */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-400 rounded-full flex items-center justify-center animate-float shadow-xl hover:scale-110 transition-transform cursor-pointer">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-purple-400 to-rose-400 rounded-full flex items-center justify-center animate-float delay-1000 shadow-xl hover:scale-110 transition-transform cursor-pointer">
                  <Award className="h-12 w-12 text-white" />
                </div>
                
                <div className="absolute top-1/2 -left-10 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center animate-float delay-2000 shadow-xl hover:scale-110 transition-transform cursor-pointer">
                  <Crown className="h-8 w-8 text-white" />
                </div>

                <div className="absolute top-1/4 -right-8 w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center animate-float delay-1500 shadow-xl hover:scale-110 transition-transform cursor-pointer">
                  <Heart className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Wave Structure - Desktop Only */}
      <div className="absolute bottom-0 left-0 right-0 z-10 hidden lg:block">
        <div className="relative h-32">
          {/* Wave Layer 1 - Background */}
          <div className="absolute bottom-0 left-0 w-full h-full">
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 w-full h-full"
            >
              <path 
                d="M0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 L0,120 Z" 
                fill="rgba(244, 63, 94, 0.1)"
                className="animate-wave-gentle"
              />
            </svg>
          </div>

          {/* Wave Layer 2 - Middle */}
          <div className="absolute bottom-0 left-0 w-full h-3/4">
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 w-full h-full"
            >
              <path 
                d="M0,40 C200,80 400,0 600,40 C800,80 1000,0 1200,40 L1200,120 L0,120 Z" 
                fill="rgba(236, 72, 153, 0.15)"
                className="animate-wave-gentle"
                style={{ animationDelay: '1s' }}
              />
            </svg>
          </div>

          {/* Wave Layer 3 - Foreground */}
          <div className="absolute bottom-0 left-0 w-full h-1/2">
            <svg 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none" 
              className="absolute bottom-0 w-full h-full"
            >
              <path 
                d="M0,20 C300,60 600,0 900,20 C1050,30 1150,10 1200,20 L1200,120 L0,120 Z" 
                fill="white"
              />
            </svg>
          </div>

          {/* Floating particles */}
          <div className="absolute bottom-16 left-1/4 w-2 h-2 bg-rose-400 rounded-full opacity-60 animate-float"></div>
          <div className="absolute bottom-20 left-1/2 w-3 h-3 bg-pink-400 rounded-full opacity-40 animate-float delay-1000"></div>
          <div className="absolute bottom-14 right-1/3 w-2 h-2 bg-purple-400 rounded-full opacity-50 animate-float delay-2000"></div>
          <div className="absolute bottom-18 right-1/4 w-1 h-1 bg-rose-500 rounded-full opacity-70 animate-float delay-1500"></div>
        </div>
      </div>

      {/* Simple Mobile Bottom Separator */}
      <div className="absolute bottom-0 left-0 right-0 z-10 lg:hidden">
        <div className="h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"></div>
      </div>
    </div>
  );
};

export default Hero;