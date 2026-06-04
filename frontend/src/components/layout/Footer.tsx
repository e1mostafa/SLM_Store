'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-amazon-navy text-white mt-auto">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="w-full bg-amazon-teal hover:bg-amazon-navy-light py-3 text-sm transition-colors"
      >
        Back to top
      </button>

      {/* Main footer */}
      <div className="max-w-[1500px] mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3 text-white">Get to Know Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-amazon-orange transition-colors">About SLM Store</Link></li>
              <li><Link href="/careers" className="hover:text-amazon-orange transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-amazon-orange transition-colors">Press Releases</Link></li>
              <li><Link href="/investor-relations" className="hover:text-amazon-orange transition-colors">Investor Relations</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-white">Make Money with Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/seller/register" className="hover:text-amazon-orange transition-colors">Sell on SLM Store</Link></li>
              <li><Link href="/affiliate" className="hover:text-amazon-orange transition-colors">Affiliate Program</Link></li>
              <li><Link href="/advertise" className="hover:text-amazon-orange transition-colors">Advertise Your Products</Link></li>
              <li><Link href="/fulfillment" className="hover:text-amazon-orange transition-colors">Fulfillment Services</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-white">Payment Products</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amazon-orange transition-colors">SLM Store Business Card</a></li>
              <li><a href="#" className="hover:text-amazon-orange transition-colors">Shop with Points</a></li>
              <li><a href="#" className="hover:text-amazon-orange transition-colors">Reload Your Balance</a></li>
              <li><a href="#" className="hover:text-amazon-orange transition-colors">Currency Converter</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-white">Let Us Help You</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/account" className="hover:text-amazon-orange transition-colors">Your Account</Link></li>
              <li><Link href="/orders" className="hover:text-amazon-orange transition-colors">Your Orders</Link></li>
              <li><a href="#" className="hover:text-amazon-orange transition-colors">Shipping Rates & Policies</a></li>
              <li><a href="#" className="hover:text-amazon-orange transition-colors">Returns & Replacements</a></li>
              <li><a href="#" className="hover:text-amazon-orange transition-colors">Help</a></li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div>
            <span className="text-amazon-orange font-black text-2xl">SLM Store</span>
            <p className="text-gray-400 text-xs mt-1">Egypt's #1 Online Marketplace</p>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amazon-orange" />
              <span>16xxx (Customer Service)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amazon-orange" />
              <span>support@slmstore.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amazon-orange" />
              <span>Cairo, Egypt</span>
            </div>
          </div>

          {/* Social */}
          <div className="flex gap-4">
            {[
              { icon: Facebook, href: '#' },
              { icon: Twitter, href: '#' },
              { icon: Instagram, href: '#' },
              { icon: Youtube, href: '#' },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="w-9 h-9 rounded-full bg-amazon-teal hover:bg-amazon-orange flex items-center justify-center transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-amazon-navy-light py-4">
        <div className="max-w-[1500px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© 2024 SLM Store.com, Inc. or its affiliates</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-amazon-orange transition-colors">Privacy Notice</a>
            <a href="#" className="hover:text-amazon-orange transition-colors">Conditions of Use</a>
            <a href="#" className="hover:text-amazon-orange transition-colors">Interest-Based Ads</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
