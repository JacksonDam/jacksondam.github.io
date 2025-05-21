import { useState, useEffect } from 'react';
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
import profileImg from './assets/profile.webp';
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

const LinkedIn = ({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={fill} height="80px" width="80px" viewBox="-120 -120 540 540">
    <g>
      <path d="M72.16,99.73H9.927c-2.762,0-5,2.239-5,5v199.928c0,2.762,2.238,5,5,5H72.16c2.762,0,5-2.238,5-5V104.73C77.16,101.969,74.922,99.73,72.16,99.73z"/>
      <path d="M41.066,0.341C18.422,0.341,0,18.743,0,41.362C0,63.991,18.422,82.4,41.066,82.4c22.626,0,41.033-18.41,41.033-41.038C82.1,18.743,63.692,0.341,41.066,0.341z"/>
      <path d="M230.454,94.761c-24.995,0-43.472,10.745-54.679,22.954V104.73c0-2.761-2.238-5-5-5h-59.599c-2.762,0-5,2.239-5,5v199.928c0,2.762,2.238,5,5,5h62.097c2.762,0,5-2.238,5-5v-98.918c0-33.333,9.054-46.319,32.29-46.319c25.306,0,27.317,20.818,27.317,48.034v97.204c0,2.762,2.238,5,5,5H305c2.762,0,5-2.238,5-5V194.995C310,145.43,300.549,94.761,230.454,94.761z"/>
    </g>
  </svg>
);
const GitHub = ({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 50 50" fill={fill}>
    <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25C2,35.164,8.63,43.804,17.791,46.836z"/>
  </svg>
);
const Mail = ({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={fill}>
    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
  </svg>
);

const Sun = ({ fill, stroke }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <circle cx="12" cy="12" r="5" fill={fill} />
    <g stroke={stroke} strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
);
const Moon = ({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={fill} />
  </svg>
);

export default function App() {
  const [selectedKey, setSelectedKey] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const handleNavigation = (key) => {
    setSelectedKey(key);
    setIsMenuOpen(false);
  };

  const iconFill = theme === 'light' ? '#000000' : '#ffffff';
  const outlineColor = theme === 'dark' ? '#ffffff' : '#000000';
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

        <NavbarContent className="desk-btns" justify="end">
          <NavbarItem className="ld-toggle">
            <Button onPress={toggleTheme} radius="full" style={{ cursor: 'pointer', borderColor: outlineColor, width: '2.5rem', height: '2.5rem' }} className="ld-toggle border bg-clear" aria-label="Toggle UI theme">
              <AnimatePresence initial={false} exitBeforeEnter mode="popLayout">
                {theme === 'light' ? (
                  <motion.div key="sun" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}>
                    <Sun fill={iconFill} stroke={iconFill} />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }}>
                    <Moon fill={iconFill} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </NavbarItem>
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

        <NavbarMenu className="flex-grow nb-menu">
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
          <NavbarMenuItem className="nbm-transplant ld-toggle" aria-label="Toggle UI theme">
            <Button onPress={toggleTheme} radius="full" style={{ cursor: 'pointer', borderColor: outlineColor, width: '2.5rem', height: '2.5rem' }} className="ld-toggle border bg-clear" aria-label="Toggle UI theme">
              <AnimatePresence initial={false} exitBeforeEnter mode="popLayout">
                {theme === 'light' ? (
                  <motion.div key="sun" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}>
                    <Sun fill={iconFill} stroke={iconFill} />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }}>
                    <Moon fill={iconFill} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </NavbarMenuItem>
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
        <AnimatePresence mode="popLayout">
          {menuItems.map(item =>
            selectedKey === item.key ? (
              <motion.div
                key={item.key}
                className="left-0 right-0 top-[64px] flex flex-col items-center justify-center px-4"
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
      <footer className="text-center fter" style={{marginTop: '15vh', marginBottom: '2rem'}}>
        <h1 style={{ fontSize: '3rem', fontWeight: 700 }}>Get in touch</h1>
        <h1 style={{ fontSize: '1.75rem' }}>Let's chat!</h1>
        <div className="flex justify-center" style={{ fontSize: '3rem', fontWeight: 700, marginTop: '1rem', marginBottom: '2rem' }}>
          <Link href="https://www.linkedin.com/in/jacksondam" target="_blank">
            <div aria-label="Visit Jackson Dam's LinkedIn page" className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ marginRight: '1rem', borderColor: outlineColor }}>
              <LinkedIn fill={iconFill} />
            </div>
          </Link>
          <Link href="https://github.com/JacksonDam" target="_blank">
            <div aria-label="Visit Jackson Dam's GitHub page" className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ borderColor: outlineColor }}>
              <GitHub fill={iconFill} />
            </div>
          </Link>
          <Link href="mailto:jacksondam@protonmail.com">
            <div aria-label="Send an email to Jackson Dam" className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ marginLeft: '1rem', borderColor: outlineColor }}>
              <Mail fill={iconFill} />
            </div>
          </Link>
        </div>
        <div className="copyright">© Copyright Jackson Dam, 2025</div>
      </footer>
    </div>
  );
}
