"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import './animated-cards-stack.css';

interface ReviewProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  maxRating?: number;
}

export const ReviewStars = React.forwardRef<HTMLDivElement, ReviewProps>(
  ({ rating, maxRating = 5, className, ...props }, ref) => {
    const filledStars = Math.floor(rating);
    const fractionalPart = rating - filledStars;
    const emptyStars = maxRating - filledStars - (fractionalPart > 0 ? 1 : 0);

    return (
      <div className={`ac-stars ${className || ''}`} ref={ref} {...props}>
        {[...Array(filledStars)].map((_, index) => (
          <svg key={`filled-${index}`} style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
        {fractionalPart > 0 && (
          <svg style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half">
                <stop offset={`${fractionalPart * 100}%`} stopColor="currentColor" />
                <stop offset={`${fractionalPart * 100}%`} stopColor="rgb(209 213 219)" />
              </linearGradient>
            </defs>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" fill="url(#half)" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, index) => (
          <svg key={`empty-${index}`} style={{ width: 16, height: 16, color: '#d1d5db' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
          </svg>
        ))}
        <p style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>{rating}</p>
      </div>
    );
  }
);
ReviewStars.displayName = "ReviewStars";

interface CardItem {
  id?: string;
  rating: number;
  testimonial: string;
  name: string;
  role: string;
}

export const CardStack = ({ items, offset = 10, scaleFactor = 0.06 }: { items: CardItem[], offset?: number, scaleFactor?: number }) => {
  const [cards, setCards] = React.useState<(CardItem & { __internal_id: string | number })[]>(
    () => items.map((it, idx) => ({ ...it, __internal_id: it.id ?? idx }))
  );

  React.useEffect(() => {
    setCards(items.map((it, idx) => ({ ...it, __internal_id: it.id ?? idx })));
  }, [items]);

  React.useEffect(() => {
    if (cards.length <= 1) return;
    const timer = setInterval(() => {
      setCards((prev) => {
        if (prev.length <= 1) return prev;
        const newArray = [...prev];
        const last = newArray.pop();
        if (last !== undefined) newArray.unshift(last);
        return newArray;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [cards.length]);

  const handleNext = () => {
    setCards((prev) => {
      if (prev.length <= 1) return prev;
      const newArray = [...prev];
      const last = newArray.pop();
      if (last !== undefined) newArray.unshift(last);
      return newArray;
    });
  };

  if (cards.length === 0) return null;

  return (
    <div className="ac-stack-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', position: 'relative', width: '100%', height: '500px' }}>
      <div className="ac-cards-container" style={{ margin: 0 }}>
        {cards.map((card, index) => {
          return (
            <motion.div
              layout
              key={card.__internal_id}
              className="ac-card ac-card-light"
              style={{
                transformOrigin: "bottom center",
                zIndex: cards.length - index,
              }}
              initial={false}
              animate={{
                top: index * -offset,
                scale: 1 - index * scaleFactor,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut",
              }}
            >
              <div className="ac-card-content">
                <ReviewStars rating={card.rating} />
                <div style={{ width: '90%' }}>
                  <blockquote className="ac-quote">&quot;{card.testimonial}&quot;</blockquote>
                </div>
              </div>
              
              <div className="ac-client-info">
                <div className="ac-avatar">
                  {card.name ? card.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'A'}
                </div>
                <div className="ac-client-text">
                  <span className="ac-client-name">{card.name}</span>
                  <span className="ac-client-role">{card.role}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Navigation Arrow */}
      {cards.length > 1 && (
        <button 
          onClick={handleNext}
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            border: '1px solid #e2e8f0', 
            background: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
            zIndex: 10,
            transition: 'background 0.2s',
            flexShrink: 0
          }}
          aria-label="Next Testimonial"
        >
          <ChevronRight size={24} color="#1e293b" />
        </button>
      )}
    </div>
  );
};
