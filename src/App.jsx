import { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  NavbarItem,
  Link,
  Button
} from '@heroui/react';
import { Tabs, Tab } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import parse from 'html-react-parser';
import CardPanel from './components/CardPanel';
import profileImg from './assets/profile.jpeg';
import cv from './assets/Jackson_Dam_CV.pdf';

import aboutMd from './cardcontents/about.md?raw';
import experienceMd from './cardcontents/experience.md?raw';
import projectsMd from './cardcontents/projects.md?raw';
import awardsMd from './cardcontents/awards.md?raw';
import skillsMd from './cardcontents/skills.md?raw';
import volunteeringMd from './cardcontents/volunteering.md?raw';

const variants = {
  enter:  { scale: 0.8, opacity: 0 },
  center: { scale: 1,   opacity: 1, transition: { duration: 0.3 } },
  exit:   { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
};

const menuItems = [
  { key: 'about',      title: 'About' },
  { key: 'experience', title: 'Experience' },
  { key: 'projects',   title: 'Projects' },
  { key: 'awards',     title: 'Awards' },
  { key: 'skills',     title: 'Skills' },
  { key: 'volunteering',     title: 'Volunteering' },
];

const mdContents = {
  about:        aboutMd,
  experience:   experienceMd,
  projects:     projectsMd,
  awards:       awardsMd,
  skills:       skillsMd,
  volunteering: volunteeringMd,
};

export default function App() {
  const [selectedKey, setSelectedKey] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (key) => {
    setSelectedKey(key);
    setIsMenuOpen(false);
  };

  const contentMd = parse(mdContents[selectedKey]);

  return (
    <div className="min-h-full flex flex-col">
      <Navbar
        isBordered
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="toggler"
          />
          <NavbarBrand>
            <p className="font-bold text-inherit">
              Jackson <b>Dam</b>
            </p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="flex flex-1 gap-4 justify-center">
          <Tabs
            aria-label="Main navigation"
            selectedKey={selectedKey}
            onSelectionChange={(key) => handleNavigation(key)}
            color="default"
            className="tabs"
          >
            {menuItems.map(item => (
              <Tab key={item.key} title={item.title} />
            ))}
          </Tabs>
        </NavbarContent>

        <NavbarContent className="cv-btn" justify="end">
          <NavbarItem>
            <Button 
              as={Link} 
              color="primary" 
              href={cv} 
              variant="shadow"
            >
              View my CV
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="flex-grow">
          {menuItems.map(item => (
            <NavbarMenuItem key={item.key}>
              <Link
                className={`w-full ${
                  selectedKey === item.key
                    ? 'text-primary font-semibold'
                    : 'text-foreground'
                }`}
                href="#"
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.key);
                }}
              >
                {item.title}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button
              as={Link}
              color="primary"
              href={cv}
              variant="flat"
              className="w-full"
            >
              View my CV
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      <div className="flex-grow relative">
        <AnimatePresence mode="sync">
          {menuItems.map(item =>
            selectedKey === item.key ? (
              <motion.div
                key={item.key}
                className="absolute left-0 right-0 top-[64px] flex flex-col items-center justify-center px-4"
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
              >
                <CardPanel
                  title={item.title}
                  profileSrc={profileImg}
                  showProfile={item.key === 'about'}
                >
                  {contentMd}
                </CardPanel>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
