import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 你原有的配置，例如 images, experimental 等
  reactStrictMode: true,
};

export default withPWA(nextConfig);
