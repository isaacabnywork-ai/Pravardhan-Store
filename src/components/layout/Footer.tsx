import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Clock, Truck, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#0F172A] text-slate-300 pt-8 pb-24 sm:pb-10 border-t border-slate-800 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Value Propositions Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-[#3B82F6]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Scheduled Delivery</h4>
              <p className="text-[11px] text-[#64748B]">Convenient daily time slots</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-[#3B82F6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Guaranteed Freshness</h4>
              <p className="text-[11px] text-[#64748B]">Direct from local farmers & mandis</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-[#3B82F6]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Same-Day Delivery</h4>
              <p className="text-[11px] text-[#64748B]">Orders placed before 2 PM</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-[#3B82F6]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white">Authentic Local Store</h4>
              <p className="text-[11px] text-[#64748B]">Supporting neighborhood stores</p>
            </div>
          </div>
        </div>

        {/* Links & Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white">
                <Store className="w-4 h-4" />
              </div>
              <span className="font-black text-base text-white">Pravardhan Store</span>
            </div>
            <p className="text-[#64748B] leading-relaxed mb-2 text-[11px]">
              Local grocery delivery service. Farm-fresh fruits, vegetables, dairy, atta, dal, and daily essentials.
            </p>
            <p className="text-[#3B82F6] font-semibold text-[11px]">
              Lucknow: Vrindavan Yojna, Gomti Nagar, Aliganj
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">
              Top Categories
            </h5>
            <ul className="space-y-1.5 text-[#64748B] text-[11px]">
              <li><Link href="/categories/vegetables-fruits" className="hover:text-white transition-colors">Vegetables & Fruits</Link></li>
              <li><Link href="/categories/dairy-bread-eggs" className="hover:text-white transition-colors">Dairy, Bread & Eggs</Link></li>
              <li><Link href="/categories/atta-rice-dal" className="hover:text-white transition-colors">Atta, Rice & Dals</Link></li>
              <li><Link href="/categories/oil-ghee-masalas" className="hover:text-white transition-colors">Cooking Oils & Spices</Link></li>
              <li><Link href="/categories/snacks-drinks" className="hover:text-white transition-colors">Snacks & Beverages</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">
              Customer Service
            </h5>
            <ul className="space-y-1.5 text-[#64748B] text-[11px]">
              <li><Link href="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/account" className="hover:text-white transition-colors">Delivery Addresses</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Delivery Charges</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
              <li><Link href="/admin" className="text-[#3B82F6] hover:text-white transition-colors">Store Admin</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2 uppercase tracking-wider text-[11px]">
              Store Timings
            </h5>
            <div className="space-y-1 text-[#64748B] text-[11px]">
              <p>Shop 12-14, Sector 4 Market, Lucknow</p>
              <p>Phone: +91 98765 43210</p>
              <p>Open: 7:00 AM – 10:00 PM (Daily)</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Pravardhan Store. All rights reserved. Normal Local Grocery Delivery.</span>
          <span>Prices inclusive of all taxes. Fast & secure checkout.</span>
        </div>
      </div>
    </footer>
  );
}
