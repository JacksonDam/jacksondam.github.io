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

const LinkedIn = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 192 192">
    <g
      fill="none"
      fillRule="nonzero"
      stroke="none"
      strokeWidth="1"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit="10"
      strokeDasharray=""
      strokeDashoffset="0"
      fontFamily="none"
      fontWeight="none"
      fontSize="none"
      textAnchor="none"
    >
      <path d="M0,192v-192h192v192z" fill="none" />
      <g fill="#ffffff">
        <g id="surface1">
          <path d="M156,0h-120c-19.875,0 -36,16.125 -36,36v120c0,19.875 16.125,36 36,36h120c19.875,0 36,-16.125 36,-36v-120c0,-19.875 -16.125,-36 -36,-36zM59.36539,162.98077h-29.82693l-0.17307,-89.30769h29.82692zM43.70192,61.99038h-0.17308c-9.75,0 -16.03846,-6.72115 -16.03846,-15.08653c0,-8.56731 6.49039,-15.0577 16.41347,-15.0577c9.92308,0 16.00961,6.49038 16.21153,15.0577c0,8.36538 -6.31731,15.08653 -16.41346,15.08653zM162.77885,162.98077h-30.08654v-48.51923c0,-11.74039 -3.11538,-19.73077 -13.61538,-19.73077c-8.01923,0 -12.34615,5.39423 -14.42308,10.61538c-0.77885,1.875 -0.98077,4.44231 -0.98077,7.06731v50.56731h-30.23077l-0.17308,-89.30769h30.23077l0.17308,12.60577c3.86538,-5.97116 10.29808,-14.42308 25.70192,-14.42308c19.09616,0 33.37501,12.46154 33.37501,39.25961v51.86539z" />
        </g>
      </g>
    </g>
  </svg>
);

const GitHub = () => (
  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50" fill="white">
      <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path>
  </svg>
);

const Mail = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
  </svg>
);

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
      <footer className="text-center fter">
        <h1 style={{ fontSize: '3rem', fontWeight: 700, marginTop: '54rem' }}>Get in touch</h1>
        <h1 style={{ fontSize: '1.75rem' }}>Let's chat!</h1>
        <div className="flex justify-center" style={{ fontSize: '3rem', fontWeight: 700, marginTop: '1rem', marginBottom: '2rem' }}>
          <Link href="https://www.linkedin.com/in/jacksondam" target="_blank">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ marginRight: '1rem' }}>
              <LinkedIn/>
            </div>
          </Link>
          <Link href="https://github.com/JacksonDam" target="_blank">
            <div className="w-10 h-10 rounded-full border flex items-center justify-center">
              <GitHub/>
            </div>
          </Link>
          <Link href="mailto:jacksondam@protonmail.com" style={{ marginLeft: '1rem' }}>
            <div className="w-10 h-10 rounded-full border flex items-center justify-center">
              <Mail/>
            </div>
          </Link>
        </div>
      </footer>
    </div>
  );
}
