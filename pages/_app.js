/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'
import Head from 'next/head'



function Marketplace({ Component, pageProps }) {
  return (
    <div className="">
      <Head>
        <title>NFTenia</title>
      </Head>
      <nav className="bg-banpat4 w-full bg-cover bg-bottom border-b-4 p-6 shadow-lg">

        <div className="flex shrink-0">
          <img src="/nftenia2.png" alt="Logo" class="object-contain align-left h-30 w-40" />
        </div>
        <div className="hidden md:flex items-center mt-6  justify-right">
          <Link href="/">
            <a className="mr-20 text-white font-bold hover:text-yellow-500 transition duration-300">
              Metaverse
            </a>
          </Link>
          <Link href="/avatar">
            <a className="mr-20 text-white font-bold hover:text-yellow-500 transition duration-300">
              Avatar
            </a>
          </Link>
          <Link href="/games">
            <a className="mr-20 text-white font-bold hover:text-yellow-500 transition duration-300">
              Games
            </a>
          </Link>


        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default Marketplace
