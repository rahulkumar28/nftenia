/* pages/index.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Head from 'next/head'

import {
    nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'

export default function Avatar() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNFTs()
    }, [])
    async function loadNFTs() {
        /* create a generic provider and query for unsold market items */
        const provider = new ethers.providers.JsonRpcProvider()
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
        const data = await marketContract.fetchMarketItems()

        /*
        *  map over items returned from smart contract and format 
        *  them as well as fetch their token metadata
        */
        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.tokenId)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.tokenId.toNumber(),
                seller: i.seller,
                owner: i.owner,
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
        const mvItems = items.filter(i => i.type === 'av')

        setNfts(mvItems)
        setLoadingState('loaded')
    }
    async function buyNft(nft) {
        /* needs the user to sign the transaction, so will use Web3Provider and sign it */
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

        /* user will be prompted to pay the asking proces to complete the transaction */
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
        const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
            value: price
        })
        await transaction.wait()
        loadNFTs()
    }

    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in Metaverse</h1>)
    return (
        <>
            < Head>
                <title>Avatar</title>
            </Head>
            <h2 className="flex w-full h-screen bg-dunes bg-cover bg-center">
                <link rel="stylesheet" href="https://cdn.materialdesignicons.com/6.5.95/css/materialdesignicons.min.css" />
                <div class="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                    {
                        nfts.map((data, i) => (
                            <div class="rounded overflow-hidden shadow-lg">
                                <img class="w-full popup" src={data.image} alt={data.alt}></img>

                                <div class="px-6 py-4 bg-slate-200">
                                    <div class="font-bold text-xl mb-2 hover:underline truncate">{data.name}</div>
                                    <p class="text-gray-700 text-base hover:underline truncate">
                                        {data.description}
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


                                    <div class="flex flex-row flex-auto justify-end mr-1">

                                        <a class="flex text-xs border px-3 my-auto py-2 mr-2
                        border-amber-500 group hover:bg-amber-500 
                        rounded-xss
                        transition-all duration-200">


                                            <i class="mdi mdi-cart-outline text-amber-700
                            group-hover:text-white delay-100"></i>
                                        </a>


                                        <a class="flex text-xs border px-3 my-auto py-2 
                        border-amber-500 group hover:bg-amber-500 
                        rounded-xss
                        transition-all duration-200">


                                            <i class="mdi mdi-eye-outline text-amber-700
                            group-hover:text-white delay-100"></i>


                                            <div class="text-xxs text-amber-700 font-semibold ml-2
                            group-hover:text-white delay-100" onClick={() => buyNft(data)}>
                                                Buy

                                            </div>
                                        </a>
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