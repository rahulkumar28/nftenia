/* pages/index.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Head from 'next/head'
import { nftToBuy } from './index'
import { useRouter } from 'next/router'

import {
    nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/Market.sol/NFTMarket.json'



export default function Pricing() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')

    const router = useRouter()


    const Content = [
        {
            image: "/NFT-Silver.png",
            alt: "OT",
            title: "OneTime NFT",
            desc: "One time NFT for annual subscription",
            pricetag: "ETH 0.001",
        },
        {
            image: "/NFT-Gold.png",
            alt: "MS",
            title: "Money Stream",
            desc: "Realtime Money Stream for instant access",
            pricetag: "Flow Rate(100 wei/sec)",
        },
    ];

    /*
    useEffect(() => {
        loadNFTs()
    }, [])
    */
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
        const mvItems = items.filter(i => i.type === 'mv')

        setNfts(mvItems)
        setLoadingState('loaded')
    }
    async function buyNft() {
        /* needs the user to sign the transaction, so will use Web3Provider and sign it */
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

        /* user will be prompted to pay the asking proces to complete the transaction */
        const price = ethers.utils.parseUnits(nftToBuy.price.toString(), 'ether')
        const transaction = await contract.createMarketSale(nftaddress, nftToBuy.tokenId, {
            value: price
        })
        await transaction.wait()
        //loadNFTs()
        router.push('/')
    }

    //if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in Metaverse</h1>)
    return (
        <>
            < Head>
                <title>Pricing</title>
            </Head>
            <h2 className="flex w-full h-screen bg-dunes bg-cover bg-center">
                <link rel="stylesheet" href="https://cdn.materialdesignicons.com/6.5.95/css/materialdesignicons.min.css" />
                <div class="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5">
                    {
                        Content.map((data, i) => (
                            <div class="rounded overflow-hidden shadow-lg">
                                <div class="px-6 py-4 bg-slate-200">
                                    <div class="font-bold text-8xl mb-2 hover:underline truncate">{data.title}</div>
                                    <p class="text-gray-700 text-4xl hover:underline truncate">
                                        {data.desc}
                                    </p>
                                </div>
                                <div class="px-6 py-4 bg-slate-200">
                                    <div class="font-bold text-8xl mb-2 hover:underline truncate">Price</div>
                                    <p class="text-gray-700 text-4xl hover:underline truncate">
                                        {data.pricetag}
                                    </p>
                                </div>

                                <div class=" bg-white justify-items-center">
                                    <button class="mt-2 mb-2 h-20 w-full justify-items-center  bg-blue-600 text-white font-medium leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out text-4xl" onClick={() => buyNft()}>Buy</button>
                                </div>
                            </div>
                        ))
                    }

                </div>
            </h2>
        </>
    )
}