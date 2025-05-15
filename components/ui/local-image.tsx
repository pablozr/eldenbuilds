'use client';

import React from 'react';
import Image, { ImageProps } from 'next/image';

type LocalImageProps = Omit<ImageProps, 'src'> & {
  src: string;
};

export function LocalImage({ src, alt, ...props }: LocalImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      {...props}
    />
  );
}
