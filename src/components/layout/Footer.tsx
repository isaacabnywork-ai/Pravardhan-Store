import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Clock, Truck, Award, Sparkles, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 pt-10 pb-24 sm:pb-12 border-t border-slate-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Value Propositions Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-slate-800/80 text-xs">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 shrink-0">
              <Truck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Scheduled Delivery</h4>
              <p className="text-[11px] text-slate-400">Convenient daily time slots</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Guaranteed Freshness</h4>
              <p className="text-[11px] text-slate-400">Direct from local farmers & mandis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 shrink-0">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Same-Day Delivery</h4>
              <p className="text-[11px] text-slate-400">Orders placed before 2 PM</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 shrink-0">
              <Award className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm">Authentic Local Store</h4>
              <p className="text-[11px] text-slate-400">Supporting neighborhood stores</p>
            </div>
          </div>
        </div>

        {/* Links & Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-7 py-8 text-xs">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Store className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-black text-lg text-white">
                Pravdhan<span className="text-emerald-400">Store</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed mb-3 text-xs">
              Your trusted neighborhood grocery store in Lucknow. Farm-fresh fruits, vegetables, dairy, atta, dal, and daily kitchen essentials delivered to your doorstep.
            </p>
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>Vrindavan Yojna, Gomti Nagar, Aliganj</span>
            </div>
          </div>

          <div>
            <h5 className="font-extrabold text-white mb-3 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Top Categories
            </h5>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><Link href="/categories/vegetables-fruits" className="hover:text-emerald-300 transition-colors">Vegetables & Fruits</Link></li>
              <li><Link href="/categories/dairy-bread-eggs" className="hover:text-emerald-300 transition-colors">Dairy, Bread & Eggs</Link></li>
              <li><Link href="/categories/atta-rice-dal" className="hover:text-emerald-300 transition-colors">Atta, Rice & Dals</Link></li>
              <li><Link href="/categories/oil-ghee-masalas" className="hover:text-emerald-300 transition-colors">Cooking Oils & Spices</Link></li>
              <li><Link href="/categories/snacks-drinks" className="hover:text-emerald-300 transition-colors">Snacks & Beverages</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-extrabold text-white mb-3 uppercase tracking-wider text-xs">
              Customer Support
            </h5>
            <ul className="space-y-2 text-slate-400 text-xs">
              <li><Link href="/orders" className="hover:text-emerald-300 transition-colors">Track Your Order</Link></li>
              <li><Link href="/account" className="hover:text-emerald-300 transition-colors">Delivery Addresses</Link></li>
              <li><Link href="/cart" className="hover:text-emerald-300 transition-colors">Delivery Charges & Slots</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-emerald-300 transition-colors">My Wishlist</Link></li>
              <li><Link href="/admin" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">Store Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-extrabold text-white mb-3 uppercase tracking-wider text-xs">
              Store Timings & Contact
            </h5>
            <div className="space-y-2 text-slate-400 text-xs">
              <p className="flex items-start gap-1.5">
                <Store className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                <span>Shop 12-14, Sector 4 Market, Lucknow</span>
              </p>
              <p className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-300 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Open 7:00 AM – 10:00 PM (Daily)</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Pravdhan Store. Fresh Local Grocery & Mandi Produce Delivery.</span>
          <span>Prices inclusive of all taxes. 100% Genuine Quality Guarantee.</span>
        </div>
      </div>
    </footer>
  );
}
