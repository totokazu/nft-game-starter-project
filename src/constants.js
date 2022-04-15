const CONTRACT_ADDRESS = '0xF87c128976A3b95C30Dc24bFa09a491C3632012E';

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    };
};

export {CONTRACT_ADDRESS, transformCharacterData};