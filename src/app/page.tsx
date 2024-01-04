import Head from "next/head";
import Image from "next/image";
import Script from "next/script";

export default function Home() {
  return (
    <div>
      <Head>
        <script
          src='https://accounts.google.com/gsi/client'
          async
          defer
        ></script>
      </Head>

      <div>
        <p>Hello World</p>
      </div>
    </div>
  );
}
