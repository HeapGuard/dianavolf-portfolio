import about from '../media/2.jpg'
import pulseIntro from '../media/4.jpg'
import pulseWork from '../media/5.jpg'
import benchIntro from '../media/6.jpg'
import benchWork from '../media/7.jpg'
import horrorIntro from '../media/8.jpg'
import horrorWork from '../media/9.jpg'
import harmonyIntro from '../media/10.jpg'
import harmonyWork from '../media/11.jpg'

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
}

export const assets = { about }

// To add a new work, add a record here and import its images above.
export const projects: Project[] = [
  {
    id: 'bench', number: '01', title: 'Скамья забредших душ', subtitle: 'Визуальное оформление театральной пьесы', year: '2025',
    tags: ['Visual identity', 'Poster', 'Editorial'],
    description: 'Единая монохромная система для театральной постановки: афиши, ролл-ап, буклет и печатные носители.',
    cover: benchIntro, images: [benchIntro, benchWork], theme: 'ink',
  },
  {
    id: 'horror', number: '02', title: 'Horror Movies Calendar', subtitle: 'Календарь, вдохновлённый фильмами ужасов', year: '2025',
    tags: ['Horror', 'Cinema', 'Calendar'],
    description: 'Тёмный редакционный календарь, где у каждого месяца свой кинообраз, а всю серию объединяет ритм контрастов и текстур.',
    cover: horrorIntro, images: [horrorIntro, horrorWork], theme: 'wine',
  },
  {
    id: 'harmony', number: '03', title: 'Harmony', subtitle: 'Авторский журнал о комнатных растениях', year: '2026',
    tags: ['Editorial', 'Magazine', 'Print'],
    description: 'Спокойное многостраничное издание о растениях: концепция, модульная сетка, съёмка и единая система вёрстки.',
    cover: harmonyIntro, images: [harmonyIntro, harmonyWork], theme: 'green',
  },
  {
    id: 'pulse', number: '04', title: 'Pulse Gym', subtitle: 'Айдентика фитнес-клуба', year: '2026',
    tags: ['Branding', 'Campaign', 'Print'],
    description: 'Комплексная визуальная система бренда, основанная на ритме, силе и движении: логотип, носители, реклама и расписание.',
    cover: pulseIntro, images: [pulseIntro, pulseWork], theme: 'pulse',
  },
]
