'use client';
import Link from 'next/link';
import React from 'react';
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const HeaderTop = () => {
  return (
    <div className="hidden sm:block dark:bg-HeaderWalaBlack light:bg-white dark:border-gray-800 light:border-[#E5E7EB] border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-9 text-xs">
          {/* Social Icons */}
          <div className="hidden lg:flex gap-5">
            <Link
              href="#"
              className="dark:text-gray-500 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors"
              title="Facebook"
            >
              <FaFacebook size={12} />
            </Link>
            <Link
              href="#"
              className="dark:text-gray-500 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors"
              title="Twitter"
            >
              <FaTwitter size={12} />
            </Link>
            <Link
              href="https://www.instagram.com/mareeha._.2925/profilecard/?igsh=MWk5MTZ6YmM3MnZhcg=="
              className="dark:text-gray-500 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors"
              title="Instagram"
            >
              <FaInstagram size={12} />
            </Link>
            <Link
              href="#"
              className="dark:text-gray-500 light:text-[#6B7280] dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors"
              title="LinkedIn"
            >
              <FaLinkedin size={12} />
            </Link>
          </div>

          {/* Promo Message */}
          <div className="dark:text-gray-500 light:text-[#6B7280] flex-1 text-center hidden md:block">
            <span className="font-bold uppercase tracking-widest text-[10px]">
              FREE SHIPPING ON ORDERS OVER $55
            </span>
          </div>

          {/* Currency and Language Selects */}
          <div className="flex gap-5 items-center">
            <select
              className="appearance-none dark:bg-transparent light:bg-white dark:text-gray-400 light:text-[#6B7280] text-[11px] cursor-pointer dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors font-semibold uppercase"
              name="Currency"
              id="Currency"
            >
              <option className="dark:bg-HeaderWalaBlack light:bg-white dark:text-gray-300 light:text-[#1F2937]" value="USD $">
                USD
              </option>
              <option className="dark:bg-HeaderWalaBlack light:bg-white dark:text-gray-300 light:text-[#1F2937]" value="EURO">
                EUR
              </option>
              <option className="dark:bg-HeaderWalaBlack light:bg-white dark:text-gray-300 light:text-[#1F2937]" value="PKR">
                PKR
              </option>
            </select>

            <div className="w-px h-3 dark:bg-gray-700 light:bg-[#E5E7EB]"></div>

            <select
              className="appearance-none dark:bg-transparent light:bg-white dark:text-gray-400 light:text-[#6B7280] text-[11px] cursor-pointer dark:hover:text-BrightOrange light:hover:text-BrightOrange transition-colors font-semibold uppercase"
              name="Language"
              id="Language"
            >
              <option className="dark:bg-HeaderWalaBlack light:bg-white dark:text-gray-300 light:text-[#1F2937]" value="English">
                ENG
              </option>
              <option className="dark:bg-HeaderWalaBlack light:bg-white dark:text-gray-300 light:text-[#1F2937]" value="Urdu">
                URD
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTop;