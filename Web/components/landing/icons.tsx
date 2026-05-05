export function IconScan({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 10V8a2 2 0 012-2h2M26 10V8a2 2 0 00-2-2h-2M6 22v2a2 2 0 002 2h2M26 22v2a2 2 0 01-2 2h-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="10" y="10" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M14 14h4M14 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconSparkles({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M16 4l1.2 4.8L22 10l-4.8 1.2L16 16l-1.2-4.8L10 10l4.8-1.2L16 4zM24 18l.8 3.2L28 22l-3.2.8L24 26l-.8-3.2L20 22l3.2-.8L24 18zM8 20l.6 2.4L11 23l-2.4.6L8 26l-.6-2.4L5 23l2.4-.6L8 20z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

export function IconLeaf({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M26 6C18 6 10 12 8 20c-1 4 2 7 6 6 8-2 14-10 14-18 0-1.5-.5-2.8-1.2-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 26c4-4 10-6 16-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M16 26S6 20 6 13a5 5 0 019-3 1 1 0 011 0 5 5 0 019 3c0 7-10 13-10 13z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconApple({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function IconPlay({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-12.41 7.118v-4.185l8.108-5.233zm0-2.186L3.61 2.734v4.185l8.108 5.233 2.302-2.302zM5.864 0L18.9 7.455v9.09L5.864 24V0z" />
    </svg>
  );
}

export function IconMenu({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
