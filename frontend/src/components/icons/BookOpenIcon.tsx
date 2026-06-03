import type { SVGProps } from 'react'

/** SVG path data for the open-book icon (shared by component and favicon). */
export const BOOK_OPEN_VIEWBOX = '0 0 48 48'

export const BOOK_OPEN_STROKE_WIDTH = 2.5

/** Render open-book icon strokes inside an SVG group. */
export function BookOpenPaths() {
  return (
    <>
      <path d="M8 16v19" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path d="M12 17v15" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path d="M15 17v15" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path d="M17 34L24 15" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path d="M24 15L31 34" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path d="M33 17v15" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path d="M36 17v15" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path d="M40 16v19" stroke="currentColor" strokeWidth={BOOK_OPEN_STROKE_WIDTH} strokeLinecap="round" />
      <path
        d="M8 35C14 39 18 40 24 40C30 40 34 39 40 35"
        stroke="currentColor"
        strokeWidth={BOOK_OPEN_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  )
}

interface BookOpenIconProps extends SVGProps<SVGSVGElement> {
  size?: number
}

/** Minimal open-book line icon for education and specialty UI. */
export function BookOpenIcon({ size = 24, className, ...props }: BookOpenIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={BOOK_OPEN_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={props['aria-label'] ? undefined : true}
      {...props}
    >
      <BookOpenPaths />
    </svg>
  )
}
