import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Building2,
  Users,
  Phone,
  Info,
  Heart,
  MessageSquare,
  Settings,
  LogIn,
  UserPlus,
  LayoutDashboard,
  FileText,
  CreditCard,
  Search,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      // Also support Escape to close
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command) => {
    setOpen(false);
    command();
  }, []);

  // Navigation items
  const navigationItems = [
    { icon: Home, label: 'Home', shortcut: 'G H', action: () => navigate('/') },
    { icon: Building2, label: 'Properties', shortcut: 'G P', action: () => navigate('/properties') },
    { icon: Info, label: 'About', shortcut: 'G A', action: () => navigate('/about') },
    { icon: Phone, label: 'Contact', shortcut: 'G C', action: () => navigate('/contact') },
    { icon: CreditCard, label: 'Subscription', shortcut: 'G S', action: () => navigate('/subscription') },
  ];

  const authItems = isAuthenticated
    ? [
        { icon: LayoutDashboard, label: 'Dashboard', shortcut: 'G D', action: () => navigate('/dashboard') },
        { icon: Heart, label: 'Favorites', shortcut: 'G F', action: () => navigate('/favorites') },
        { icon: MessageSquare, label: 'Messages', shortcut: 'G M', action: () => navigate('/messages') },
        { icon: Settings, label: 'Profile', shortcut: 'G R', action: () => navigate('/profile') },
        { icon: FileText, label: 'My Listings', shortcut: 'G L', action: () => navigate('/my-listings') },
      ]
    : [
        { icon: LogIn, label: 'Login', shortcut: '⌘ L', action: () => navigate('/login') },
        { icon: UserPlus, label: 'Sign Up', shortcut: '⌘ U', action: () => navigate('/signup') },
      ];

  const actionItems = [
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      shortcut: '⌘ T',
      action: () => toggleTheme(),
    },
    {
      icon: Globe,
      label: `Language: ${language === 'en' ? 'English' : 'አማርኛ'}`,
      shortcut: '⌘ I',
      action: () => setLanguage(language === 'en' ? 'am' : 'en'),
    },
  ];

  return (
    <>
      {/* Floating command button for mobile/discovery */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full glass shadow-xl border border-border/50 hover:border-primary/50 transition-all duration-300 group md:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Search className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      </motion.button>

      {/* Desktop hint */}
      <motion.div
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass shadow-lg border border-border/30 text-sm text-muted-foreground cursor-pointer hover:border-primary/50 transition-all"
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.02, y: -2 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Search className="w-4 h-4" />
        <span>Quick Search</span>
        <kbd className="ml-2 px-2 py-0.5 rounded bg-muted text-xs font-mono">
          ⌘K
        </kbd>
      </motion.div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-xl border-0 shadow-2xl">
          <CommandInput placeholder="Type a command or search..." className="h-14 text-base" />
          <CommandList className="max-h-[400px] overflow-auto scrollbar-luxury">
            <CommandEmpty className="py-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <Search className="w-12 h-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No results found.</p>
                <p className="text-xs text-muted-foreground/70">
                  Try searching for pages, settings, or actions
                </p>
              </div>
            </CommandEmpty>

            <CommandGroup heading="Navigation">
              {navigationItems.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.action)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <kbd className="hidden sm:inline-flex px-2 py-1 rounded bg-muted text-xs font-mono text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="my-2" />

            <CommandGroup heading={isAuthenticated ? 'Your Account' : 'Account'}>
              {authItems.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.action)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <kbd className="hidden sm:inline-flex px-2 py-1 rounded bg-muted text-xs font-mono text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator className="my-2" />

            <CommandGroup heading="Actions">
              {actionItems.map((item) => (
                <CommandItem
                  key={item.label}
                  onSelect={() => runCommand(item.action)}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/10 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400/20 to-gold-400/10 border border-gold-400/20">
                    <item.icon className="w-5 h-5 text-[hsl(var(--gold-400))]" />
                  </div>
                  <span className="flex-1 font-medium">{item.label}</span>
                  <kbd className="hidden sm:inline-flex px-2 py-1 rounded bg-muted text-xs font-mono text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/30">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd>
                Close
              </span>
            </div>
            <div className="text-xs text-muted-foreground/70">
              EthioHome Command Palette
            </div>
          </div>
        </Command>
      </CommandDialog>
    </>
  );
};

export default CommandPalette;
