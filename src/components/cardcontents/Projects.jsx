import {
  Card,
  CardHeader,
  CardFooter,
  Image,
  Button,
} from '@heroui/react';

import daycardImg from '../../assets/daycard.webp';
import recvizImg from '../../assets/recviz.webp';

const projects = [
  {
    id: 'project1',
    title: 'DayCard',
    subtitle: 'Sizzle reel',
    description: 'Django web app for Web App Development 2 module in 2nd year of university',
    youtubeId: 'YTs_UmbUwVo',
    thumbnail: daycardImg,
  },
  {
    id: 'project2',
    title: 'Hawk: Page Indexer',
    subtitle: 'Sizzle reel',
    description: 'Productivity Chrome extension developed in a team for Amazon Edinburgh',
    youtubeId: 'wxm6YjIp1CU',
    thumbnail: 'https://img.youtube.com/vi/wxm6YjIp1CU/maxresdefault.jpg',
  },
  {
    id: 'project3',
    title: 'RecViz',
    subtitle: 'Sizzle reel',
    description: 'React app to visualise recommender system datasets',
    youtubeId: 'C-sAZBdgCtU',
    thumbnail: recvizImg,
  },
  {
    id: 'project4',
    title: 'Front Row clone',
    subtitle: 'Short demo',
    description: 'Quick/scrappy SwiftUI recreation of the old Apple TV / Front Row UI',
    youtubeId: 'Hj4t1qG0VIQ&t=15',
    thumbnail: 'https://img.youtube.com/vi/Hj4t1qG0VIQ/maxresdefault.jpg',
  },
];

export function Projects() {
  return (
    <div className='grid video-grid'>
      {projects.map((project) => (
        <Card key={project.id} isFooterBlurred className="overflow-hidden" shadow='none'>
          <CardHeader className="absolute top-2 flex-col !items-start">
            <p className="text-tiny text-white/60 font-bold video-card-title">{project.subtitle}</p>
            <h4 className="text-white font-medium text-large video-card-title">{project.title}</h4>
          </CardHeader>
          <Image
            removeWrapper
            alt={`${project.title} thumbnail`}
            className="z-0 w-full h-full object-cover"
            src={project.thumbnail}
          />
          <CardFooter 
            className="absolute bg-black/40 bottom-0 z-10 border-t border-white/20 items-center justify-between px-4 py-2" 
            style={{backdropFilter: "blur(48px)"}}
          >
            <p className="text-tiny text-white/80 truncate flex-1 video-card-description">
              {project.description}
            </p>
            <Button
              radius="full"
              size="sm"
              color="primary"
              onPress={() => window.open(`https://www.youtube.com/watch?v=${project.youtubeId}`, '_blank')}
            >
              Watch
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}