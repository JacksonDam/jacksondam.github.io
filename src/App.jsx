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
import CardPanel from './components/CardPanel';

const variants = {
  enter: { scale: 0.8, opacity: 0 },
  center: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } }
};

const menuItems = [
  { key: 'about', title: 'About' },
  { key: 'experience', title: 'Experience' },
  { key: 'projects', title: 'Projects' },
  { key: 'awards', title: 'Awards' }
];

export default function App() {
  const [selectedKey, setSelectedKey] = useState('about');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (key) => {
    setSelectedKey(key);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-full flex flex-col">
      <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            className="toggler"
          />
          <NavbarBrand> 
            <p className="font-bold text-inherit">Jackson <b>Dam</b></p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="flex flex-1 gap-4 justify-center">
          <Tabs
            aria-label="Main navigation"
            selectedKey={selectedKey}
            onSelectionChange={(key) => handleNavigation(String(key))}
            color="default"
            className="tabs"
          >
            {menuItems.map(item => (
              <Tab key={item.key} title={item.title} />
            ))}
          </Tabs>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Button as={Link} color="primary" href="#" variant="shadow">
              View my CV
            </Button>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu className="flex-grow">
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.key}>
              <Link
                className={`w-full ${selectedKey === item.key ? 'text-primary font-semibold' : 'text-foreground'}`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.key);
                }}
                size="lg"
              >
                {item.title}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem className="cv-btn">
            <Button as={Link} color="primary" href="#" variant="flat" className="w-full">
              View my CV
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      <div className="flex-grow relative">
        <AnimatePresence mode="sync">
          {menuItems.map((item) => (
            selectedKey === item.key && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                key={item.key}
                initial="enter"
                animate="center"
                exit="exit"
                variants={variants}
              >
                <CardPanel title={item.title}>
                  <div>
                    {item.key === 'about' && 'Site under construction.'}
                    {item.key === 'experience' && 'Site under construction.'}
                    {item.key === 'projects' && 'Site under construction.'}
                    {item.key === 'awards' && 'Site under construction.'}
                  </div>
                </CardPanel>
              </motion.div>
            )
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}