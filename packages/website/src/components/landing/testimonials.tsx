"use client";

import Image from "next/image";
import Marquee from "react-fast-marquee";
import { GridSection } from "./grid-section";
import { FEATURED_TESTIMONIAL, TESTIMONIALS_ROW_ONE, TESTIMONIALS_ROW_TWO } from "./constants";
import type { Testimonial } from "./constants";

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <a
    href={testimonial.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex h-full w-72 shrink-0 flex-col justify-between border-r border-fd-border p-5 transition-colors hover:bg-fd-accent/20"
  >
    <p className="text-sm leading-relaxed text-fd-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
    <div className="mt-4 flex items-center gap-3">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-full ring-2 ring-fd-border">
        <Image
          src={testimonial.authorAvatar}
          alt={testimonial.authorName}
          width={32}
          height={32}
          className="size-full object-cover"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-fd-foreground">{testimonial.authorName}</p>
        <p className="text-xs text-fd-muted-foreground">{testimonial.authorTagline}</p>
      </div>
    </div>
  </a>
);

export const Testimonials = () => (
  <GridSection>
    <div className="border-t border-fd-border">
      <div className="px-6 py-10 md:px-10">
        <p className="text-xs font-medium uppercase tracking-widest text-fd-muted-foreground">
          What people are saying
        </p>
      </div>

      <div className="flex flex-col border-t border-fd-border md:flex-row">
        {/* Left: Featured testimonial (40%) */}
        <div className="flex w-full flex-col justify-center border-b border-fd-border p-8 md:w-2/5 md:border-b-0 md:border-r md:p-12">
          <div className="mb-6 text-5xl font-serif text-fd-muted-foreground/40">&ldquo;</div>
          <blockquote className="mb-8 text-xl font-medium leading-relaxed text-fd-foreground md:text-2xl">
            {FEATURED_TESTIMONIAL.quote}
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full ring-2 ring-fd-border">
              <Image
                src={FEATURED_TESTIMONIAL.authorAvatar}
                alt={FEATURED_TESTIMONIAL.authorName}
                width={48}
                height={48}
                className="size-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-fd-foreground">{FEATURED_TESTIMONIAL.authorName}</p>
              <p className="text-sm text-fd-muted-foreground">
                {FEATURED_TESTIMONIAL.authorTagline}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Marquee testimonials (60%) */}
        <div className="flex w-full flex-col md:w-3/5">
          <div className="border-b border-fd-border">
            <Marquee gradient={false} speed={30} pauseOnHover>
              {TESTIMONIALS_ROW_ONE.map((testimonial) => (
                <TestimonialCard key={testimonial.authorName} testimonial={testimonial} />
              ))}
            </Marquee>
          </div>
          <div>
            <Marquee gradient={false} speed={30} direction="right" pauseOnHover>
              {TESTIMONIALS_ROW_TWO.map((testimonial) => (
                <TestimonialCard key={testimonial.authorName} testimonial={testimonial} />
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </div>
  </GridSection>
);
