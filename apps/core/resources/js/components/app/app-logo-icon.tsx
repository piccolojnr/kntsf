import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/images/favicon.png"
            alt="Knutsford University logo"
            decoding="async"
        />
    );
}
