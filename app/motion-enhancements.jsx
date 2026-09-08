'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const interactiveSelector = [
  'a',
  'button',
  '[role="button"]',
  '.project-card',
  '.dashboard-card',
  '.media-project-card',
  '.service-card',
  '.achievement-card',
  '.contact-detail-card',
  '.enterprise-portfolio-card',
  '.product-portfolio-card'
].join(',');

const magneticSelector = [
  '.button',
  '.nav-cta',
  '.project-link',
  '.social-button',
  '.project-card',
  '.dashboard-card',
  '.media-project-card',
  '.service-card',
  '.achievement-card',
  '.contact-detail-card',
  '.product-portfolio-card'
].join(',');

export default function MotionEnhancements() {
  const prefersReducedMotion = useReducedMotion();
  const cursorX = useMotionValue(-80);
  const cursorY = useMotionValue(-80);
  const springX = useSpring(cursorX, { stiffness: 980, damping: 28, mass: 0.11 });
  const springY = useSpring(cursorY, { stiffness: 980, damping: 28, mass: 0.11 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorActive, setCursorActive] = useState(false);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const revealItems = gsap.utils.toArray('.reveal:not(.service-card):not(.achievement-card)');
    const serviceCards = gsap.utils.toArray('.service-card');
    const achievementCards = gsap.utils.toArray('.achievement-card');
    if (prefersReducedMotion) {
      gsap.set([...revealItems, ...serviceCards, ...achievementCards], { autoAlpha: 1, x: 0, y: 0, filter: 'none' });
      return undefined;
    }

    const context = gsap.context(() => {
      revealItems.forEach((element, index) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 28, filter: 'blur(8px)' },
          {
            immediateRender: false,
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.82,
            delay: (index % 4) * 0.045,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 89%',
              once: true
            }
          }
        );
      });

      if (serviceCards.length) {
        gsap.fromTo(
          serviceCards,
          { autoAlpha: 0, y: 34, filter: 'blur(9px)' },
          {
            immediateRender: false,
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.82,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.services-grid', start: 'top 86%', once: true }
          }
        );
      }

      achievementCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, x: index % 2 === 0 ? -24 : 24, y: 30, filter: 'blur(9px)' },
          {
            immediateRender: false,
            autoAlpha: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 86%', once: true }
          }
        );
      });

      gsap.to('.ambient-orange', {
        yPercent: -22,
        xPercent: -7,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.1 }
      });

      gsap.to('.ambient-blue', {
        yPercent: 18,
        xPercent: 6,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 1.25 }
      });

      const portrait = document.querySelector('.portrait-card');
      if (portrait) {
        gsap.to(portrait, {
          yPercent: 7,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.9 }
        });
      }

      gsap.utils.toArray('.dashboard-image-wrap img').forEach((image) => {
        gsap.fromTo(
          image,
          { yPercent: -2, scale: 1.035 },
          {
            yPercent: 3,
            scale: 1.055,
            ease: 'none',
            scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 1 }
          }
        );
      });
    });

    const refreshScrollTriggers = () => window.requestAnimationFrame(() => ScrollTrigger.refresh(true));
    const refreshTimer = window.setTimeout(refreshScrollTriggers, 320);
    window.addEventListener('load', refreshScrollTriggers);
    window.addEventListener('portfolio:cms-ready', refreshScrollTriggers);
    ScrollTrigger.refresh();
    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('load', refreshScrollTriggers);
      window.removeEventListener('portfolio:cms-ready', refreshScrollTriggers);
      context.revert();
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (prefersReducedMotion || !finePointer) return undefined;

    document.body.classList.add('cinematic-cursor');
    const onPointerMove = (event) => {
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
      setCursorVisible(true);
    };
    const onPointerLeave = () => setCursorVisible(false);
    const onPointerOver = (event) => {
      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      setCursorActive(Boolean(target));
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('pointerover', onPointerOver, { passive: true });

    const cleanups = [];
    document.querySelectorAll(magneticSelector).forEach((element) => {
      const strength = element.matches('.project-card, .dashboard-card, .media-project-card, .service-card, .achievement-card, .contact-detail-card, .product-portfolio-card') ? 7 : 11;
      const moveX = gsap.quickTo(element, 'x', { duration: 0.42, ease: 'power3.out' });
      const moveY = gsap.quickTo(element, 'y', { duration: 0.42, ease: 'power3.out' });

      const onMove = (event) => {
        const bounds = element.getBoundingClientRect();
        const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;
        moveX(relativeX * strength);
        moveY(relativeY * strength);
      };
      const onLeave = () => {
        moveX(0);
        moveY(0);
      };

      element.addEventListener('pointermove', onMove, { passive: true });
      element.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        element.removeEventListener('pointermove', onMove);
        element.removeEventListener('pointerleave', onLeave);
      });
    });

    return () => {
      document.body.classList.remove('cinematic-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('pointerover', onPointerOver);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [cursorX, cursorY, prefersReducedMotion]);

  return (
    <motion.div
      aria-hidden="true"
      className="cursor-follower"
      style={{ x: springX, y: springY }}
      initial={false}
      animate={{
        opacity: cursorVisible ? 1 : 0,
        scale: cursorActive ? 2.15 : 1,
        backgroundColor: cursorActive ? 'rgba(255, 151, 76, 0.24)' : 'rgba(136, 206, 255, 0.16)',
        borderColor: cursorActive ? 'rgba(255, 173, 112, 0.72)' : 'rgba(136, 206, 255, 0.58)'
      }}
      transition={{ type: 'spring', stiffness: 720, damping: 28 }}
    />
  );
}
