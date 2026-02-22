"use client";

import Image from "next/image";
import { SectionContainer, SectionContent, SectionFiller, SectionHelper } from "./section-layout";
import {
  FEATURED_TESTIMONIAL,
  TESTIMONIALS_ROW_ONE,
  TESTIMONIALS_ROW_TWO,
} from "@/constants/testimonials";

import { Marquee, MarqueeContent, MarqueeFade, MarqueeItem } from "@/components/ui/marquee";
import {
  Testimonial,
  TestimonialAuthor,
  TestimonialAuthorName,
  TestimonialAuthorTagline,
  TestimonialAvatar,
  TestimonialAvatarImg,
  TestimonialAvatarRing,
  TestimonialQuote,
  TestimonialVerifiedBadge,
} from "@/components/ui/testimonial";
import type { Translation } from "@/translations";

interface TestimonialsProps {
  translation: Translation;
}

export function TestimonialsMarquee() {
  return (
    <div className="w-full space-y-4 bg-background [&_.rfm-initial-child-container]:items-stretch! [&_.rfm-marquee]:items-stretch!">
      {[TESTIMONIALS_ROW_ONE, TESTIMONIALS_ROW_TWO].map((list, index) => (
        <Marquee key={index} className="border-y border-edge">
          <MarqueeFade side="left" />
          <MarqueeFade side="right" />

          <MarqueeContent direction={index % 2 === 1 ? "right" : "left"}>
            {list.map((item) => (
              <MarqueeItem key={item.url} className="mx-0 h-full w-xs border-r border-edge">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full transition-[background-color] ease-out hover:bg-accent/20"
                >
                  <Testimonial>
                    <TestimonialQuote>
                      <p>{item.quote}</p>
                    </TestimonialQuote>

                    <TestimonialAuthor className={!item.authorTagline ? "grid-rows-1" : undefined}>
                      <TestimonialAvatar>
                        <TestimonialAvatarImg src={item.authorAvatar} />
                        <TestimonialAvatarRing />
                      </TestimonialAvatar>

                      <TestimonialAuthorName
                        className={!item.authorTagline ? "flex items-center" : undefined}
                      >
                        {item.authorName}
                        {item.authorTagline && <TestimonialVerifiedBadge />}
                      </TestimonialAuthorName>

                      {item.authorTagline && (
                        <TestimonialAuthorTagline>{item.authorTagline}</TestimonialAuthorTagline>
                      )}
                    </TestimonialAuthor>
                  </Testimonial>
                </a>
              </MarqueeItem>
            ))}
          </MarqueeContent>
        </Marquee>
      ))}
    </div>
  );
}

export const Testimonials = ({ translation }: TestimonialsProps) => (
  <>
    <SectionFiller />
    <SectionContainer>
      <SectionHelper>{translation.testimonials.sectionLabel}</SectionHelper>

      <SectionContent className="flex flex-col md:flex-row">
        <a
          href={FEATURED_TESTIMONIAL.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full flex-col justify-center border-fd-border p-8 transition-[background-color] ease-out hover:bg-accent/20 md:w-2/5 md:border-r md:p-12"
        >
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
            <div
              className={
                FEATURED_TESTIMONIAL.authorTagline ? undefined : "flex flex-col justify-center"
              }
            >
              <p className="font-medium text-fd-foreground">{FEATURED_TESTIMONIAL.authorName}</p>
              {FEATURED_TESTIMONIAL.authorTagline && (
                <p className="text-sm text-fd-muted-foreground">
                  {FEATURED_TESTIMONIAL.authorTagline}
                </p>
              )}
            </div>
          </div>
        </a>

        <div className="flex w-full flex-col justify-center md:w-3/5">
          <TestimonialsMarquee />
        </div>
      </SectionContent>
    </SectionContainer>
  </>
);
