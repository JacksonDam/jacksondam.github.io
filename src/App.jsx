import React, { useState, useEffect, useCallback } from 'react';
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
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import CardPanel from './components/CardPanel';
import profileImg from './assets/profile.webp';
import cv from './assets/Jackson_Dam_CV.pdf';

import { About, Awards, Experience, Projects, Skills, Volunteering, Friends } from './components/cardcontents';

const variants = {
  enter: { 
    scale: 0.8, 
    opacity: 0,
    filter: 'blur(8px)',
    transition: { 
      duration: 0.12, 
      ease: [0.33,1,0.68,1],
      scale: { type: 'tween' },
      opacity: { type: 'tween' },
      filter: { type: 'tween' }
    }
  },
  center: { 
    scale: 1, 
    opacity: 1, 
    filter: 'blur(0px)',
    transition: { 
      duration: 0.15, 
      ease: [0.33,1,0.68,1],
      scale: { type: 'tween' },
      opacity: { type: 'tween' },
      filter: { type: 'tween' }
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    filter: 'blur(8px)',
    transition: { 
      duration: 0.08, 
      ease: [0.33,1,0.68,1],
      scale: { type: 'tween' },
      opacity: { type: 'tween' },
      filter: { type: 'tween' }
    }
  },
};

const menuItems = [
  { key: 'about',      title: 'About' },
  { key: 'experience', title: 'Experience' },
  { key: 'projects',   title: 'Projects' },
  { key: 'awards',     title: 'Awards' },
  { key: 'skills',     title: 'Skills' },
  { key: 'volunteering', title: 'Volunteering' },
  { key: 'friends', title: 'Friends' },
];

const contents = {
  about:        About,
  experience:   Experience,
  projects:     Projects,
  awards:       Awards,
  skills:       Skills,
  volunteering: Volunteering,
  friends:      Friends,
};

const LinkedIn = React.memo(({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill={fill} height="80px" width="80px" viewBox="-120 -120 540 540">
    <g>
      <path d="M72.16,99.73H9.927c-2.762,0-5,2.239-5,5v199.928c0,2.762,2.238,5,5,5H72.16c2.762,0,5-2.238,5-5V104.73C77.16,101.969,74.922,99.73,72.16,99.73z"/>
      <path d="M41.066,0.341C18.422,0.341,0,18.743,0,41.362C0,63.991,18.422,82.4,41.066,82.4c22.626,0,41.033-18.41,41.033-41.038C82.1,18.743,63.692,0.341,41.066,0.341z"/>
      <path d="M230.454,94.761c-24.995,0-43.472,10.745-54.679,22.954V104.73c0-2.761-2.238-5-5-5h-59.599c-2.762,0-5,2.239-5,5v199.928c0,2.762,2.238,5,5,5h62.097c2.762,0,5-2.238,5-5v-98.918c0-33.333,9.054-46.319,32.29-46.319c25.306,0,27.317,20.818,27.317,48.034v97.204c0,2.762,2.238,5,5,5H305c2.762,0,5-2.238,5-5V194.995C310,145.43,300.549,94.761,230.454,94.761z"/>
    </g>
  </svg>
));

const GitHub = React.memo(({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 50 50" fill={fill}>
    <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25C2,35.164,8.63,43.804,17.791,46.836z"/>
  </svg>
));

const Mail = React.memo(({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill={fill}>
    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
  </svg>
));

const Sun = React.memo(({ fill, stroke }) => (
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
));

const Moon = React.memo(({ fill }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={fill} />
  </svg>
));

const Medium = React.memo(({ fill }) => (
  <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
    <path d="M2.846 6.887c.03-.295-.083-.586-.303-.784l-2.24-2.7v-.403h6.958l5.378 11.795 4.728-11.795h6.633v.403l-1.916 1.837c-.165.126-.247.333-.213.538v13.498c-.034.204.048.411.213.537l1.871 1.837v.403h-9.412v-.403l1.939-1.882c.19-.19.19-.246.19-.537v-10.91l-5.389 13.688h-.728l-6.275-13.688v9.174c-.052.385.076.774.347 1.052l2.521 3.058v.404h-7.148v-.404l2.521-3.058c.27-.279.39-.67.325-1.052v-10.608z" fill={fill}/>
  </svg>
));

const ThemeToggle = React.memo(({ theme, onToggle, outlineColor, iconFill }) => (
  <Button 
    onPress={onToggle} 
    radius="full" 
    style={{ 
      cursor: 'pointer', 
      borderColor: outlineColor, 
      width: '2.5rem', 
      height: '2.5rem' 
    }} 
    className="ld-toggle border bg-clear" 
    aria-label="Toggle UI theme"
  >
    <LazyMotion features={domAnimation}>
      {theme === 'light' ? (
        <m.div 
          key="sun" 
          initial={{ rotate: -45, opacity: 0 }} 
          animate={{ rotate: 0, opacity: 1 }} 
          exit={{ rotate: 45, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Sun fill={iconFill} stroke={iconFill} />
        </m.div>
      ) : (
        <m.div 
          key="moon" 
          initial={{ rotate: 45, opacity: 0 }} 
          animate={{ rotate: 0, opacity: 1 }} 
          exit={{ rotate: -45, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Moon fill={iconFill} />
        </m.div>
      )}
    </LazyMotion>
  </Button>
));

const ContentRenderer = React.memo(({ selectedKey, profileImg }) => {
  const Component = contents[selectedKey];
  const currentItem = menuItems.find(item => item.key === selectedKey);
  
  if (!Component || !currentItem) return null;
  
  return (
    <div style={{ 
      willChange: 'transform, opacity',
    }}>
      <CardPanel
        title={currentItem.title}
        profileSrc={profileImg}
        showProfile={selectedKey === 'about'}
        contentType={selectedKey === 'projects' ? '' : 'card-body-text'}
      >
        <Component />
      </CardPanel>
    </div>
  );
});

export default function App() {
  const [selectedKey, setSelectedKey] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [showNameSplash, setShowNameSplash] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);

    const isDark = saved === 'dark';

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', saved);

    const img = new Image();
    img.src = profileImg;

    const timer = setTimeout(() => {
      setShowNameSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);

    const isDark = next === 'dark';

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }, [theme]);

  const handleNavigation = useCallback((key) => {
    if (key === selectedKey) return;
    
    requestAnimationFrame(() => {
      setSelectedKey(key);
      setIsMenuOpen(false);
    });
  }, [selectedKey]);

  const iconFill = theme === 'light' ? '#000000' : '#ffffff';
  const outlineColor = theme === 'dark' ? '#ffffff' : '#000000';
  const pageTransition = { duration: 0.75, ease: [0.33,1,0.68,1] };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {showNameSplash ? (
          <m.div
            key="name-splash"
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.33,1,0.68,1] }}
          >
            <m.h1
              className="splash-name text-center"
              initial={{ filter: "blur(12px)", scale: 0.8, opacity: 0 }}
              animate={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.33,1,0.68,1] }}
            >
              Jackson <b>Dam</b>  
            </m.h1>
          </m.div>
        ) : (
          <m.div
            key="main-content"
            className="min-h-full flex flex-col"
            initial={{ filter: 'blur(48px)', opacity: 0 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            transition={pageTransition}
          >
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
                <p className="text-inherit">
                  Jackson <b>Dam</b>
                </p>
              </NavbarBrand>
            </NavbarContent>

            <NavbarContent className="flex flex-1 gap-4 justify-center">
              <Tabs
                aria-label="Main navigation"
                selectedKey={selectedKey}
                onSelectionChange={handleNavigation}
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
                <ThemeToggle 
                  theme={theme}
                  onToggle={toggleTheme}
                  outlineColor={outlineColor}
                  iconFill={iconFill}
                />
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
                <ThemeToggle 
                  theme={theme}
                  onToggle={toggleTheme}
                  outlineColor={outlineColor}
                  iconFill={iconFill}
                />
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
            <LazyMotion features={domAnimation}>
              <AnimatePresence mode="popLayout" initial={false}>
                <m.div
                  key={selectedKey}
                  className="left-0 right-0 top-[64px] flex flex-col items-center justify-center px-4"
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={variants}
                  layout
                >
                  <ContentRenderer selectedKey={selectedKey} profileImg={profileImg} />
                </m.div>
              </AnimatePresence>
            </LazyMotion>
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
              <Link href="https://medium.com/@jacksondam" target="_blank">
                <div
                  aria-label="Visit Jackson Dam's Medium profile"
                  className="w-10 h-10 rounded-full border flex items-center justify-center"
                  style={{ marginLeft: '1rem', borderColor: outlineColor }}
                >
                  <Medium fill={iconFill} />
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
      </m.div>
        )}
      </AnimatePresence>
    </LazyMotion>
  );
}