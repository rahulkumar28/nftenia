/* pages/creator-dashboard.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Head from 'next/head'

import {
    nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function MyLib() {
    const [nfts, setNfts] = useState([])
    const [sold, setSold] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNFTs()
    }, [])
    async function loadNFTs() {
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchItemsCreated()

        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                sold: i.sold,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description,
                tag1: meta.data.tag1,
                tag2: meta.data.tag2,
                tag3: meta.data.tag3,
                likes: meta.data.likes,
                downloads: meta.data.downloads,
                type: meta.data.type,
            }
            return item
        }))
        /* create a filtered array of items that have been sold */
        //const soldItems = items.filter(i => i.sold)
        //setSold(soldItems)
        setNfts(items)
        setLoadingState('loaded')
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets created</h1>)
    return (
        <>
            < Head>
                <title>My-Lib</title>
            </Head>
            <h2 className="flex w-full h-screen bg-dunes bg-cover bg-center">
                <link rel="stylesheet" href="https://cdn.materialdesignicons.com/6.5.95/css/materialdesignicons.min.css" />
                <div class="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                    {
                        nfts.map((data, i) => (
                            <div class="rounded overflow-hidden shadow-lg">
                                <img class="w-full popup" src={data.image} alt={data.alt}></img>

                                <div class="px-6 py-4 bg-slate-200">
                                    <div class="font-bold text-xl mb-2 hover:underline truncate">{data.title}</div>
                                    <p class="text-gray-700 text-base hover:underline truncate">
                                        {data.desc}
                                    </p>
                                </div>
                                <div class="px-6 pt-4 pb-2 bg-white hover:underline truncate">
                                    <span
                                        class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{data.tag1}</span>
                                    <span
                                        class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{data.tag2}</span>
                                    <span
                                        class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{data.tag3}</span>
                                </div>
                                <div class="flex flex-row bg-white">

                                    <div class="flex flex-col flex-auto ml-1">

                                        <div class="flex flex-row group">
                                            <i class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200" title="Worst"></i>

                                            <i class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200" title="Bad"></i>

                                            <i class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200" title="Not Bad"></i>

                                            <i class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200" title="Good"></i>

                                            <i class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200" title="Awesome"></i>

                                            <div class="text-xxs text-gray-400 ml-1 hover:underline">
                                                ({data.likes})
                                            </div>
                                        </div>


                                        <div class="text-xxs text-gray-400 mt-1" title="34k Downlaods in this year">
                                            {data.downloads} Downloads
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))
                    }

                </div>
            </h2>
        </>
    )
}