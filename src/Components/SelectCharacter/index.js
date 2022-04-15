import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import LoadingIndicator from "../../Components/LoadingIndicator";

const SelectCharacter = ({setCharacterNFT}) =>{
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFTAction =(characterId) => async () =>{
        try{
            if(gameContract){
                setMintingCharacter(true);
                console.log("Minting character in progress...");
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log("mintTxn:", mintTxn);
                setMintingCharacter(false);
            }
        } catch (error){
            console.warn("MintCharacterAction Error:",error);
            setMintingCharacter(false);
        }
    }
    useEffect(() => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );

            setGameContract(gameContract);
            }else {
                console.log("ethereum object not found");
            }
    },[]);
    useEffect(() => {
        const getCharacters = async () => {
            try{
                console.log("getting contract characters to mint");
                //ミント可能な全nftキャラクターをコントラクトから呼び出す
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("charactersTxn:",charactersTxn);

                //すべてのnftキャラクターのデータを変換
                const characters = charactersTxn.map((characterData) =>
                transformCharacterData(characterData)
                );

                //ミント可能なすべてのnftキャラクターのstateを設定
                setCharacters(characters);                
            } catch(error){
                console.error("something went wrong fetching characters:",error);
            }
        };
        const onCharacterMint = async (sender, tokenId, characterIndex) =>{
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );
            if(gameContract){
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log("CharacterNFT: ", characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
                alert(
                    `NFT キャラクーが Mint されました -- リンクはこちらです: https://rinkeby.rarible.com/token/${
                    gameContract.address
                    }:${tokenId.toNumber()}?tab=details`
                );
            }
        };
        if(gameContract){
            getCharacters();
            gameContract.on("CharacterNFTMinted", onCharacterMint);
        }
        return () =>{
            if (gameContract) {
                gameContract.off("CharacterNFTMinted", onCharacterMint);
            }
        };
    },[gameContract]);
    const renderCharacters = () =>
    characters.map((character, index) => (
        <div className="character-item" key={character.name}>
            <div className="name-container">
                <p>{character.name}</p>
            </div>
            <img src={character.imageURI} alt={character.name} />
            <button
                type="button"
                className="character-mint-button"
                onClick={mintCharacterNFTAction(index)}
            >{`Mint ${character.name}`}</button>
        </div>
    ));
    return (
        <div className="select-character-container">
            <h2>⏬ 一緒に戦う NFT キャラクターを選択 ⏬</h2>
            {/* キャラクターNFTがフロントエンド上で読み込めている際に、下記を表示します*/}
            {characters.length > 0 && (
                <div className="character-grid">{renderCharacters()}</div>
            )}
            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator />
                        <p>Minting In Progress...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SelectCharacter;