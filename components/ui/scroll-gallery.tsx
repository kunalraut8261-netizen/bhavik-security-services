"use client";

import React from "react";
import Image from "next/image";

const CARDS = [
  {
    id: 1,
    src: "/images/expertise/guard-house.png",
    title: "Guard Post Setup",
    category: "Site Security",
  },
  {
    id: 2,
    src: "/images/expertise/event-security.jpg",
    title: "Event Security",
    category: "Crowd Control",
  },
  {
    id: 3,
    src: "/images/expertise/circuit-security.jpg",
    title: "Circuit Monitoring",
    category: "Surveillance",
  },
  {
    id: 4,
    src: "/images/expertise/executive-guard.jpg",
    title: "Executive Protection",
    category: "VIP Security",
  },
  {
    id: 5,
    src: "/images/expertise/patrol-guard.jpg",
    title: "Mobile Patrol",
    category: "Field Operations",
  },
  {
    id: 6,
    src: "/images/expertise/security-team.jpg",
    title: "Security Team",
    category: "Integrated Services",
  },
];

export default function ScrollGallery() {
  return (
    <section
      id="gallery-scroll"
      style={{
        background: "#0f0f0f",
        padding: "60px 0",
      }}
    >
      {/* Section Title */}
      <div style={{ paddingLeft: "40px", marginBottom: "32px" }}>
        <p
          style={{
            color: "#c9a84c",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Our Services
        </p>
        <h2
          style={{
            color: "#ffffff",
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          What We Do
        </h2>
      </div>

      {/* Scrollable Card Container */}
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          scrollBehavior: "smooth",
          gap: "20px",
          padding: "20px 40px",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
        className="hide-scrollbar"
      >
        {CARDS.map((card) => (
          <div
            key={card.id}
            style={{
              width: "300px",
              height: "400px",
              flexShrink: 0,
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
            }}
          >
            {/* Image */}
            <Image
              src={card.src}
              alt={card.title}
              fill
              style={{ objectFit: "cover", borderRadius: "12px" }}
              sizes="300px"
            />

            {/* Gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)",
                borderRadius: "12px",
              }}
            />

            {/* Text at bottom */}
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                right: "20px",
              }}
            >
              <p
                style={{
                  color: "#c9a84c",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  margin: "0 0 6px 0",
                }}
              >
                {card.category}
              </p>
              <h3
                style={{
                  color: "#ffffff",
                  fontSize: "18px",
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {card.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Hide scrollbar in webkit */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
