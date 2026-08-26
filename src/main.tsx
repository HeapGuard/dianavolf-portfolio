import { useEffect, useRef, useState, type PointerEvent, type ReactNode, type UIEvent } from 'react'
import { assets, projects, type Project } from './data/projects'
import pixelCatAbout from './media/pixel-cat-about.png'
import pixelCatContactClosed from './media/pixel-cat-contact-closed.png'
import pixelCatContactOpen from './media/pixel-cat-contact-open.png'
import pixelCatHeroClosed from './media/pixel-cat-hero-closed.png'
import pixelCatHeroOpen from './media/pixel-cat-hero-open.png'
import pixelCatSkills from './media/pixel-cat-skills.png'
import studioNightWall from './media/studio-night-wall.png'
import voxelStudioRoom from './media/voxel-studio-room.png'
import './styles.css'

type IconName = 'arrow-down' | 'arrow-up' | 'arrow-right' | 'arrow-up-right' | 'close' | 'menu' | 'zoom' | 'behance'

const telegramProjectLink = `https://t.me/Vol_hsu?text=${encodeURIComponent('Привет, Диана! Хочу обсудить проект.\n\nМой проект: \nЧто нужно сделать: \nЖелаемый срок: ')}`

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    'arrow-down': <><path d="M12 4v15" /><path d="m6 13 6 6 6-6" /></>,
    'arrow-up': <><path d="M12 20V5" /><path d="m18 11-6-6-6 6" /></>,
    'arrow-right': <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
    'arrow-up-right': <><path d="M6 18 18 6" /><path d="M9 6h9v9" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    zoom: <><circle cx="10.5" cy="10.5" r="5.5" /><path d="m15 15 4.5 4.5M10.5 8v5M8 10.5h5" /></>,
    behance: <><path d="M5 6.5h6.2c2.1 0 3.5 1 3.5 2.8 0 1.25-.72 2.12-1.83 2.46 1.48.3 2.43 1.25 2.43 2.82 0 2.05-1.67 3.4-4.18 3.4H5z" /><path d="M7.6 9h3.15c.9 0 1.42.36 1.42 1.08 0 .74-.52 1.12-1.42 1.12H7.6zM7.6 13.45h3.75c1.05 0 1.63.43 1.63 1.28 0 .84-.58 1.27-1.63 1.27H7.6zM17.25 11.1c1.48 0 2.65 1.08 2.65 3.02 0 .2-.02.4-.05.57h-4.12c.14.88.7 1.36 1.56 1.36.63 0 1.07-.23 1.42-.7l1.1.83c-.58.86-1.42 1.35-2.63 1.35-1.73 0-2.93-1.18-2.93-3.15 0-1.9 1.2-3.28 3-3.28zM15.77 13.54h2.55c-.12-.75-.55-1.15-1.23-1.15-.7 0-1.15.4-1.32 1.15z" fill="currentColor" stroke="none" /></>,
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
  return <section id="top" className="hero" ref={hero} onPointerMove={moveHero} onPointerLeave={resetHero}><p className="eyebrow hero__eyebrow">Graphic Designer <span>Tomsk / 2026</span></p><div className="hero__title" aria-label="Диана Вольф"><span>ДИАНА</span><span>ВОЛЬФ</span></div><div className="hero__paper">визуальный дизайн<br />и печатная магия</div><div className="hero__pixel-cat" aria-hidden="true"><img className="hero__pixel-cat-open" src={pixelCatHeroOpen} alt="" loading="eager" decoding="async" /><img className="hero__pixel-cat-closed" src={pixelCatHeroClosed} alt="" loading="eager" decoding="async" /></div><div className="hero__mark" aria-hidden="true"><span>01</span></div><p className="hero__description">Визуальный дизайн, айдентика<br />и многостраничная продукция.</p><a className="scroll-hint" href="#works">scroll to explore <Icon name="arrow-down" /></a></section>
}

function ProjectIndex({ openProject }: { openProject: (project: Project) => void }) {
  const [active, setActive] = useState<Project | null>(null)
  const preview = useRef<HTMLDivElement>(null)
  const previewPosition = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const hidePreview = () => setActive(null)
    window.addEventListener('scroll', hidePreview, { passive: true })
    return () => window.removeEventListener('scroll', hidePreview)
  }, [])
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
  const tiltFrame = useRef<number | null>(null)
  const pendingTilt = useRef({ x: 0, y: 0 })
  const applyTilt = () => {
    tiltFrame.current = null
    if (!surface.current) return
    const { x, y } = pendingTilt.current
    surface.current.style.setProperty('--tilt-x', `${y * -3}deg`)
    surface.current.style.setProperty('--tilt-y', `${x * 3}deg`)
    surface.current.style.setProperty('--shadow-x', `${x * -18}px`)
    surface.current.style.setProperty('--shadow-y', `${12 + y * -8}px`)
  }
  const tilt = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== 'mouse' || !surface.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pendingTilt.current = { x: (event.clientX - bounds.left) / bounds.width - .5, y: (event.clientY - bounds.top) / bounds.height - .5 }
    if (tiltFrame.current === null) tiltFrame.current = requestAnimationFrame(applyTilt)
  }
  const resetTilt = () => { if (tiltFrame.current !== null) { cancelAnimationFrame(tiltFrame.current); tiltFrame.current = null }; if (surface.current) { surface.current.style.setProperty('--tilt-x', '0deg'); surface.current.style.setProperty('--tilt-y', '0deg'); surface.current.style.setProperty('--shadow-x', '0px'); surface.current.style.setProperty('--shadow-y', '12px') } }
  return <article ref={surface} className={`case-card case-card--${project.theme} ${index % 2 ? 'case-card--offset' : ''}`}><aside className="case-card__aside"><p>{project.number} / {project.year}</p><h3>{project.subtitle}</h3><p>{project.description}</p><span>{project.tags.join(' · ')}</span></aside><button onPointerMove={tilt} onPointerLeave={resetTilt} onBlur={resetTilt} onClick={() => openProject(project)} aria-label={`Открыть проект ${project.title}`}><img src={project.cover} alt={`Проект «${project.title}»`} loading="lazy" decoding="async" fetchPriority="low" /><span className="case-card__label"><i>{project.number}</i><b>{project.title}</b><em>Смотреть <Icon name="arrow-up-right" /></em></span></button></article>
}

function ProjectCases({ openProject }: { openProject: (project: Project) => void }) {
  return <section className="case-gallery" aria-label="Превью проектов">{projects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} openProject={openProject} />)}</section>
}

function Studio() {
  const [isOpen, setIsOpen] = useState(false)
  const studio = useRef<HTMLElement>(null)
  const frame = useRef<number | null>(null)
  const pending = useRef({ x: 0, y: 0 })
  const applyMovement = () => {
    frame.current = null
    if (!studio.current) return
    const { x, y } = pending.current
    studio.current.style.setProperty('--studio-x', `${x * 16}px`)
    studio.current.style.setProperty('--studio-y', `${y * 10}px`)
    studio.current.style.setProperty('--studio-tilt', `${x * 1.25}deg`)
  }
  const moveStudio = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !studio.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = studio.current.getBoundingClientRect()
    pending.current = { x: (event.clientX - bounds.left) / bounds.width - .5, y: (event.clientY - bounds.top) / bounds.height - .5 }
    if (frame.current === null) frame.current = requestAnimationFrame(applyMovement)
  }
  const resetStudio = () => {
    if (frame.current !== null) { cancelAnimationFrame(frame.current); frame.current = null }
    if (!studio.current) return
    studio.current.style.setProperty('--studio-x', '0px')
    studio.current.style.setProperty('--studio-y', '0px')
    studio.current.style.setProperty('--studio-tilt', '0deg')
  }
  return <section ref={studio} className={`studio ${isOpen ? 'studio--open' : ''}`} aria-labelledby="studio-title" onPointerMove={isOpen ? moveStudio : undefined} onPointerLeave={resetStudio}>
    <button className="studio__handle" type="button" aria-expanded={isOpen} aria-controls="studio-panel" onClick={() => setIsOpen((open) => !open)}><span>03 / моя студия</span><b>{isOpen ? 'Скрыть' : 'Открыть'}</b><Icon name={isOpen ? 'arrow-down' : 'arrow-up'} /></button>
    <div className="studio__drawer" id="studio-panel"><div className="studio__drawer-inner"><div className="studio__inner"><div className="studio__top"><p className="eyebrow">03 / after hours</p><div><h2 id="studio-title">Моя<br /><em>студия</em></h2><p>Тихий вечер, много растений, идеи на экране<br />и место для будущего портрета.</p></div></div>
      <div className="studio__viewport"><div className="studio__stage"><img className="studio__night-wall" src={studioNightWall} alt="" aria-hidden="true" loading="lazy" decoding="async" /><div className="studio__window"><img src={voxelStudioRoom} alt="Пиксельная студия: дизайнер работает за компьютером среди растений, полок и кота; в рамке на столе — портрет Дианы Вольф" loading="lazy" decoding="async" fetchPriority="low" /><span className="studio__glass" aria-hidden="true" /><span className="studio__shine studio__shine--one" aria-hidden="true" /><span className="studio__shine studio__shine--two" aria-hidden="true" /></div></div></div></div></div></div>
  </section>
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
      <img className="about__pixel-cat" src={pixelCatAbout} alt="" loading="lazy" decoding="async" aria-hidden="true" />
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
    <div className="ticker" aria-label="Направления работы"><div><span>ЛОГОТИПЫ <i>•</i> EDITORIAL <i>•</i> АФИШИ <i>•</i> BRANDING <i>•</i> PRINT <i>•</i> ЖУРНАЛЫ <i>•</i></span><span aria-hidden="true">ЛОГОТИПЫ <i>•</i> EDITORIAL <i>•</i> АФИШИ <i>•</i> BRANDING <i>•</i> PRINT <i>•</i> ЖУРНАЛЫ <i>•</i></span></div></div>
    {portfolioOpen && <div className={`image-lightbox about-lightbox ${portfolioClosing ? 'about-lightbox--closing' : ''}`} role="dialog" aria-modal="true" aria-label="Портфолио Дианы Вольф" onClick={closePortfolio}>
      <button className="image-lightbox__close" onClick={(event) => { event.stopPropagation(); closePortfolio() }} aria-label="Закрыть портфолио"><Icon name="close" /></button>
      <div className="about-lightbox__sheet" onClick={(event) => { event.stopPropagation(); closePortfolio() }}>
        <img src={assets.about} alt="Портфолио Дианы Вольф" />
        <p>Нажмите на портфолио, чтобы закрыть</p>
      </div>
    </div>}
  </>
}
function Skills() { return <section className="skills" id="skills" aria-labelledby="skills-title"><img className="skills__pixel-cat" src={pixelCatSkills} alt="" loading="lazy" decoding="async" aria-hidden="true" /><div><p className="eyebrow">02 / toolkit</p><h2 id="skills-title">Работаю<br />в <em>системе</em></h2></div><ul className="skills__list"><li><i>PS</i>Adobe Photoshop</li><li><i>AI</i>Adobe Illustrator</li><li><i>ID</i>Adobe InDesign</li></ul><div className="qualities"><span>внимание к деталям</span><span>самоорганизация</span><span>ответственность</span><span>дисциплина</span><span>работа с ТЗ</span></div></section> }
function Contact() {
  const contact = useRef<HTMLElement>(null)
  const moveCats = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== 'mouse' || !contact.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = contact.current.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    const cat = contact.current.querySelector<HTMLElement>('.contact__pixel-cat')
    cat?.style.setProperty('--pixel-cat-x', `${x * 58}px`)
    cat?.style.setProperty('--pixel-cat-y', `${y * 42}px`)
    cat?.style.setProperty('--pixel-cat-rotate', `${x * 5}deg`)
  }
  const resetCats = () => { const cat = contact.current?.querySelector<HTMLElement>('.contact__pixel-cat'); cat?.style.setProperty('--pixel-cat-x', '0px'); cat?.style.setProperty('--pixel-cat-y', '0px'); cat?.style.setProperty('--pixel-cat-rotate', '0deg') }
  return <section ref={contact} className="contact" id="contact" aria-labelledby="contact-title" onPointerMove={moveCats} onPointerLeave={resetCats}><div className="contact__pixel-cat" aria-hidden="true"><img className="contact__pixel-cat-open" src={pixelCatContactOpen} alt="" loading="lazy" decoding="async" /><img className="contact__pixel-cat-closed" src={pixelCatContactClosed} alt="" loading="lazy" decoding="async" /></div><p className="eyebrow">Есть проект?</p><h2 id="contact-title">Давайте<br /><em>обсудим.</em></h2><p className="contact__sub">Вы можете написать мне в Telegram<br />или отправить письмо.</p><div className="contact__actions"><a className="magnetic" href={telegramProjectLink} target="_blank" rel="noopener noreferrer">Написать мне <Icon name="arrow-up-right" /></a><a href="mailto:d1ana.volf@yandex.ru">d1ana.volf@yandex.ru</a><a className="contact__portfolio" href="https://www.behance.net/68325c22" target="_blank" rel="noopener noreferrer">Behance <Icon name="behance" /></a></div><footer><span>DIANA VOLF<br />GRAPHIC DESIGNER</span><span>© 2026</span><a className="contact__behance" href="https://www.behance.net/68325c22" target="_blank" rel="noopener noreferrer">Behance <Icon name="behance" /></a><a className="contact__back" href="#top">Back to top <Icon name="arrow-up" /></a></footer></section> }

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

function App() { const [selected, setSelected] = useState<Project | null>(null); const nextProject = () => { if (selected) setSelected(projects[(projects.indexOf(selected) + 1) % projects.length]) }; return <><Header /><main><Hero /><ProjectIndex openProject={setSelected} /><ProjectCases openProject={setSelected} /><About /><Skills /><Studio /><Contact /></main>{selected && <CaseDialog project={selected} close={() => setSelected(null)} next={nextProject} />}</> }
export default App
