import Head from "next/head";
import Image from "next/image";
import styles from "./layout.module.css";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";

export const siteTitle = "1Cademy Knowledge Graph!";

export default function Layout({ children, home }) {
  return (
    <div>
      <Head>
        <link rel="icon" href="/public/favicon.ico" />
        <meta
          name="description"
          content="1Cademy Knowledge Graph Public Interface!"
        />
        <meta property="og:image" content="/public/LogoThumbnail.png" />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <main>{children}</main>
    </div>
  );
}
