import type { NextConfig } from "next";
import i18nPlugin from "./next-i18next.config"

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  i18n: i18nPlugin.i18n,
};

export default nextConfig;
