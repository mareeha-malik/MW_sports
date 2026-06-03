// app/About/page.tsx
"use client";
import React from "react";
import Link from "next/link";
import { Users, ShieldCheck, Zap, Star, Mail, Award } from "lucide-react";
import { motion } from "framer-motion";

const sectionFade = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };

export default function AboutPage() {
  return (
    <div className="dark:bg-BgWalaBlack light:bg-[#F9FAFB] dark:text-gray-300 light:text-[#6B7280]">
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionFade}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-white dark:from-[#080808] dark:to-[#0b0b0b] py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-extrabold dark:text-white light:text-[#1F2937]">About MW Sports</h1>
          <p className="mt-4 max-w-2xl mx-auto dark:text-gray-400 light:text-[#6B7280]">
            We design performance-driven sports gear made for athletes who demand durability,
            comfort, and a clean modern aesthetic. Built by athletes, for athletes.
          </p>
        </div>
      </motion.section>

      {/* Three-column story / mission / vision */}
      <motion.section
        className="container mx-auto px-4 py-16 grid gap-8 grid-cols-1 md:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ hidden: {}, visible: {} }}
      >
        <motion.div variants={sectionFade} transition={{ delay: 0.05 }} className="p-6 rounded-2xl dark:bg-[#0f0f0f] light:bg-white shadow-sm border dark:border-[#1e1e1e] light:border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center text-white">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold dark:text-white light:text-[#1F2937]">Our Story</h3>
          </div>
          <p className="mt-4 dark:text-gray-400 light:text-[#6B7280] text-sm">Started by a small team of sports enthusiasts, MW Sports grew from a single idea: make reliable gear that athletes actually want to wear. We focus on quality materials and thoughtful design.</p>
        </motion.div>

        <motion.div variants={sectionFade} transition={{ delay: 0.1 }} className="p-6 rounded-2xl dark:bg-[#0f0f0f] light:bg-white shadow-sm border dark:border-[#1e1e1e] light:border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-white">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold dark:text-white light:text-[#1F2937]">Mission</h3>
          </div>
          <p className="mt-4 dark:text-gray-400 light:text-[#6B7280] text-sm">Deliver high-performance sporting essentials that blend form with function, so athletes perform better and feel confident.</p>
        </motion.div>

        <motion.div variants={sectionFade} transition={{ delay: 0.15 }} className="p-6 rounded-2xl dark:bg-[#0f0f0f] light:bg-white shadow-sm border dark:border-[#1e1e1e] light:border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold dark:text-white light:text-[#1F2937]">Vision</h3>
          </div>
          <p className="mt-4 dark:text-gray-400 light:text-[#6B7280] text-sm">To be a trusted brand in the athletic community — known for honest craftsmanship and gear that lasts season after season.</p>
        </motion.div>
      </motion.section>

      {/* Values grid with subtle animations */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center dark:text-white light:text-[#1F2937]">Core Values</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[{
            title: 'Integrity', icon: Star, color: 'from-yellow-400 to-amber-500'
          },{
            title: 'Quality', icon: ShieldCheck, color: 'from-sky-500 to-blue-600'
          },{
            title: 'Innovation', icon: Zap, color: 'from-purple-500 to-pink-500'
          },{
            title: 'Community', icon: Users, color: 'from-emerald-400 to-green-500'
          }].map((v) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-6 rounded-xl dark:bg-[#0f0f0f] light:bg-white border dark:border-[#1e1e1e] light:border-[#E5E7EB] flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${v.color} flex items-center justify-center text-white`}>
                {/* @ts-ignore */}
                <v.icon className="w-6 h-6" />
              </div>
              <h4 className="mt-4 text-lg font-semibold dark:text-white light:text-[#1F2937]">{v.title}</h4>
              <p className="mt-2 text-sm dark:text-gray-400 light:text-[#6B7280]">Committed to the standards that make our products and service dependable.</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h3 className="text-2xl font-bold dark:text-white light:text-[#1F2937]">Want to collaborate or learn more?</h3>
        <p className="mt-2 dark:text-gray-400 light:text-[#6B7280]">Drop us a line and we’ll get back to you about partnerships, retail, or product questions.</p>
        <div className="mt-6">
          <Link href={'mailto:hello@mwsports.com'} className="inline-flex items-center gap-3 bg-BrightOrange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition">
            <Mail className="w-5 h-5" />
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
