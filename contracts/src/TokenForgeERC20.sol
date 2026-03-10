// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {ERC20Pausable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenForgeERC20 is ERC20, ERC20Burnable, ERC20Capped, ERC20Pausable, Ownable {
    event TokensMinted(address indexed to, uint256 amount, address indexed operator);
    event TokensBurned(address indexed from, uint256 amount, address indexed operator);
    event TokenPaused(address indexed operator);
    event TokenUnpaused(address indexed operator);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_,
        address initialOwner_
    ) ERC20(name_, symbol_) ERC20Capped(cap_) Ownable(initialOwner_) {}

    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        _mint(to, amount);
        emit TokensMinted(to, amount, msg.sender);
    }

    function pause() external onlyOwner {
        _pause();
        emit TokenPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit TokenUnpaused(msg.sender);
    }

    function burn(uint256 value) public override whenNotPaused {
        super.burn(value);
        emit TokensBurned(msg.sender, value, msg.sender);
    }

    function burnFrom(address account, uint256 value) public override whenNotPaused {
        super.burnFrom(account, value);
        emit TokensBurned(account, value, msg.sender);
    }

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Capped, ERC20Pausable)
    {
        super._update(from, to, value);
    }
}
