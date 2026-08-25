import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type UIEvent } from 'react'
import { assets, projects, type Project } from './data/projects'
import './styles.css'

type IconName = 'arrow-down' | 'arrow-up' | 'arrow-right' | 'arrow-up-right' | 'close' | 'menu' | 'zoom'

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    'arrow-down': <><path d="M12 4v15" /><path d="m6 13 6 6 6-6" /></>,
    'arrow-up': <><path d="M12 20V5" /><path d="m18 11-6-6-6 6" /></>,
    'arrow-right': <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
    'arrow-up-right': <><path d="M6 18 18 6" /><path d="M9 6h9v9" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    zoom: <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4.5 4.5M10.5 8v5M8 10.5h5" /></>,
  }
  return <svg className={`icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [locked])
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const close = () => setMenuOpen(false)
  return <header className="header">
    <a className="brand" href="#top" aria-label="Диана Вольф, в начало">DV<span>01</span></a>
    <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="site-menu"><Icon name={menuOpen ? 'close' : 'menu'} /><span>{menuOpen ? 'Закрыть' : 'Меню'}</span></button>
    <nav id="site-menu" className={menuOpen ? 'nav nav--open' : 'nav'} aria-label="Основная навигация"><a onClick={close} href="#works">Работы</a><a onClick={close} href="#about">Обо мне</a><a onClick={close} href="#skills">Навыки</a><a onClick={close} href="#contact">Контакты</a></nav>
  </header>
}

function Hero() {
  const hero = useRef<HTMLElement>(null)
  const moveHero = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !hero.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = hero.current.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    hero.current.style.setProperty('--paper-x', `${x * -20}px`)
    hero.current.style.setProperty('--paper-y', `${y * -14}px`)
    hero.current.style.setProperty('--mark-x', `${x * 15}px`)
    hero.current.style.setProperty('--mark-y', `${y * 11}px`)
  }
  const resetHero = () => { if (hero.current) { hero.current.style.setProperty('--paper-x', '0px'); hero.current.style.setProperty('--paper-y', '0px'); hero.current.style.setProperty('--mark-x', '0px'); hero.current.style.setProperty('--mark-y', '0px') } }
  return <section id="top" className="hero" ref={hero} onPointerMove={moveHero} onPointerLeave={resetHero}><p className="eyebrow hero__eyebrow">Graphic Designer <span>Tomsk / 2026</span></p><div className="hero__title" aria-label="Диана Вольф"><span>ДИАНА</span><span>ВОЛЬФ</span></div><div className="hero__paper">визуальный дизайн<br />и печатная магия</div><div className="hero__mark" aria-hidden="true"><span>01</span></div><p className="hero__description">Визуальный дизайн, айдентика<br />и многостраничная продукция.</p><a className="scroll-hint" href="#works">scroll to explore <Icon name="arrow-down" /></a></section>
}

function ProjectIndex({ openProject }: { openProject: (project: Project) => void }) {
  const [active, setActive] = useState<Project | null>(null)
  const preview = useRef<HTMLDivElement>(null)
  const previewPosition = useRef({ x: 0, y: 0 })
  const positionPreview = (x: number, y: number) => {
    previewPosition.current = { x, y }
    if (preview.current) preview.current.style.transform = `translate3d(${x + 22}px, ${y - 150}px, 0)`
  }
  const showPreview = (event: PointerEvent<HTMLButtonElement>, project: Project) => {
    if (event.pointerType !== 'mouse') return
    positionPreview(event.clientX, event.clientY)
    setActive(project)
  }
  const movePreview = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === 'mouse') positionPreview(event.clientX, event.clientY) }
  return <section className="works" id="works" aria-labelledby="works-title"><div className="section-top"><p className="eyebrow">selected projects</p><h2 id="works-title">Избранные<br /><em>работы</em></h2><p>2025 — 2026</p></div><div className="project-index" onPointerMove={movePreview}>{projects.map((project) => <button key={project.id} className={`project-row project-row--${project.theme}`} onPointerEnter={(event) => showPreview(event, project)} onFocus={() => setActive(project)} onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)} onClick={() => openProject(project)}><span className="project-row__number">{project.number}</span><span className="project-row__title">{project.title}</span><span className="project-row__meta">{project.tags[0]} <Icon name="arrow-up-right" /></span></button>)}</div>{active && <div ref={preview} className="cursor-preview" style={{ transform: `translate3d(${previewPosition.current.x + 22}px, ${previewPosition.current.y - 150}px, 0)` }} aria-hidden="true"><img src={active.cover} alt="" decoding="async" /><span>Открыть кейс</span></div>}<p className="works__note">Наведите на название<br />или выберите работу</p></section>
}

function ProjectCard({ project, index, openProject }: { project: Project; index: number; openProject: (project: Project) => void }) {
  const surface = useRef<HTMLElement>(null)
  const tilt = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || !surface.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    surface.current.style.setProperty('--tilt-x', `${y * -3}deg`)
    surface.current.style.setProperty('--tilt-y', `${x * 3}deg`)
    surface.current.style.setProperty('--shadow-x', `${x * -22}px`)
    surface.current.style.setProperty('--shadow-y', `${14 + y * -10}px`)
  }
  const resetTilt = () => { if (surface.current) { surface.current.style.setProperty('--tilt-x', '0deg'); surface.current.style.setProperty('--tilt-y', '0deg'); surface.current.style.setProperty('--shadow-x', '0px'); surface.current.style.setProperty('--shadow-y', '14px') } }
  return <article ref={surface} className={`case-card case-card--${project.theme} ${index % 2 ? 'case-card--offset' : ''}`}><aside className="case-card__aside"><p>{project.number} / {project.year}</p><h3>{project.subtitle}</h3><p>{project.description}</p><span>{project.tags.join(' · ')}</span></aside><button onPointerMove={tilt} onPointerLeave={resetTilt} onBlur={resetTilt} onClick={() => openProject(project)} aria-label={`Открыть проект ${project.title}`}><img src={project.cover} alt={`Проект «${project.title}»`} loading="lazy" decoding="async" fetchPriority="low" /><span className="case-card__label"><i>{project.number}</i><b>{project.title}</b><em>Смотреть <Icon name="arrow-up-right" /></em></span></button></article>
}

function ProjectCases({ openProject }: { openProject: (project: Project) => void }) {
  return <section className="case-gallery" aria-label="Превью проектов">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} openProject={openProject} />)}</section>
}

function About() {
  const [portfolioOpen, setPortfolioOpen] = useState(false)
  const [portfolioClosing, setPortfolioClosing] = useState(false)
  const portfolio = useRef<HTMLButtonElement>(null)
  useScrollLock(portfolioOpen)

  useEffect(() => {
    if (!portfolioOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') closePortfolio() }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [portfolioOpen, portfolioClosing])

  const openPortfolio = () => {
    setPortfolioClosing(false)
    setPortfolioOpen(true)
  }

  const closePortfolio = () => {
    if (portfolioClosing) return
    setPortfolioClosing(true)
    window.setTimeout(() => {
      setPortfolioOpen(false)
      setPortfolioClosing(false)
    }, 360)
  }

  const tiltPortfolio = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || !portfolio.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    portfolio.current.style.setProperty('--about-tilt-x', `${y * -4}deg`)
    portfolio.current.style.setProperty('--about-tilt-y', `${x * 5}deg`)
    portfolio.current.style.setProperty('--about-shadow-x', `${x * -20}px`)
  }

  const resetPortfolio = () => {
    if (!portfolio.current) return
    portfolio.current.style.setProperty('--about-tilt-x', '0deg')
    portfolio.current.style.setProperty('--about-tilt-y', '0deg')
    portfolio.current.style.setProperty('--about-shadow-x', '0px')
  }

  return <>
    <section className="about" id="about" aria-labelledby="about-title">
      <p className="about__ghost" aria-hidden="true">ОБО<br />МНЕ</p>
      <div className="about__layout">
        <button ref={portfolio} className="about__portfolio" onPointerMove={tiltPortfolio} onPointerLeave={resetPortfolio} onBlur={resetPortfolio} onClick={openPortfolio} aria-label="Открыть портфолио Дианы Вольф на весь экран">
          <img src={assets.about} alt="Портфолио Дианы Вольф" loading="lazy" decoding="async" fetchPriority="low" />
          <span><Icon name="zoom" /> Открыть портфолио</span>
        </button>
        <div className="about__copy">
          <p className="eyebrow">01 / about me</p>
          <h2 id="about-title"><span>Дизайн —</span><span>это <em>внимание</em></span><span>к деталям.</span></h2>
          <p>Начинающий графический дизайнер из Томска. Создаю визуальные решения для печатной и рекламной продукции, айдентики и многостраничных изданий.</p>
        </div>
      </div>
    </section>
    <div className="ticker" aria-label="Направления работы"><div>ЛОГОТИПЫ <span>•</span> EDITORIAL <span>•</span> АФИШИ <span>•</span> BRANDING <span>•</span> PRINT <span>•</span> ЖУРНАЛЫ <span>•</span></div></div>
    {portfolioOpen && <div className={`image-lightbox about-lightbox ${portfolioClosing ? 'about-lightbox--closing' : ''}`} role="dialog" aria-modal="true" aria-label="Портфолио Дианы Вольф" onClick={closePortfolio}>
      <button className="image-lightbox__close" onClick={(event) => { event.stopPropagation(); closePortfolio() }} aria-label="Закрыть портфолио"><Icon name="close" /></button>
      <div className="about-lightbox__sheet" onClick={(event) => { event.stopPropagation(); closePortfolio() }}>
        <img src={assets.about} alt="Портфолио Дианы Вольф" />
        <p>Нажмите на портфолио, чтобы закрыть</p>
      </div>
    </div>}
  </>
}
function Skills() { return <section className="skills" id="skills" aria-labelledby="skills-title"><div><p className="eyebrow">02 / toolkit</p><h2 id="skills-title">Работаю<br />в <em>системе</em></h2></div><ul className="skills__list"><li><i>PS</i>Adobe Photoshop</li><li><i>AI</i>Adobe Illustrator</li><li><i>ID</i>Adobe InDesign</li></ul><div className="qualities"><span>внимание к деталям</span><span>самоорганизация</span><span>ответственность</span><span>дисциплина</span><span>работа с ТЗ</span></div></section> }
function Contact() { return <section className="contact" id="contact" aria-labelledby="contact-title"><p className="eyebrow">Есть проект?</p><h2 id="contact-title">Давайте<br /><em>обсудим.</em></h2><p className="contact__sub">Вы можете написать мне в Telegram<br />или отправить письмо.</p><div className="contact__actions"><a className="magnetic" href="https://t.me/Vol_hsu" target="_blank" rel="noopener noreferrer">Написать мне <Icon name="arrow-up-right" /></a><a href="mailto:d1ana.volf@yandex.ru">d1ana.volf@yandex.ru</a></div><footer><span>DIANA VOLF<br />GRAPHIC DESIGNER</span><span>© 2026</span><a href="#top">Back to top <Icon name="arrow-up" /></a></footer></section> }

type ZoomedImage = { src: string; alt: string }
function CaseDialog({ project, close, next }: { project: Project; close: () => void; next: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const [zoomedImage, setZoomedImage] = useState<ZoomedImage | null>(null)
  useScrollLock(true)
  useEffect(() => { closeButton.current?.focus() }, [])
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (event.key !== 'Escape') return; if (zoomedImage) setZoomedImage(null); else close() }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler) }, [close, zoomedImage])
  useEffect(() => { setZoomedImage(null); dialog.current?.scrollTo({ top: 0, behavior: 'smooth' }) }, [project.id])
  const moveDecor = (event: UIEvent<HTMLDivElement>) => {
    const offset = Math.min(event.currentTarget.scrollTop, 1400)
    event.currentTarget.style.setProperty('--case-decor-y', `${offset * -.035}px`)
    event.currentTarget.style.setProperty('--case-decor-y-reverse', `${offset * .025}px`)
  }
  return <div ref={dialog} className={`dialog dialog--${project.theme}`} role="dialog" aria-modal="true" aria-labelledby="case-title" onScroll={moveDecor}><div className="dialog__ornaments" aria-hidden="true"><span>{project.number}</span><i /><b /></div><div className="dialog__bar"><span>DIANA VOLF / SELECTED WORK</span><button ref={closeButton} onClick={close} aria-label="Закрыть проект">Закрыть <Icon name="close" /></button></div><main className="case"><header><p className="eyebrow">{project.number} / {project.year}</p><h2 id="case-title">{project.title}</h2><p className="case__subtitle">{project.subtitle}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></header><div className="case__lead"><p>{project.description}</p><span>Scroll to explore <Icon name="arrow-down" /></span></div><div className="case__images">{project.images.map((image, index) => { const alt = `${project.title}: ${index === 0 ? 'обложка проекта' : 'детали работы'}`; return <figure key={image} className={index === 0 ? 'case__image case__image--hero' : 'case__image'}><button className="case__image-button" onClick={() => setZoomedImage({ src: image, alt })} aria-label={`Увеличить изображение: ${alt}`}><img src={image} alt={alt} /><span><Icon name="zoom" /> Увеличить</span></button></figure> })}</div><button className="next-project" onClick={next}>Следующий проект <Icon name="arrow-right" /></button></main>{zoomedImage && <div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Увеличенное изображение" onClick={() => setZoomedImage(null)}><button className="image-lightbox__close" onClick={() => setZoomedImage(null)} aria-label="Закрыть увеличенное изображение"><Icon name="close" /></button><img src={zoomedImage.src} alt={zoomedImage.alt} onClick={(event) => event.stopPropagation()} /></div>}</div>
}

function App() { const [selected, setSelected] = useState<Project | null>(null); const nextProject = () => { if (selected) setSelected(projects[(projects.indexOf(selected) + 1) % projects.length]) }; return <><Header /><main><Hero /><ProjectIndex openProject={setSelected} /><ProjectCases openProject={setSelected} /><About /><Skills /><Contact /></main>{selected && <CaseDialog project={selected} close={() => setSelected(null)} next={nextProject} />}</> }
export default App
