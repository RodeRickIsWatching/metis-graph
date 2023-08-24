// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.0;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ILockingPoolLocal} from "./interfaces/ILockingPoolLocal.sol";

contract LockingInfo is Ownable {
    using SafeMath for uint256;
    mapping(uint256 => uint256) public sequencerNonce;
    address public lockingPool;

    /**
    * @dev Emitted when sequencer locks in '_lockFor()' in LockingPool.
    * @param signer sequencer address.
    * @param sequencerId unique integer to identify a sequencer.
    * @param nonce to synchronize the events in themis.
    * @param activationBatch sequencer's first epoch as proposer.
    * @param amount locking amount.
    * @param total total locking amount.
    * @param signerPubkey public key of the sequencer
    */
    event Locked(
        address indexed signer,
        uint256 indexed sequencerId,
        uint256 nonce,
        uint256 indexed activationBatch,
        uint256 amount,
        uint256 total,
        bytes signerPubkey
    );

    /**
     * @dev Emitted when sequencer unlocks in 'unlockClaim()'
     * @param user address of the sequencer.
     * @param sequencerId unique integer to identify a sequencer.
     * @param amount locking amount.
     * @param total total locking amount.
     */
    event Unlocked(
        address indexed user,
        uint256 indexed sequencerId,
        uint256 amount,
        uint256 total
    );

    /**
     * @dev Emitted when sequencer unlocks in '_unlock()'.
     * @param user address of the sequencer.
     * @param sequencerId unique integer to identify a sequencer.
     * @param nonce to synchronize the events in themis.
     * @param deactivationBatch  last batch for sequencer.
     * @param deactivationTime unlock block timestamp.
     * @param unlockClaimTime when user can claim locked token.
     * @param amount locking amount
     */
    event UnlockInit(
        address indexed user,
        uint256 indexed sequencerId,
        uint256 nonce,
        uint256 deactivationBatch,
        uint256 deactivationTime,
        uint256 unlockClaimTime,
        uint256 indexed amount
    );

    /**
     * @dev Emitted when the sequencer public key is updated in 'updateSigner()'.
     * @param sequencerId unique integer to identify a sequencer.
     * @param nonce to synchronize the events in themis.
     * @param oldSigner oldSigner old address of the sequencer.
     * @param newSigner newSigner new address of the sequencer.
     * @param signerPubkey signerPubkey public key of the sequencer.
     */
    event SignerChange(
        uint256 indexed sequencerId,
        uint256 nonce,
        address indexed oldSigner,
        address indexed newSigner,
        bytes signerPubkey
    );

    /**
     * @dev Emitted when the sequencer increase lock amoun in 'relock()'.
     * @param sequencerId unique integer to identify a sequencer.
     * @param amount locking new amount
     * @param total the total locking amount
     */
    event Relocked(uint256 indexed sequencerId, uint256 amount, uint256 total);

    /**
     * @dev Emitted when the gov update threshold in 'updateSequencerThreshold()'.
     * @param newThreshold new threshold
     * @param oldThreshold  old threshold
     */
    event ThresholdChange(uint256 newThreshold, uint256 oldThreshold);

    /**
     * @dev Emitted when the gov update threshold in 'updateWithdrwDelayTimeValue()'.
     * @param newWithrawDelayTime new withdraw delay time
     * @param oldWithrawDelayTime  old withdraw delay time
     */
    event WithrawDelayTimeChange(uint256 newWithrawDelayTime, uint256 oldWithrawDelayTime);

    /**
     * @dev Emitted when the gov update threshold in 'updateBlockReward()'.
     * @param newReward new block reward
     * @param oldReward  old block reward
     */
    event RewardUpdate(uint256 newReward, uint256 oldReward);

    /**
     * @dev Emitted when sequencer relocking in 'relock()'.
     * @param sequencerId unique integer to identify a sequencer.
     * @param nonce to synchronize the events in themis.
     * @param newAmount the updated lock amount.
     */
    event LockUpdate(
        uint256 indexed sequencerId,
        uint256 indexed nonce,
        uint256 indexed newAmount
    );

    /**
     * @dev Emitted when sequencer withdraw rewards in 'withdrawRewards' or 'unlockClaim'
     * @param sequencerId unique integer to identify a sequencer.
     * @param amount the reward amount.
     * @param totalAmount total rewards liquidated
     */
    event ClaimRewards(
        uint256 indexed sequencerId,
        uint256 indexed amount,
        uint256 indexed totalAmount
    );
   
    modifier onlyLockingPool() {
        require(lockingPool == msg.sender,
        "Invalid sender, not locking pool");
        _;
    }

    constructor(address _lockingPool) {
       lockingPool = _lockingPool;
    }


     /**
     * @dev updateNonce can update nonce for sequencrs by owner
     * @param sequencerIds the sequencer ids.
     * @param nonces the sequencer nonces
     */
    function updateNonce(
        uint256[] calldata sequencerIds,
        uint256[] calldata nonces
    ) external onlyOwner {
        require(sequencerIds.length == nonces.length, "args length mismatch");

        for (uint256 i = 0; i < sequencerIds.length; ++i) {
            sequencerNonce[sequencerIds[i]] = nonces[i];
        }
    } 

     /**
     * @dev logLocked log event Locked
     */
    function logLocked(
        address signer,
        bytes memory signerPubkey,
        uint256 sequencerId,
        uint256 activationBatch,
        uint256 amount,
        uint256 total
    ) public onlyLockingPool {
        sequencerNonce[sequencerId] = sequencerNonce[sequencerId].add(1);
        emit Locked(
            signer,
            sequencerId,
            sequencerNonce[sequencerId],
            activationBatch,
            amount,
            total,
            signerPubkey
        );
    }

     /**
     * @dev logUnlocked log event logUnlocked
     */
    function logUnlocked(
        address user,
        uint256 sequencerId,
        uint256 amount,
        uint256 total
    ) public onlyLockingPool {
        emit Unlocked(user, sequencerId, amount, total);
    }

     /**
     * @dev logUnlockInit log event logUnlockInit
     */
    function logUnlockInit(
        address user,
        uint256 sequencerId,
        uint256 deactivationBatch,
        uint256 deactivationTime,
        uint256 unlockClaimTime,
        uint256 amount
    ) public onlyLockingPool {
        sequencerNonce[sequencerId] = sequencerNonce[sequencerId].add(1);
        emit UnlockInit(
            user,
            sequencerId,
            sequencerNonce[sequencerId],
            deactivationBatch,
            deactivationTime,
            unlockClaimTime,
            amount
        );
    }


     /**
     * @dev logSignerChange log event SignerChange
     */
    function logSignerChange(
        uint256 sequencerId,
        address oldSigner,
        address newSigner,
        bytes memory signerPubkey
    ) public onlyLockingPool {
        sequencerNonce[sequencerId] = sequencerNonce[sequencerId].add(1);
        emit SignerChange(
            sequencerId,
            sequencerNonce[sequencerId],
            oldSigner,
            newSigner,
            signerPubkey
        );
    }

    /**
     * @dev logRelockd log event Relocked
     */
    function logRelockd(uint256 sequencerId, uint256 amount, uint256 total)
        public
        onlyLockingPool
    {
        emit Relocked(sequencerId, amount, total);
    }

     /**
     * @dev logThresholdChange log event ThresholdChange
     */
    function logThresholdChange(uint256 newThreshold, uint256 oldThreshold)
        public
        onlyLockingPool
    {
        emit ThresholdChange(newThreshold, oldThreshold);
    }

    /**
     * @dev logWithrawDelayTimeChange log event WithrawDelayTimeChange
     */
    function logWithrawDelayTimeChange(uint256 newWithrawDelayTime, uint256 oldWithrawDelayTime)
        public
        onlyLockingPool
    {
        emit WithrawDelayTimeChange(newWithrawDelayTime, oldWithrawDelayTime);
    }

    /**
     * @dev logRewardUpdate log event RewardUpdate
     */
    function logRewardUpdate(uint256 newReward, uint256 oldReward)
        public
        onlyLockingPool
    {
        emit RewardUpdate(newReward, oldReward);
    }

    /**
     * @dev logLockUpdate log event LockUpdate
     */
    function logLockUpdate(uint256 sequencerId)
        public
        onlyLockingPool()
    {
        sequencerNonce[sequencerId] = sequencerNonce[sequencerId].add(1);
        emit LockUpdate(
            sequencerId,
            sequencerNonce[sequencerId],
            totalSequencerLock(sequencerId)
        );
    }

     /**
     * @dev logClaimRewards log event ClaimRewards
     */
    function logClaimRewards(
        uint256 sequencerId,
        uint256 amount,
        uint256 totalAmount
    ) public onlyLockingPool {
        emit ClaimRewards(sequencerId, amount, totalAmount);
    }


     /**
     * @dev totalSequencerLock return the total locked amount of seqencerId
     * @param sequencerId unique integer to identify a sequencer.
     */
    function totalSequencerLock(uint256 sequencerId)
        public
        view
        returns (uint256 sequencerLock)
    {
        (sequencerLock, ,  , , , , , , ) = ILockingPoolLocal(lockingPool).sequencers(sequencerId);
        return sequencerLock;
    }

     /**
     * @dev getLockerDetails return the detail info of seqencerId
     * @param sequencerId unique integer to identify a sequencer.
     */
     function getLockerDetails(uint256 sequencerId)
        public
        view
        returns (
            uint256 amount,
            uint256 reward,
            uint256 activationBatch,
            uint256 deactivationBatch,
            address signer,
            uint256 _status
        )
    {
       
        ILockingPoolLocal.Status status;
        (amount,reward ,activationBatch,deactivationBatch , , ,signer ,status , ) = ILockingPoolLocal(lockingPool).sequencers(sequencerId);
        _status = uint256(status);
    }
}