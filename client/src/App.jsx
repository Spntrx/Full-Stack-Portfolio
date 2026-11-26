import { useEffect, useState } from 'react'
import { apiRequest } from './api'
import AdminContactPanel from './AdminContactPanel'
import AdminRecordManager from './AdminRecordManager'
import './App.css'

const pages = ['Home', 'About', 'Projects', 'Education', 'Services', 'Contact']
const authPages = ['Sign In', 'Sign Up']
const publicBase = import.meta.env.BASE_URL

const projects = [
  {
    number: '01',
    name: 'Intel Encore AI Exhibit',
    category: 'Immersive exhibit',
    image: `${publicBase}images/Project%201.jpg`,
    alt: 'Colorful balloons in an immersive exhibition space',
    description: 'Showcased work from nine emerging North American mixed-media artists, who used AI-powered technology and Intel Core Ultra processors to reimagine their previous creations.',
    role: 'Experiential Engineer',
    outcome: 'Delivered an immersive showcase of reimagined work from nine emerging North American mixed-media artists, powered by AI technology and Intel Core Ultra processors.',
  },
  {
    number: '02',
    name: 'Mythos',
    category: 'Interactive show',
    image: `${publicBase}images/Project%202.jpg`,
    alt: 'A visitor exploring a vivid immersive light installation',
    description: 'An interactive exhibition uncovering universal threads in global folklore. Journeying through traditions from China, the Haudenosaunee Confederacy, and Nigeria, visitors explore themes of creation, balance, perseverance, and shared humanity.',
    role: 'Experiential Engineer',
    outcome: 'Debuted August 15, 2025, inside the International Pavilion at the Canadian National Exhibition. Included with general fair admission, Mythos quickly became one of the CNE’s standout attractions.',
  },
  {
    number: '03',
    name: 'Waves',
    category: 'Immersive programming',
    image: `${publicBase}images/Project%203.jpg`,
    alt: 'A sofa in a room surrounded by an ocean-themed digital installation',
    description: 'A monthly sensory retreat merging yoga with large-scale generative projection mapping. As participants move through postures, visuals shift with the ebb and flow of breath, from grounding swells to uplifting tides, bridging the digital environment and inner calm.',
    role: 'Experiential Engineer',
    outcome: 'Across its inaugural 12-month run, Waves demonstrated demand for experiential wellness, drawing 60 to 110 attendees per session and operating at near-capacity each month.',
  },
]

function getPageFromHash() {
  const page = window.location.hash.slice(1).toLowerCase()
  return [...pages, ...authPages].find((item) => item.toLowerCase().replace(' ', '') === page.replace('-', '')) ?? 'Home'
}

function App() {
  const [activePage, setActivePage] = useState(getPageFromHash)
  const [capturedMessage, setCapturedMessage] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('portfolioAccessToken') || '')
  const [user, setUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [contactBusy, setContactBusy] = useState(false)
  const [contactStatus, setContactStatus] = useState('')
  const [contactError, setContactError] = useState('')
  const [projectsData, setProjectsData] = useState([])
  const [qualificationsData, setQualificationsData] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [qualificationsLoading, setQualificationsLoading] = useState(true)
  const [projectsError, setProjectsError] = useState('')
  const [qualificationsError, setQualificationsError] = useState('')
  const [contactsData, setContactsData] = useState([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactsError, setContactsError] = useState('')
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const syncPage = () => setActivePage(getPageFromHash())
    window.addEventListener('hashchange', syncPage)
    return () => window.removeEventListener('hashchange', syncPage)
  }, [])

  useEffect(() => {
    apiRequest('/projects')
      .then(setProjectsData)
      .catch((error) => setProjectsError(error.message))
      .finally(() => setProjectsLoading(false))
    apiRequest('/qualifications')
      .then(setQualificationsData)
      .catch((error) => setQualificationsError(error.message))
      .finally(() => setQualificationsLoading(false))
  }, [])

  useEffect(() => {
    if (!token) {
      return
    }

    apiRequest('/users/me', { token })
      .then((currentUser) => {
        setContactsLoading(currentUser.role === 'admin')
        setUser(currentUser)
      })
      .catch((error) => {
        localStorage.removeItem('portfolioAccessToken')
        setToken('')
        setUser(null)
        setContactsData([])
        setContactsLoading(false)
        setAuthError(`Your session could not be restored: ${error.message}`)
      })
  }, [token])

  useEffect(() => {
    if (!isAdmin) {
      return
    }

    apiRequest('/contacts', { token })
      .then(setContactsData)
      .catch((error) => setContactsError(error.message))
      .finally(() => setContactsLoading(false))
  }, [isAdmin, token])

  async function submitAuth(event) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthError('')
    try {
      const fields = Object.fromEntries(new FormData(event.currentTarget).entries())
      const result = await apiRequest(`/users/${activePage === 'Sign Up' ? 'signup' : 'login'}`, {
        method: 'POST',
        body: JSON.stringify(fields),
      })
      localStorage.setItem('portfolioAccessToken', result.token)
      setToken(result.token)
      setUser(result.user)
      setContactsLoading(result.user.role === 'admin')
      setContactsError('')
      window.location.hash = '#projects'
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthBusy(false)
    }
  }

  function signOut() {
    localStorage.removeItem('portfolioAccessToken')
    setToken('')
    setUser(null)
    setContactsData([])
    setContactsLoading(false)
    setContactsError('')
    setAuthError('')
    window.location.hash = '#home'
  }

  async function submitContact(event) {
    event.preventDefault()
    const form = event.currentTarget
    setContactBusy(true)
    setContactError('')
    setContactStatus('')
    try {
      const values = Object.fromEntries(new FormData(form).entries())
      const savedContact = await apiRequest('/contacts', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      setCapturedMessage(values)
      if (isAdmin) setContactsData((current) => [...current, savedContact])
      setContactStatus('Your message was sent and saved successfully.')
      form.reset()
      window.location.hash = '#home'
    } catch (error) {
      setContactError(error.message)
    } finally {
      setContactBusy(false)
    }
  }

  function updateManagedRecords(collection, records) {
    if (collection === 'projects') setProjectsData(records)
    else setQualificationsData(records)
  }

  function renderPage() {
    switch (activePage) {
      case 'About':
        return (
          <section className="page about-page" aria-labelledby="page-title">
            <div className="page-heading">
              <p className="eyebrow">A little about me</p>
              <h1 id="page-title">Good work starts with <em>curiosity.</em></h1>
            </div>
            <div className="about-layout">
              <img
                className="about-photo"
                src={`${publicBase}images/About%20portrait.jpg`}
                alt="Avi standing in front of an illuminated geometric grid"
              />
              <div className="about-copy">
                <p className="eyebrow">Avi Balsingh · Toronto, Canada</p>
                <h2>Systems Engineer &amp; Developer. Built for complex environments.</h2>
                <p>
                  I operate at the intersection of software development, experiential systems, and
                  digital infrastructure. With a strong background leading technical operations for
                  large-scale immersive environments and real-time computational systems, I focus on
                  building robust, scalable solutions that perform seamlessly under demanding
                  conditions.
                </p>
                <p>
                  Currently advancing my focus in AI software engineering alongside full-stack
                  development, I bridge backend reliability, intelligent data pipelines, and
                  responsive interfaces to create stable, high-impact digital experiences.
                </p>
                <a className="text-link" href={`${publicBase}resume.pdf`} download>
                  Download résumé PDF <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </section>
        )
      case 'Projects':
        return (
          <section className="page" aria-labelledby="page-title">
            <div className="page-heading heading-row">
              <div>
                <p className="eyebrow">Selected work · 2024—26</p>
                <h1 id="page-title">Ideas, made <em>useful.</em></h1>
              </div>
              <p className="heading-aside">A few practice projects exploring the places design and technology meet.</p>
            </div>
            <div className="project-list">
              {projects.map((project) => (
                <article className="project-row" key={project.number}>
                  <div className="project-image-wrap">
                    <img
                      className="project-image"
                      src={project.image}
                      alt={project.alt}
                      loading="lazy"
                    />
                    <span className="project-number">{project.number}</span>
                  </div>
                  <div className="project-copy">
                    <p className="eyebrow">{project.category}</p>
                    <h2>{project.name}</h2>
                    <p>{project.description}</p>
                    <dl className="project-facts">
                      <div><dt>My role</dt><dd>{project.role}</dd></div>
                      <div><dt>Outcome</dt><dd>{project.outcome}</dd></div>
                    </dl>
                  </div>
                </article>
              ))}
              {projectsData.map((project, index) => (
                <article className="project-row" key={project._id}>
                  <div className="project-image-wrap project-image-placeholder" aria-hidden="true">
                    <span className="project-number">{String(index + projects.length + 1).padStart(2, '0')}</span>
                    <span className="placeholder-mark">AB</span>
                  </div>
                  <div className="project-copy">
                    <p className="eyebrow">Portfolio project · {new Date(project.completionDate).getFullYear()}</p>
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                  </div>
                </article>
              ))}
            </div>
            {projectsLoading && <p className="form-message" role="status">Loading saved projects…</p>}
            {projectsError && <p className="form-message form-error" role="alert">Saved projects could not be loaded: {projectsError}</p>}
            {isAdmin && <AdminRecordManager collection="projects" onRecordsChange={(records) => updateManagedRecords('projects', records)} records={projectsData} token={token} />}
          </section>
        )
      case 'Education':
        return (
          <section className="page" aria-labelledby="page-title">
            <div className="page-heading">
              <p className="eyebrow">Learning in progress</p>
              <h1 id="page-title">Built on a <em>curious mind.</em></h1>
            </div>
            <div className="timeline">
              <article className="timeline-item">
                <p className="timeline-date">2026 — Present · Expected completion 2028</p>
                <div>
                  <h2>Software Engineering Technology — Artificial Intelligence</h2>
                  <p>Centennial College · Toronto, ON</p>
                  <p className="timeline-detail timeline-description">
                    Fast-track program focused on machine learning pipelines (MLOps), big data
                    analytics, deep learning, cloud-native AI architecture, and full-stack software
                    development.
                  </p>
                </div>
                <span className="credential">Advanced Diploma · In progress</span>
              </article>
              <article className="timeline-item">
                <p className="timeline-date">Completed</p>
                <div>
                  <h2>Full Stack Development Certificate</h2>
                  <p>University of Toronto School of Continuing Studies · Toronto, ON</p>
                  <p className="timeline-detail timeline-description">
                    Comprehensive curriculum covering modern full-stack web architectures,
                    front-end interface engineering, back-end APIs, and database design.
                  </p>
                </div>
                <span className="credential">Certificate</span>
              </article>
              <article className="timeline-item">
                <p className="timeline-date">Completed</p>
                <div>
                  <h2>Professional &amp; Technical Certifications</h2>
                  <p>QSC · Audinate</p>
                  <p className="timeline-detail timeline-description">
                    Q-SYS Level 2 Systems Certification (QSC) and Dante Networking Certification
                    Level 2 (Audinate). Covers advanced signal routing, networked AV system design,
                    control scripting, and enterprise-scale digital audio infrastructure.
                  </p>
                </div>
                <span className="credential">Professional certifications</span>
              </article>
              {qualificationsData.map((qualification) => (
                <article className="timeline-item" key={qualification._id}>
                  <p className="timeline-date">{new Date(qualification.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                  <div>
                    <h2>{qualification.title}</h2>
                    <p className="timeline-description">{qualification.description}</p>
                  </div>
                  <span className="credential">Qualification</span>
                </article>
              ))}
            </div>
            {qualificationsLoading && <p className="form-message" role="status">Loading saved qualifications…</p>}
            {qualificationsError && <p className="form-message form-error" role="alert">Saved qualifications could not be loaded: {qualificationsError}</p>}
            {isAdmin && <AdminRecordManager collection="qualifications" onRecordsChange={(records) => updateManagedRecords('qualifications', records)} records={qualificationsData} token={token} />}
          </section>
        )
      case 'Services':
        return (
          <section className="page" aria-labelledby="page-title">
            <div className="page-heading heading-row">
              <div><p className="eyebrow">Ways I can help</p><h1 id="page-title">From first sketch to <em>first click.</em></h1></div>
              <p className="heading-aside">Practical, people-first digital work for ideas at every stage.</p>
            </div>
            <div className="service-grid">
              <article className="service-item"><span className="service-number">01</span><h2>Web development</h2><p>Responsive, accessible websites built with modern front-end tools and a careful eye for detail.</p><span className="service-tag">React · HTML · CSS</span></article>
              <article className="service-item"><span className="service-number">02</span><h2>Interface design</h2><p>Clear page structures and thoughtful interface styling that help people find their way.</p><span className="service-tag">Wireframes · UI systems</span></article>
              <article className="service-item"><span className="service-number">03</span><h2>Interactive prototypes</h2><p>Clickable concepts that make a product idea easier to share, test, and improve.</p><span className="service-tag">Flows · Prototypes</span></article>
            </div>
            <div className="services-note"><p>Have a project in mind?</p><a className="text-link" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a></div>
          </section>
        )
      case 'Contact':
        return (
          <section className="page contact-page" aria-labelledby="page-title">
            <div className="page-heading"><p className="eyebrow">A good conversation starts here</p><h1 id="page-title">Have a project? <em>Say hello.</em></h1></div>
            <div className="contact-layout">
              <div className="contact-details">
                <h2>Let’s make something meaningful.</h2>
                <p>For collaborations, questions, or a friendly hello, use the form or reach me directly.</p>
                <a className="contact-email" href="mailto:avi.balsingh@gmail.com">avi.balsingh@gmail.com</a>
              </div>
              <form className="contact-form" onSubmit={submitContact}>
                <div className="form-name-row">
                  <label>First name<input autoComplete="given-name" maxLength="100" name="firstName" required /></label>
                  <label>Last name<input autoComplete="family-name" maxLength="100" name="lastName" required /></label>
                </div>
                <label>Contact number<input autoComplete="tel" maxLength="40" minLength="7" name="contactNumber" pattern="[+()0-9 .-]{7,40}" type="tel" required /></label>
                <label>Email address<input autoComplete="email" maxLength="254" name="email" type="email" required /></label>
                <label>Message<textarea maxLength="2000" minLength="5" name="message" rows="4" required /></label>
                <button className="button button-dark" disabled={contactBusy} type="submit">{contactBusy ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span></button>
                <p className="fine-print">Your message is securely submitted to the portfolio backend.</p>
                {contactError && <p className="form-message form-error" role="alert">{contactError}</p>}
                {contactStatus && <p className="form-message" role="status">{contactStatus}</p>}
              </form>
            </div>
            {isAdmin && (
              <AdminContactPanel
                error={contactsError}
                loading={contactsLoading}
                onRecordsChange={setContactsData}
                records={contactsData}
                token={token}
              />
            )}
          </section>
        )
      case 'Sign In':
      case 'Sign Up':
        return (
          <section className="page auth-page" aria-labelledby="page-title">
            <div className="page-heading">
              <p className="eyebrow">Portfolio account</p>
              <h1 id="page-title">{activePage === 'Sign Up' ? <>Join the <em>conversation.</em></> : <>Welcome <em>back.</em></>}</h1>
              <p className="heading-aside auth-intro">
                {activePage === 'Sign Up' ? 'Create a reader account. Administrative tools are available only to the seeded administrator.' : 'Sign in to your portfolio account.'}
              </p>
            </div>
            <form className="auth-form" onSubmit={submitAuth}>
              {activePage === 'Sign Up' && (
                <label>Name<input autoComplete="name" maxLength="100" name="name" required /></label>
              )}
              <label>Email address<input autoComplete="email" name="email" required type="email" /></label>
              <label>Password<input autoComplete={activePage === 'Sign Up' ? 'new-password' : 'current-password'} minLength="8" name="password" required type="password" /></label>
              {authError && <p className="form-message form-error" role="alert">{authError}</p>}
              <button className="button button-dark" disabled={authBusy} type="submit">
                {authBusy ? 'Please wait…' : activePage === 'Sign Up' ? 'Create account' : 'Sign in'}
              </button>
              <p className="fine-print">
                {activePage === 'Sign Up' ? 'Already registered? ' : 'New here? '}
                <a className="text-link inline-link" href={activePage === 'Sign Up' ? '#sign-in' : '#sign-up'}>
                  {activePage === 'Sign Up' ? 'Sign in' : 'Create an account'}
                </a>
              </p>
            </form>
          </section>
        )
      default:
        return (
          <section className="home-page" aria-labelledby="page-title">
            <div className="home-copy">
              <p className="eyebrow"><span className="availability-dot" /> Open to full-stack & AI software roles</p>
              <h1 id="page-title">Designing for<br />the <em>in-between.</em></h1>
              <p className="home-intro">Hello, I’m Avi: a developer who brings thoughtful design and useful technology together.</p>
              <div className="home-actions"><a className="button button-dark" href="#about">A little about me <span aria-hidden="true">↗</span></a><a className="quiet-link" href="#projects">Explore my work</a></div>
              {capturedMessage && <p className="form-confirmation" role="status">Thanks, {capturedMessage.firstName}. Your message has been saved.</p>}
              <p className="home-location">Based in Toronto, Canada <span aria-hidden="true">·</span> Open to collaboration</p>
            </div>
            <div className="home-visual">
              <img src={`${publicBase}images/Home%20portrait.jpg`} alt="Close-up portrait of Avi smiling" />
              <div className="visual-caption"><span>Curiosity, with a point of view.</span><span>43° 39' N · 79° 23' W</span></div>
              <div className="visual-stamp" aria-hidden="true">A<br />B</div>
            </div>
          </section>
        )
    }
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Avi Balsingh, home"><span className="brand-mark">AB</span><span className="brand-name">Avi Balsingh<span>Portfolio · 2026</span></span></a>
        <nav className="main-nav" aria-label="Main navigation">
          {pages.map((page) => <a key={page} href={`#${page.toLowerCase()}`} aria-current={activePage === page ? 'page' : undefined}>{page}</a>)}
        </nav>
        <div className="header-account">
          {user ? (
            <>
              <span className="account-name">{user.name}{isAdmin ? ' · Admin' : ''}</span>
              <button className="header-auth-button" onClick={signOut} type="button">Sign out</button>
            </>
          ) : (
            <>
              <a className="header-auth-link" href="#sign-in">Sign in</a>
              <a className="header-auth-link" href="#sign-up">Sign up</a>
            </>
          )}
          <a className="header-contact" href="#contact">Let’s talk <span aria-hidden="true">↗</span></a>
        </div>
      </header>
      <main id="main-content" key={activePage}>
        {renderPage()}
      </main>
      <footer className="site-footer"><span>© 2026 Avi Balsingh</span><span>Made with care in Toronto</span><a href="#home">Back to top ↑</a></footer>
    </div>
  )
}

export default App
