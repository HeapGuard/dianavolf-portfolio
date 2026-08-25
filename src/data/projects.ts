import about from '../media/2.jpg'
import pulseIntro from '../media/4.jpg'
import pulseWork from '../media/5.jpg'
import benchIntro from '../media/6.jpg'
import benchWork from '../media/7.jpg'
import horrorIntro from '../media/8.jpg'
import horrorWork from '../media/9.jpg'
import harmonyIntro from '../media/10.jpg'
import harmonyWork from '../media/11.jpg'
import { userProjects } from './user-projects'

export type Project = {
  id: string
  number: string
  title: string
  subtitle: string
  year: string
  tags: string[]
  description: string
  cover: string
  images: string[]
  theme: 'ink' | 'wine' | 'green' | 'pulse'
  status?: 'Учебный проект' | 'Концептуальный проект' | 'Коммерческий проект'
  brief?: string
  role?: string
  deliverables?: string[]
  tools?: string[]
  result?: string
  featured?: boolean
}

export const assets = { about }

// To add a new work, add a record here and import its images above.
const baseProjects: Project[] = [
  {
    id: 'bench', number: '01', title: 'Скамья забредших душ', subtitle: 'Визуальное оформление театральной пьесы', year: '2025',
    tags: ['Visual identity', 'Poster', 'Editorial'],
    description: 'Единая монохромная система для театральной постановки: афиши, ролл-ап, буклет и печатные носители.',
    cover: benchIntro, images: [benchIntro, benchWork], theme: 'ink',
    status: 'Учебный проект', brief: 'Создать цельную визуальную систему для театральной пьесы.', role: 'Концепция, айдентика и дизайн печатных носителей.', deliverables: ['Афиша', 'Ролл-ап', 'Буклет'], tools: ['Photoshop', 'Illustrator', 'InDesign'], featured: true,
  },
  {
    id: 'horror', number: '02', title: 'Horror Movies Calendar', subtitle: 'Календарь, вдохновлённый фильмами ужасов', year: '2025',
    tags: ['Horror', 'Cinema', 'Calendar'],
    description: 'Тёмный редакционный календарь, где у каждого месяца свой кинообраз, а всю серию объединяет ритм контрастов и текстур.',
    cover: horrorIntro, images: [horrorIntro, horrorWork], theme: 'wine',
    status: 'Учебный проект', brief: 'Превратить тему хоррора в цельный редакционный календарь.', role: 'Концепция, арт-дирекшн и вёрстка.', deliverables: ['Календарь', 'Сетка', 'Серия разворотов'], tools: ['Photoshop', 'InDesign'], featured: true,
  },
  {
    id: 'harmony', number: '03', title: 'Harmony', subtitle: 'Авторский журнал о комнатных растениях', year: '2026',
    tags: ['Editorial', 'Magazine', 'Print'],
    description: 'Спокойное многостраничное издание о растениях: концепция, модульная сетка, съёмка и единая система вёрстки.',
    cover: harmonyIntro, images: [harmonyIntro, harmonyWork], theme: 'green',
    status: 'Учебный проект', brief: 'Собрать спокойное журналное издание о комнатных растениях.', role: 'Концепция, модульная сетка и редакционный дизайн.', deliverables: ['Журнал', 'Сетка', 'Обложка'], tools: ['InDesign', 'Photoshop'], featured: true,
  },
  {
    id: 'pulse', number: '04', title: 'Pulse Gym', subtitle: 'Айдентика фитнес-клуба', year: '2026',
    tags: ['Branding', 'Campaign', 'Print'],
    description: 'Комплексная визуальная система бренда, основанная на ритме, силе и движении: логотип, носители, реклама и расписание.',
    cover: pulseIntro, images: [pulseIntro, pulseWork], theme: 'pulse',
    status: 'Учебный проект', brief: 'Создать энергичную визуальную систему для фитнес-клуба.', role: 'Айдентика, дизайн носителей и рекламной системы.', deliverables: ['Айдентика', 'Носители', 'Рекламные макеты'], tools: ['Illustrator', 'Photoshop'], featured: true,
  },
]

export const projects: Project[] = [...baseProjects, ...userProjects]
