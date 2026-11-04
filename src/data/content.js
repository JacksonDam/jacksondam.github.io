import cv from '../assets/Jackson_Dam_CV.pdf';
import daycardImg from '../assets/daycard.webp';
import firstRowImg from '../assets/firstrow.webp';
import firstRowBannerImg from '../assets/firstrow-banner.webp';
import hawkImg from '../assets/hawk.webp';
import recvizImg from '../assets/recviz.webp';

export const CV_URL = cv;

export const LINKS = {
  linkedin: { label: 'LinkedIn', handle: 'in/jacksondam', href: 'https://www.linkedin.com/in/jacksondam' },
  github: { label: 'GitHub', handle: 'JacksonDam', href: 'https://github.com/JacksonDam' },
  medium: { label: 'Medium', handle: '@jacksondam', href: 'https://medium.com/@jacksondam' },
  email: { label: 'Email', handle: 'jacksondam@protonmail.com', href: 'mailto:jacksondam@protonmail.com' },
};

export const EXPERIENCE = [
  {
    from: 'Jul 2025',
    to: 'present',
    role: 'Software Dev Engineer',
    org: 'Amazon',
    logo: 'amazon',
    where: 'London',
    note: 'Contribution Catalog team',
    year: '2025',
  },
  {
    from: 'Sep 2024',
    to: 'Mar 2025',
    role: 'Assistant Demonstrator',
    org: 'University of Glasgow',
    logo: 'glasgow',
    note: 'Computer Science labs',
    year: '2024',
  },
  {
    from: 'May 2024',
    to: 'Jul 2024',
    role: 'Software Dev Engineer Intern',
    org: 'Amazon Alexa',
    logo: 'alexa',
    where: 'Cambridge',
    note: 'Conversational AM & Learning team',
    year: '2024',
  },
  {
    from: 'Jun 2023',
    role: 'Spring Intern',
    org: 'Amazon Discover',
    logo: 'amazon',
    note: 'Spring Technology Insight',
    year: '2023',
  },
  {
    from: 'Apr 2023',
    role: 'Spring Intern',
    org: 'Barclays',
    logo: 'barclays',
    note: 'Discovery Programme',
    year: '2023',
  },
  {
    from: 'Jun 2018',
    to: 'Jul 2025',
    role: 'Roblox Game Developer',
    org: 'Decadecimal Studios',
    logo: 'decadecimal',
    note: 'Freelance Roblox game development business',
    year: '2018',
  },
];

export const AWARDS = [
  {
    date: 'Aug 2025',
    place: 'Paper',
    text: "Academic paper based on dissertation project accepted for publication, and presented at ACM RecSys '25, Prague",
    detail: 'DOI: 10.1145/3705328.3759335',
    href: 'https://doi.org/10.1145/3705328.3759335',
  },
  {
    date: 'Jul 2025',
    place: 'Prize',
    text: 'Graduated with prizes for best final dissertation project and contribution to the Glasgow School of Computing Science',
  },
  { date: 'Jun 2025', place: '2nd', text: '2nd place team at Corgi AI Hackathon @ Y Combinator AI Startup School' },
  { date: 'Oct 2024', place: '1st', text: '1st place team at JPMorganChase Code for Good (Glasgow, Playlist for Life charity)' },
  { date: 'Oct 2023', place: '2nd', text: '2nd place team for GuitarGuitar challenge at “Do you have the GUTS?” hackathon' },
  { date: 'Oct 2021', place: '1st', text: '1st place team for Morgan Stanley challenge at Glasgow University Code Olympics' },
  { date: 'Oct 2021', place: '2nd', text: '2nd overall team at Glasgow University Code Olympics' },
  { date: 'Oct 2021', place: '5th', text: '5th place individual in HackerRank Python problems at Glasgow University Code Olympics' },
  { date: 'Sep 2015', place: 'Prize', text: 'Won the Charlie Long Memorial Prize for Computing at Nottingham High School' },
];

export const PROJECTS = [
  {
    title: 'DayCard',
    subtitle: 'Sizzle reel',
    description: 'Django web app for Web App Development 2 module in 2nd year of university',
    youtubeId: 'YTs_UmbUwVo',
    thumbnail: daycardImg,
  },
  {
    title: 'Hawk: Page Indexer',
    subtitle: 'Sizzle reel',
    description: 'Productivity Chrome extension developed in a team for Amazon Edinburgh',
    youtubeId: 'wxm6YjIp1CU',
    thumbnail: hawkImg,
  },
  {
    title: 'RecViz',
    subtitle: 'Sizzle reel',
    description: 'React app to visualise recommender system datasets',
    youtubeId: 'EZLMmy_Tdfc',
    thumbnail: recvizImg,
  },
  {
    title: 'First Row',
    subtitle: 'Sizzle reel',
    description: 'Working SwiftUI recreation of the old Apple TV / Front Row UI',
    youtubeId: '0N7zV1Sldp4',
    thumbnail: firstRowImg,
    // Smaller copy for the map's 330px "Latest project" banner, which loads with the page.
    banner: firstRowBannerImg,
  },
];

// Every skill on the CV (Sept 2026). The six languages the old page listed as proficient get the large tiles.
export const SKILLS = [
  { name: 'Java', logo: 'java', size: 'xl' },
  { name: 'Python', logo: 'python', size: 'xl' },
  { name: 'TypeScript', logo: 'typescript', size: 'xl' },
  { name: 'AWS', services: ['CDK', 'CloudWatch', 'CloudFormation', 'DynamoDB', 'EC2', 'Lambda', 'S3'] },
  { name: 'JavaScript', logo: 'javascript', size: 'xl' },
  { name: 'C++', logo: 'cplusplus' },
  { name: 'Swift', logo: 'swift' },
  { name: 'C', logo: 'c', size: 'xl' },
  { name: 'Lua/Luau', logo: 'luau', size: 'xl' },
  { name: 'SwiftUI', logo: 'swiftui' },
  { name: 'SQL', logo: 'sql' },
  { name: 'HTML', logo: 'html5' },
  { name: 'CSS', logo: 'css' },
  { name: 'AI-native development', logo: 'ai', size: 'wide' },
  { name: 'React', logo: 'react' },
  { name: 'Vite', logo: 'vite' },
  { name: 'Next.js', logo: 'nextdotjs' },
  { name: 'Bash', logo: 'gnubash' },
  { name: 'Git', logo: 'git' },
  { name: 'JUnit', logo: 'junit5' },
  { name: 'Mockito', logo: 'mockito' },
  { name: 'Spring Boot', logo: 'springboot' },
  { name: 'Guice', logo: 'guice' },
];

export const VOLUNTEERING = [
  {
    title: 'Glasgow University Tech Society',
    when: 'Mar 2024 – Apr 2025',
    text: 'I served as President of Glasgow University Tech Society between March 2024 and April 2025, helping to deliver 5 social events, 2 hackathons with 200+ attendees each, and driving marketing and sponsor outreach, maintaining relations with external sponsors such as JPMorganChase, Morgan Stanley, SAS, BlackRock, and Marshall Wace.',
  },
  {
    title: 'Class Representative',
    when: 'Levels 1, 3 and 4',
    text: 'I was a Class Representative for Level 1, Level 3, and Level 4 Honours Computer Science at Glasgow, meeting regularly with academic staff to communicate course feedback and encourage meaningful change.',
  },
  {
    title: 'Lectures and talks',
    when: 'Feb 2025, Jul 2025',
    text: 'I delivered a guest lecture for the Object-Oriented Software Engineering 2 module at Glasgow in February 2025, and an alumni talk on careers advice at Nottingham High School in July 2025.',
  },
  {
    title: 'Volunteering and mentoring',
    when: '100+ hours',
    text: 'Whilst studying, I undertook over 100 hours of volunteering, earning me a Saltire Award from the Scottish Government ("The Ascent" tier). I also regularly provided academic and professional mentorship, CV review, and technical interview coaching to peers.',
  },
];

export const FRIENDS = [
  { name: 'Andrei Boghean', url: 'https://andreiboghean.com/' },
  { name: 'Andrei Ghiță', url: 'https://andreig.dev/' },
  { name: 'Benjamin Parsons-Willis', url: 'https://vyrz.dev/' },
  { name: 'Fraser Miller', url: 'https://frasermiller.dev/' },
  { name: 'Luke Ormiston', url: 'https://lukeormiston.com/' },
  { name: 'Mark Turnbull', url: 'https://mrktrnbll.dev/' },
  { name: 'Nour Elfangary', url: 'https://nourelfangary.com/' },
  { name: 'Stefan Vučković', url: 'https://stefvuck.dev/' },
];

// Places on the map, in reading order.
export const SECTIONS = [
  { key: 'about', title: 'About', blurb: 'Who I am', icon: 'cafe' },
  { key: 'experience', title: 'Experience', blurb: `${EXPERIENCE.length} roles`, icon: 'briefcase' },
  { key: 'projects', title: 'Projects', blurb: `${PROJECTS.length} sizzle reels`, icon: 'play' },
  { key: 'awards', title: 'Awards', blurb: `${AWARDS.length} results`, icon: 'flag' },
  { key: 'skills', title: 'Skills', blurb: 'Languages and tools', icon: 'wrench' },
  { key: 'volunteering', title: 'Volunteering', blurb: 'Societies, teaching, mentoring', icon: 'heart', side: 'left' },
  { key: 'friends', title: 'Friends', blurb: `${FRIENDS.length} friends' sites`, icon: 'people' },
  { key: 'contact', title: 'Contact', blurb: "Let's chat!", icon: 'mail', side: 'left' },
  { key: 'cv', title: 'CV', blurb: 'View or download', icon: 'cone' },
];

export const NEWS = [
  { text: 'First Row: a working SwiftUI recreation of the old Apple TV / Front Row UI', tag: 'Projects', key: 'projects' },
  { text: "Paper presented at ACM RecSys '25, Prague", tag: 'Awards', key: 'awards' },
  { text: 'Software Dev Engineer at Amazon, London, on the Contribution Catalog team', tag: 'Experience', key: 'experience' },
  { text: 'Graduated from the University of Glasgow with First Class Honours', tag: 'About', key: 'about' },
];

export const TIMES = [
  { key: 'day', label: 'Day', icon: 'sun' },
  { key: 'sunset', label: 'Sunset', icon: 'sunset' },
  { key: 'night', label: 'Night', icon: 'moon' },
];
