import gsap from 'gsap'

// Change 'any' to 'HTMLElement | null'
export const fadeInUp = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return
  gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power3.out' }
  )
}

export const staggerFadeIn = (
  elements: NodeListOf<Element> | Element[],
  stagger: number = 0.1
) => {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, stagger, ease: 'power2.out' }
  )
}

export const scaleIn = (element: HTMLElement | null) => {
  if (!element) return
  gsap.fromTo(
    element,
    { scale: 0.9, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
  )
}

export const progressBar = (element: HTMLElement | null, progress: number) => {
  if (!element) return
  gsap.to(element, {
    width: `${progress}%`,
    duration: 1,
    ease: 'power2.out',
  })
}

export const floatIn = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return
  gsap.fromTo(
    element,
    { opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1.2,
      delay,
      ease: 'power3.out',
    }
  )
}

export const gentleFloat = (element: HTMLElement | null) => {
  if (!element) return
  gsap.to(element, {
    y: -10,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
}

export const shimmer = (element: HTMLElement | null) => {
  if (!element) return
  gsap.fromTo(
    element,
    { backgroundPosition: '-200% center' },
    {
      backgroundPosition: '200% center',
      duration: 3,
      repeat: -1,
      ease: 'none',
    }
  )
}

export const blurToFocus = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return
  gsap.fromTo(
    element,
    { filter: 'blur(20px)', opacity: 0, scale: 1.1 },
    {
      filter: 'blur(0px)',
      opacity: 1,
      scale: 1,
      duration: 1.5,
      delay,
      ease: 'power2.out',
    }
  )
}

export const revealText = (element: HTMLElement | null, delay: number = 0) => {
  if (!element) return
  gsap.fromTo(
    element,
    {
      opacity: 0,
      y: 30,
      letterSpacing: '0.5em',
      filter: 'blur(5px)',
    },
    {
      opacity: 1,
      y: 0,
      letterSpacing: '0.05em',
      filter: 'blur(0px)',
      duration: 1.4,
      delay,
      ease: 'power3.out',
    }
  )
}

export const cardHover = (element: HTMLElement | null) => {
  if (!element) return

  element.addEventListener('mouseenter', () => {
    gsap.to(element, {
      y: -8,
      scale: 1.02,
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.out',
    })
  })

  element.addEventListener('mouseleave', () => {
    gsap.to(element, {
      y: 0,
      scale: 1,
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      duration: 0.3,
      ease: 'power2.out',
    })
  })
}

export const gradientShift = (element: HTMLElement | null) => {
  if (!element) return

  const tl = gsap.timeline({ repeat: -1, yoyo: true })

  tl.to(element, {
    backgroundPosition: '100% 50%',
    duration: 8,
    ease: 'sine.inOut',
  })

  return tl
}
