"use client";
import Link from "next/link";
import { useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Search, X, Menu } from "lucide-react";
import Image from "next/image";

import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Header() {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement your search logic here
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="w-full border-b lg:border-b">
      <div className="flex h-16 items-center">
        <div className="pl-10">
          <Link href="/">
            <Image
              src="/gamelog-large.svg"
              alt="Game Diary Logo"
              width={32}
              height={32}
              className="w-8 h-8 cursor-pointer"
            />
          </Link>
        </div>
        <nav className="container mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => {
                  setIsMenuExpanded(!isMenuExpanded);
                  // Close search if open when toggling menu
                  if (isSearchVisible) setIsSearchVisible(false);
                }}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Navigation Links */}
              <div
                className={`${!isMenuExpanded ? "hidden" : "block"} lg:block absolute lg:relative top-16 left-0 right-0 lg:top-0 bg-background lg:bg-transparent`}
              >
                <ul className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-8 p-4 lg:p-0 text-sm font-medium">
                  <li>
                    <Link
                      href="/"
                      className="block py-1.5 lg:py-0 text-base lg:text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sports/nba"
                      className="block py-1.5 lg:py-0 text-base lg:text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      NBA
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sports/nfl"
                      className="block py-1.5 lg:py-0 text-base lg:text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      NFL
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sports/mlb"
                      className="block py-1.5 lg:py-0 text-base lg:text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      MLB
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sports/nhl"
                      className="block py-1.5 lg:py-0 text-base lg:text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      NHL
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sports/mls"
                      className="block py-1.5 lg:py-0 text-base lg:text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      MLS
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/"
                      className="block py-1.5 lg:py-0 text-base lg:text-sm hover:text-blue-600 transition-colors"
                      onClick={() => setIsMenuExpanded(false)}
                    >
                      ALL SPORTS
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => {
                  setIsSearchVisible(!isSearchVisible);
                  // Close menu if open when toggling search
                  if (isMenuExpanded) setIsMenuExpanded(false);
                }}
              >
                {isSearchVisible ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </Button>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative">
                <div
                  className={`${isSearchVisible ? "block" : "hidden"} sm:block absolute sm:relative top-16 sm:top-0 left-0 right-0 sm:left-auto sm:right-auto bg-background sm:bg-transparent p-4 sm:p-0 border-b sm:border-0`}
                >
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </form>

              <ThemeToggle />

              <SignedOut>
                <SignInButton mode="modal">
                  <Button
                    type="button"
                    className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2 sm:px-5 sm:py-2.5 text-center"
                  >
                    Sign In
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
