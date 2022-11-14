pragma ever-solidity >= 0.61.2;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "@broxus/tip3/contracts/interfaces/ITokenRoot.sol";

contract Sample {
    uint16 static _nonce;

    uint state;
    address root_;
    event StateChange(uint _state);
    event WalletDeployed(address wallet);

    constructor(uint _state, address root) public {
        tvm.accept();
        root_ = root;
        ITokenRoot(root).deployWallet{
            value: 2 ever, 
            callback: onWallet
        }(address(this), 0.1 ever);
        setState(_state);
    }

    function onWallet(address wallet) public view internalMsg {
        require(msg.sender == root_, 1001);
        tvm.accept();
        emit WalletDeployed(wallet);
    }

    function setState(uint _state) public {
        tvm.accept();
        state = _state;

        emit StateChange(_state);
    }

    function getDetails()
        external
        view
    returns (
        uint _state
    ) {
        return state;
    }
}
