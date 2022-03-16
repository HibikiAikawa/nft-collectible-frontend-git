
import { useEffect, useState } from 'react';

import './App.css';
import contract from './contracts/NFTCollectible.json';

import { ethers } from 'ethers';

const contractAddress = '0xea2Ccf2f434A1a33E8f5a4A0A1747Bb5D46fDd20';
const imageAddress = 'QmUygfragP8UmCa7aq19AHLttxiLw1ELnqcsQQpM5crgTF'
const abi = contract.abi;

function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [nftContract, setNftContract] = useState('');
  const [mintState, setMintState] = useState('');
  const [tokenId, setTokenId] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
  
    if (!ethereum) {
      console.log("Make sure you have MetaMask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(
        contractAddress,
        abi,
        signer
      );

      setNftContract(nftContract);
      console.log('NFT Contract is: ',nftContract);
    }

    const accounts = await ethereum.request({method: 'eth_accounts'});
    
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log('Found an authorized account: ', account);
      setCurrentAccount(account);
    } else {
      console.log('No authorized account found');
    }
  
  }

   const connectWalletHandler = async () => {
    const { ethereum } = window;
  
    if (!ethereum) {
      alert("Please install MetaMask!");
    }
  
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }
  const mintNftHandler = async() => { 
    try {
      setMintState('minting');
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        setNftContract(nftContract);

        console.log('Initialize payment');
        let nftTxn = await nftContract.mintNFTs(1, {value: ethers.utils.parseEther('0.01')});
        console.log('Minting... please wait');
        await nftTxn.wait();

        console.log(`Mined, see transaction: ${nftTxn.hash}`);
      } else {
        console.log('Ethereum object does not exist');
      }
      setMintState('');
    } catch (err) {
      console.log(err);
      setMintState('');
    }
   }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
    )
  }

  const svgIcon = () => {
    let _id = tokenId;
    _id = Number(_id);
    _id = String(_id);

    return (
      <div className="svg-wrapper">
      <a href={`https://testnets.opensea.io/assets/mumbai/${contractAddress}/${_id}`} >
      <svg height="80" width="300" xmlns="http://www.w3.org/2000/svg">
        <rect id="shape" height="80" width="300"  />
      </svg>
      </a>
    </div>
    )
  }

  const renderState = () => {
    if (mintState === 'minting') {
      return (
      <div className='mining'>
        <div className='loader' />
        <span>Now...Minting...</span>
      </div>
      )
    } else if (mintState === 'minted') {
      return (
        <div className='minted-container'>
          <div className='minted-char'>
            <div id='svg'>
            {svgIcon()}
            </div>
            <div id='text'>
              <p>OpenSea Testnet</p>
            </div>
          </div>
        </div>
      )
  }
}

  useEffect(() => {
    const getContract = async () => {
      try {
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const nftContract = new ethers.Contract(contractAddress, abi, signer);
  
          setNftContract(nftContract);
          console.log('into getContract func.');
        } else {
          console.log('Check Metamask');
        }

      } catch (err) {
        console.log(err);
      }
    }
    const onNewNFTMinted = (tokenId) => {
      let _id;
      if (tokenId < 10) {
        _id = `0${tokenId}`;
      } else {
        _id = tokenId
      }
      setTokenId(_id)
      setMintState('minted')

      console.log('catch the signal of the mint. have set nft image url.')
    }

    if (nftContract) {
      // getContract();
      nftContract.on('NewNFTMinted', onNewNFTMinted);
    }

    return () => {
      if (nftContract) {
        nftContract.off('NewNFTMinted', onNewNFTMinted);
      }
    }

  }, [nftContract])

  useEffect(() => {
    checkWalletIsConnected();
  }, [])

  return (
    <div className='main-app'>
      {mintState !== "minted" ? (
            <h1>Scrappy Squirrels</h1>
          ) : (
            <h1>New NFT!</h1>
          )}
      
      <div className='image-container'>
        <div className='image'>
          {mintState !== "minted" ? (
            <img src={`https://gateway.pinata.cloud/ipfs/${imageAddress}/00.png`}/>
          ) : (
            <img src={`https://gateway.pinata.cloud/ipfs/${imageAddress}/${tokenId}.png`} />
          )}
        </div>
      </div>

      <div className='button-container'>
        {currentAccount ? mintNftButton() : connectWalletButton()}
      </div>
      {renderState()}
    </div>
  )
}

export default App;